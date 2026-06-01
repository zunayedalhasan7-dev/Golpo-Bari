'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NextPaymentCancel() {
  const [paymentID, setPaymentID] = useState("");
  const [errorReason, setErrorReason] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPaymentID(params.get("paymentID") || "");
      setErrorReason(params.get("error") || "");
    }
  }, []);

  return (
    <main className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-950 border border-red-500/20 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl font-bold">
          ✕
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white font-serif">পেমেন্ট বাতিল বা ব্যর্থ হয়েছে!</h1>
          <p className="text-xs text-stone-400">
            {errorReason === "invalid_callback" 
              ? "অবৈধ পেমেন্ট যাচাইকরণ লিঙ্ক। দয়া করে সঠিক লিঙ্ক অনুসরণ করুন।" 
              : "বিকাশ পেমেন্ট সম্পাদন করা যায়নি বা ব্যবহারকারী কর্তৃক বাতিল হয়েছে।"}
          </p>
        </div>

        {paymentID && (
          <div className="bg-stone-900 rounded-xl p-3 text-left text-xs font-mono text-stone-400 flex justify-between">
            <span>PaymentID:</span>
            <span className="text-stone-300 font-bold">{paymentID}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link href="/" className="bg-[#E2136E] hover:bg-[#c40e5d] text-white font-bold py-3 px-4 rounded-xl transition-all">
            আবার চেষ্টা করুন
          </Link>
          <Link href="/" className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-3 px-4 rounded-xl transition-all">
            মূল পাতা
          </Link>
        </div>
      </div>
    </main>
  );
}
