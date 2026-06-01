'use client';

import React, { useState } from "react";
import { formatTaka } from "../lib/utils";

export default function NextPaymentHome() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [amount, setAmount] = useState(299); // default 299 for subscription
  const [purchaseType, setPurchaseType] = useState<"membership" | "book">("membership");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!customerName || !customerEmail || !amount) {
      setErrorMessage("দয়া করে আপনার নাম, ইমেইল এবং পেমেন্ট পরিমাণ সঠিকভাবে প্রদান করুন।");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/make-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: `usr_${Date.now()}`,
          customerName,
          customerEmail,
          amount,
          purchaseType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || "বিকাশ পেমেন্ট সেশন তৈরি করতে ব্যর্থ হয়েছে।");
      }

      // Redirect user to secure bKash payment gateway
      window.location.href = data.paymentUrl;
      
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "হিসাব নিকাশ করার সময় কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-950 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <img src="https://i.postimg.cc/mD8ZJ2n4/bkash-logo-transparent.png" alt="bKash" className="h-12 mx-auto object-contain" />
          <h1 className="text-2xl font-black text-white font-serif tracking-tight">গল্পবাড়ি পেমেন্ট পোর্টাল</h1>
          <p className="text-xs text-amber-500/80 font-medium">নিরাপদ ও সিনেমাটিক উপায়ে প্রিমিয়াম কথাসাহিত্য উপভোগ করুন</p>
        </div>

        {errorMessage && (
          <div className="bg-red-950/40 border border-red-500/40 p-3 rounded-xl text-red-400 text-xs text-center font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handlePayNow} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400">আপনার নাম</label>
            <input
              type="text"
              required
              placeholder="যেমন: জুনায়েদ হাসান"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl py-2 px-3 text-sm text-stone-100 placeholder:text-stone-600 transition-colors focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400">আপনার ইমেইল</label>
            <input
              type="email"
              required
              placeholder="name@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl py-2 px-3 text-sm text-stone-100 placeholder:text-stone-600 transition-colors focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setPurchaseType("membership"); setAmount(299); }}
              className={`p-3 rounded-xl border text-center transition-all ${
                purchaseType === "membership"
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                  : "bg-stone-900/50 border-stone-800 text-stone-400"
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wide">Subscription</div>
              <div className="text-lg font-mono">৳২৯৯</div>
              <div className="text-[9px] mt-0.5">ভিআইপি লাইফটাইম পাস</div>
            </button>

            <button
              type="button"
              onClick={() => { setPurchaseType("book"); setAmount(120); }}
              className={`p-3 rounded-xl border text-center transition-all ${
                purchaseType === "book"
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                  : "bg-stone-900/50 border-stone-800 text-stone-400"
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wide">Single Book</div>
              <div className="text-lg font-mono">৳১২০</div>
              <div className="text-[9px] mt-0.5">প্রিমিয়াম উপন্যাস কিনুন</div>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E2136E] hover:bg-[#c40e5d] text-white py-3 rounded-xl font-bold transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>অপেক্ষা করুন...</span>
                </>
              ) : (
                <span>বিকাশ দিয়ে পে করুন ({formatTaka(amount)})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
