'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NextPaymentSuccess() {
  const [paymentID, setPaymentID] = useState("");
  const [trxID, setTrxID] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPaymentID(params.get("paymentID") || "");
      setTrxID(params.get("trxID") || "");
      setAmount(params.get("amount") || "");
    }
  }, []);

  return (
    <main className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-950 border border-green-500/20 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto text-green-500 text-2xl">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white font-serif">পেমেন্ট সফল সম্পন্ন হয়েছে!</h1>
          <p className="text-xs text-stone-400">গল্পবাড়ি ডিজিটাল প্ল্যাটফর্মে আপনার লেনদেনটি সুরক্ষিতভাবে সম্পন্ন হয়েছে।</p>
        </div>

        <div className="bg-stone-900 rounded-2xl p-4 divide-y divide-stone-800 text-left text-xs space-y-3">
          <div className="pt-0 flex justify-between">
            <span className="text-stone-500">লেনদেনের ধরণ</span>
            <span className="text-stone-200 font-bold">বিকাশ পেমেন্ট</span>
          </div>
          <div className="pt-3 flex justify-between">
            <span className="text-stone-500">পেমেন্ট আইডি (PaymentID)</span>
            <span className="text-stone-200 font-mono tracking-tight">{paymentID || "N/A"}</span>
          </div>
          <div className="pt-3 flex justify-between">
            <span className="text-stone-500">ট্রান্সজেকশন আইডি (TrxID)</span>
            <span className="text-green-400 font-mono font-bold tracking-wider">{trxID || "VERIFIED"}</span>
          </div>
          <div className="pt-3 flex justify-between">
            <span className="text-stone-500">পরিমাণ (Amount)</span>
            <span className="text-white font-mono font-black">৳{amount || "০.০০"}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/" className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all">
            মূল পাতায় ফিরে যান
          </Link>
        </div>
      </div>
    </main>
  );
}
