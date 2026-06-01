import { getBkashToken } from "./bkash-auth";
import { BkashCreatePaymentResponse } from "../types/payment";

interface CreatePaymentParams {
  amount: number;
  transactionId: string;
  payerEmail: string;
  callbackUrl?: string;
}

/**
 * Initiates a payment session with bKash and gets details back with the payment checkout URL
 */
export async function bkashCreatePayment(params: CreatePaymentParams): Promise<BkashCreatePaymentResponse> {
  const token = await getBkashToken();
  const BASE_URL = process.env.BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
  const APP_KEY = process.env.APP_KEY;

  const bKashCallbackUrl = params.callbackUrl || `${process.env.CLIENT_URL || "http://localhost:3000"}/api/callback`;

  // bKash Create Payment API Body
  const payload = {
    mode: "0011", // checkout mode
    payerReference: params.payerEmail.substring(0, 30), // Limits length to fit bKash criteria
    callbackURL: bKashCallbackUrl,
    amount: String(params.amount),
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: params.transactionId,
  };

  const createUrl = `${BASE_URL}/tokenized/checkout/create`;

  console.log(`📦 Creating bKash payment with payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": APP_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Create Payment Service Error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json() as BkashCreatePaymentResponse;

    if (data.statusCode && data.statusCode !== "0000") {
      throw new Error(`bKash Create Payment failed: [${data.statusCode}] ${data.statusMessage}`);
    }

    console.log(`✅ bKash Payment session created successfully! PaymentID: ${data.paymentID}`);
    return data;
  } catch (err: any) {
    console.error("❌ Error inside bkashCreatePayment:", err);
    throw err;
  }
}
