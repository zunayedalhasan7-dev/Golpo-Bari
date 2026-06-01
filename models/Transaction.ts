import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../types/payment";

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    paymentId: { type: String, required: true },
    userId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    paymentMethod: { type: String, default: "bKash" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    bkashStatusCode: { type: String },
    bkashStatusMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
