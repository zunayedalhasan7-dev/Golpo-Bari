import mongoose, { Schema } from "mongoose";
import { IBkashToken } from "../types/payment";

const TokenSchema = new Schema<IBkashToken>(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Delete the exact model if already compiled (for HMR or test restarts)
export const Token = mongoose.models.Token || mongoose.model<IBkashToken>("Token", TokenSchema);
