import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../config/db";
import { Transaction } from "../../../models/Transaction";
import { bkashCreatePayment } from "../../../services/bkash-create-payment";
import { generateTransactionId } from "../../../lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, customerName, customerEmail, amount, itemType, itemId, itemName } = body;

    // Validate input payload
    if (!userId || !customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { error: "Missing required checkout parameters: userId, customerName, customerEmail, amount" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate unique transaction ID
    const transactionId = generateTransactionId();

    // Setup redirect callback URLs
    const baseUrl = process.env.CLIENT_URL || new URL(request.url).origin;
    const bKashCallbackUrl = `${baseUrl}/api/callback`;

    // 1. Create a payment on bKash
    console.log(`📡 Requesting bKash create session for txn ${transactionId}`);
    const bkashPayment = await bkashCreatePayment({
      amount: Number(amount),
      transactionId,
      payerEmail: customerEmail,
      callbackUrl: bKashCallbackUrl,
    });

    if (!bkashPayment || !bkashPayment.paymentID || !bkashPayment.bkashURL) {
      return NextResponse.json(
        { error: "bKash registration returned invalid session URL" },
        { status: 502 }
      );
    }

    // 2. Save pending transaction in MongoDB
    const pendingTxn = new Transaction({
      transactionId,
      paymentId: bkashPayment.paymentID,
      userId,
      customerName,
      customerEmail,
      amount: Number(amount),
      currency: "BDT",
      paymentMethod: "bKash",
      paymentStatus: "PENDING",
      bkashStatusCode: bkashPayment.statusCode,
      bkashStatusMessage: bkashPayment.statusMessage,
    });

    await pendingTxn.save();
    console.log(`💾 Transaction ${transactionId} saved in DB as PENDING.`);

    // 3. Return target bKash payment URL to user frontend
    return NextResponse.json({
      success: true,
      transactionId,
      paymentId: bkashPayment.paymentID,
      paymentUrl: bkashPayment.bkashURL,
    });

  } catch (error: any) {
    console.error("💥 Severe Exception in make-payment endpoint:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during make-payment initialization" },
      { status: 500 }
    );
  }
}
