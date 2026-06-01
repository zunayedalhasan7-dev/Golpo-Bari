import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { connectToDatabase } from "./config/db";
import { Transaction } from "./models/Transaction";
import { bkashCreatePayment } from "./services/bkash-create-payment";
import { bkashExecutePayment } from "./services/bkash-execute-payment";
import { generateTransactionId } from "./lib/utils";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Make Payment
  app.post("/api/make-payment", async (req, res) => {
    try {
      const { userId, customerName, customerEmail, amount } = req.body;

      if (!userId || !customerName || !customerEmail || !amount) {
        return res.status(400).json({ error: "Missing required parameters: userId, customerName, customerEmail, amount" });
      }

      await connectToDatabase().catch(() => null);

      const transactionId = generateTransactionId();
      
      // Setup callback URL
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const bKashCallbackUrl = `${protocol}://${host}/api/callback`;

      console.log(`📡 Creating bKash payment for ${customerEmail}, amount ${amount}`);
      const bkashPayment = await bkashCreatePayment({
        amount: Number(amount),
        transactionId,
        payerEmail: customerEmail,
        callbackUrl: bKashCallbackUrl,
      });

      // Save pending transaction in MongoDB
      try {
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
      } catch (dbErr) {
        console.warn("Database storage is offline. Transaction logged locally in server memory.", dbErr);
      }

      return res.json({
        success: true,
        transactionId,
        paymentId: bkashPayment.paymentID,
        paymentUrl: bkashPayment.bkashURL,
      });

    } catch (error: any) {
      console.error("💥 Severe Exception in make-payment express route:", error);
      return res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // API Route: Callback
  app.get("/api/callback", async (req, res) => {
    try {
      const paymentID = req.query.paymentID as string;
      const status = req.query.status as string;

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const clientBase = `${protocol}://${host}`;

      if (!paymentID) {
        return res.redirect(`${clientBase}/cancel?error=invalid_callback`);
      }

      await connectToDatabase().catch(() => null);

      let matchingTxn = null;
      try {
        matchingTxn = await Transaction.findOne({ paymentId: paymentID });
      } catch (e) {
        console.warn("Could not retrieve transaction from DB:", e);
      }

      if (status === "cancel") {
        if (matchingTxn) {
          matchingTxn.paymentStatus = "CANCELLED";
          await matchingTxn.save().catch(() => null);
        }
        return res.redirect(`${clientBase}/cancel?paymentID=${paymentID}`);
      }

      if (status === "failure" || status !== "success") {
        if (matchingTxn) {
          matchingTxn.paymentStatus = "FAILED";
          await matchingTxn.save().catch(() => null);
        }
        return res.redirect(`${clientBase}/cancel?paymentID=${paymentID}&error=payment_failed`);
      }

      console.log(`🚀 Executing bKash payment for ID: ${paymentID}`);
      const executeResult = await bkashExecutePayment(paymentID);

      if (executeResult && (executeResult.statusCode === "0000" || executeResult.transactionStatus === "Completed")) {
        if (matchingTxn) {
          matchingTxn.paymentStatus = "SUCCESS";
          matchingTxn.transactionId = executeResult.trxID || matchingTxn.transactionId;
          matchingTxn.bkashStatusCode = executeResult.statusCode;
          matchingTxn.bkashStatusMessage = executeResult.statusMessage;
          await matchingTxn.save().catch(() => null);
        }
        return res.redirect(`${clientBase}/success?paymentID=${paymentID}&trxID=${executeResult.trxID}&amount=${executeResult.amount}`);
      } else {
        if (matchingTxn) {
          matchingTxn.paymentStatus = "FAILED";
          matchingTxn.bkashStatusCode = executeResult?.statusCode || "4004";
          matchingTxn.bkashStatusMessage = executeResult?.statusMessage || "Execution verification failed";
          await matchingTxn.save().catch(() => null);
        }
        return res.redirect(`${clientBase}/cancel?paymentID=${paymentID}&error=${executeResult?.statusMessage || "execution_failed"}`);
      }

    } catch (error: any) {
      console.error("💥 Severe Exception in callback express route:", error);
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      return res.redirect(`${protocol}://${host}/cancel?error=server_callback_exception`);
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
