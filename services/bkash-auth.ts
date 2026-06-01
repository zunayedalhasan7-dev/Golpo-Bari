import { Token } from "../models/Token";
import { connectToDatabase } from "../config/db";

// Global cache fallback in case MongoDB is inactive or disabled
let memoryTokenCache: {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
} | null = null;

/**
 * Validates the bKash credentials in environment variables
 */
export function validateEnvCredentials() {
  const required = ["USER_NAME", "PASSWORD", "APP_KEY", "APP_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const msg = `⚠️ bKash credentials missing: ${missing.join(", ")}. Please configure them in your .env.example/environment settings.`;
    console.error(msg);
    return false;
  }
  return true;
}

/**
 * Retrieve a valid bKash access token, using caching logic
 */
export async function getBkashToken(): Promise<string> {
  if (!validateEnvCredentials()) {
    throw new Error("Missing required bKash environment variables");
  }

  const BASE_URL = process.env.BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
  const USER_NAME = process.env.USER_NAME;
  const PASSWORD = process.env.PASSWORD;
  const APP_KEY = process.env.APP_KEY;
  const APP_SECRET = process.env.APP_SECRET;

  // 1. Try to read from db or global memory cache
  const now = new Date();
  
  // Safely try connection
  let dbActive = false;
  try {
    const conn = await connectToDatabase();
    if (conn) dbActive = true;
  } catch (err) {
    console.warn("MongoDB is offline, managing token state in-memory.");
  }

  if (dbActive) {
    try {
      const dbToken = await Token.findOne().sort({ createdAt: -1 });
      if (dbToken && new Date(dbToken.expiresAt).getTime() > now.getTime() + 60000) {
        console.log("🪙 Retrieved cached bKash token from MongoDB.");
        return dbToken.accessToken;
      }
    } catch (e) {
      console.error("Failed to query Token model from MongoDB:", e);
    }
  }

  // Check memory cache
  if (memoryTokenCache && memoryTokenCache.expiresAt.getTime() > now.getTime() + 60000) {
    console.log("🪙 Retrieved cached bKash token from server memory cache.");
    return memoryTokenCache.accessToken;
  }

  console.log("🔄 Cached token expired or not found. Granting new token from bKash...");

  // 2. Fetch from bKash Tokenized Grant URL
  // e.g., POST ${BASE_URL}/tokenized/checkout/token/grant
  const grantUrl = `${BASE_URL}/tokenized/checkout/token/grant`;
  
  try {
    const response = await fetch(grantUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: USER_NAME || "",
        password: PASSWORD || "",
      },
      body: JSON.stringify({
        app_key: APP_KEY,
        app_secret: APP_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Auth Error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      id_token?: string;
      accessToken?: string;
      refresh_token?: string;
      refreshToken?: string;
      expires_in?: number;
      statusCode?: string;
      statusMessage?: string;
    };

    // Note: bKash may return response payload with success status codes or error messages
    if (data.statusCode && data.statusCode !== "0000") {
      throw new Error(`bKash Grant Token failed: [${data.statusCode}] ${data.statusMessage}`);
    }

    const acToken = data.id_token || data.accessToken;
    const refToken = data.refresh_token || data.refreshToken;
    const expiresIn = data.expires_in || 3500;

    if (!acToken || !refToken) {
      throw new Error("Invalid response format: Access token or refresh token is missing.");
    }

    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    // Save back to db or memory
    if (dbActive) {
      try {
        // Overwrite or create
        await Token.deleteMany({});
        await Token.create({
          accessToken: acToken,
          refreshToken: refToken,
          expiresAt: expiryDate,
        });
        console.log("💾 Saved new token inside MongoDB.");
      } catch (dbErr) {
        console.error("Failed to persist token inside MongoDB:", dbErr);
      }
    }

    // Always maintain in server memory
    memoryTokenCache = {
      accessToken: acToken,
      refreshToken: refToken,
      expiresAt: expiryDate,
    };

    console.log("✅ Successfully granted new token from bKash!");
    return acToken;
  } catch (err: any) {
    console.error("❌ Failed to contact bKash Token grant endpoint:", err);
    throw err;
  }
}
