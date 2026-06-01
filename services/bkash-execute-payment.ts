import { getBkashToken } from "./bkash-auth";
import { BkashExecutePaymentResponse } from "../types/payment";

/**
 * Executes a pending payment session upon checkout return redirection
 */
export async function bkashExecutePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
  const token = await getBkashToken();
  const BASE_URL = process.env.BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
  const APP_KEY = process.env.APP_KEY;

  const executeUrl = `${BASE_URL}/tokenized/checkout/execute`;

  console.log(`📡 Sending bKash Execute Request for PaymentID: ${paymentID}`);

  try {
    const response = await fetch(executeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": APP_KEY || "",
      },
      body: JSON.stringify({ paymentID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Execute API Error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json() as BkashExecutePaymentResponse;

    console.log(`📝 bKash Execute API Response:`, JSON.stringify(data, null, 2));
    return data;
  } catch (err: any) {
    console.error("❌ Error inside bkashExecutePayment:", err);
    throw err;
  }
}
