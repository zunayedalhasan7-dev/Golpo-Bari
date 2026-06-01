import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../config/db";
import { Transaction } from "../../../models/Transaction";
import { bkashExecutePayment } from "../../../services/bkash-execute-payment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentID = searchParams.get("paymentID");
    const status = searchParams.get("status");

    console.log(`📥 bKash callback hit with paymentID: ${paymentID}, status: ${status}`);

    const baseUrl = process.env.CLIENT_URL || new URL(request.url).origin;

    if (!paymentID) {
      console.warn("⚠️ Invalid bKash callback call without paymentID");
      return NextResponse.redirect(`${baseUrl}/cancel?error=invalid_callback`);
    }

    await connectToDatabase();

    // Find our matching record
    const transaction = await Transaction.findOne({ paymentId: paymentID });
    if (!transaction) {
      console.error(`❌ Transaction not found in MongoDB for paymentId: ${paymentID}`);
      return NextResponse.redirect(`${baseUrl}/cancel?error=transaction_not_found`);
    }

    // Check callback status from bKash
    if (status === "cancel") {
      console.log(`❌ bKash Payment ID ${paymentID} cancelled by user.`);
      transaction.paymentStatus = "CANCELLED";
      transaction.bkashStatusCode = "2020";
      transaction.bkashStatusMessage = "User cancelled the payment process";
      await transaction.save();
      return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}`);
    }

    if (status === "failure" || status !== "success") {
      console.log(`❌ bKash Payment ID ${paymentID} failed or didn't succeed. Status: ${status}`);
      transaction.paymentStatus = "FAILED";
      transaction.bkashStatusCode = "2022";
      transaction.bkashStatusMessage = `Payment failed with bKash callback status: ${status}`;
      await transaction.save();
      return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}&error=payment_failed`);
    }

    // If status is success, we must securely execute the payment on bKash servers
    console.log(`🚀 Securely executing payment on bKash: ${paymentID}`);
    const executeResult = await bkashExecutePayment(paymentID);

    if (executeResult && (executeResult.statusCode === "0000" || executeResult.transactionStatus === "Completed")) {
      console.log(`🎉 Payment successfully verified & executed by bKash! ID: ${paymentID}`);
      
      // Update transaction in MongoDB
      transaction.paymentStatus = "SUCCESS";
      transaction.transactionId = executeResult.trxID || transaction.transactionId; // Map official bKash trxID
      transaction.bkashStatusCode = executeResult.statusCode;
      transaction.bkashStatusMessage = executeResult.statusMessage;
      await transaction.save();

      // Redirect user to the clean React/Next success page
      return NextResponse.redirect(
        `${baseUrl}/success?paymentID=${paymentID}&trxID=${executeResult.trxID}&amount=${executeResult.amount}`
      );
    } else {
      console.warn(`⚠️ bKash payment execution returned an failure code: [${executeResult?.statusCode}]`);
      
      transaction.paymentStatus = "FAILED";
      transaction.bkashStatusCode = executeResult?.statusCode || "4004";
      transaction.bkashStatusMessage = executeResult?.statusMessage || "Verification failed during execute step";
      await transaction.save();

      return NextResponse.redirect(
        `${baseUrl}/cancel?paymentID=${paymentID}&error=${executeResult?.statusMessage || "execution_failed"}`
      );
    }

  } catch (error: any) {
    console.error("💥 Severe Exception in callback response handler:", error);
    const baseUrl = process.env.CLIENT_URL || new URL(request.url).origin;
    return NextResponse.redirect(`${baseUrl}/cancel?error=server_callback_exception`);
  }
}
