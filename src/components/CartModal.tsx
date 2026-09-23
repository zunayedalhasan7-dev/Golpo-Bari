import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, ShoppingCart, CheckCircle2, ArrowRight } from "lucide-react";
import { CartItem } from "../types";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartModalProps) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bKash">("bKash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.book.price || 120) * item.quantity,
    0
  );
  const deliveryCharge = subtotal > 0 ? 60 : 0;
  const total = subtotal + (subtotal > 0 ? deliveryCharge : 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
      onClearCart();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#FAF8F5] w-full max-w-xl rounded-[28px] shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#0071E3]" />
              <h2 className="font-serif-bengali text-lg font-bold text-[#1D1D1F]">
                আপনার শপিং কার্ট ও অর্ডার
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/[0.05] text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-grow space-y-4">
            {step === "cart" && (
              <>
                {cartItems.length > 0 ? (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-[20px] border border-black/[0.05] flex items-center gap-4 shadow-sm"
                      >
                        <div className="w-14 h-18 rounded-[10px] overflow-hidden bg-stone-200 shrink-0">
                          {item.book.coverUrl &&
                          (item.book.coverUrl.startsWith("http") ||
                            item.book.coverUrl.startsWith("data:image") ||
                            (item.book.coverUrl.includes(".") && !item.book.coverUrl.includes("<svg"))) ? (
                            <img
                              src={item.book.coverUrl}
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-[10px]"
                              dangerouslySetInnerHTML={{ __html: item.book.coverUrl }}
                            />
                          )}
                        </div>

                        <div className="flex-grow space-y-1">
                          <h4 className="font-serif-bengali font-bold text-sm text-[#1D1D1F]">
                            {item.book.title}
                          </h4>
                          <p className="text-xs text-[#86868B] font-sans-bengali">
                            সংস্করণ: {item.edition === "digital" ? "ই-বুক (ডিজিটাল)" : "পেপারব্যাক (মুদ্রিত বই)"}
                          </p>
                          <p className="font-mono text-xs font-semibold text-[#0071E3]">
                            ৳{item.book.price || 120} × {item.quantity} = ৳{(item.book.price || 120) * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full bg-black/[0.05] flex items-center justify-center text-xs font-bold hover:bg-black/[0.1] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full bg-black/[0.05] flex items-center justify-center text-xs font-bold hover:bg-black/[0.1] cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full ml-2 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="bg-white p-5 rounded-[20px] border border-black/[0.05] space-y-2 text-xs font-sans-bengali mt-4">
                      <div className="flex justify-between text-[#86868B]">
                        <span>বইয়ের মূল্য:</span>
                        <span className="font-mono text-[#1D1D1F]">৳{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-[#86868B]">
                        <span>শিপিং / ডেলিভারি চার্জ:</span>
                        <span className="font-mono text-[#1D1D1F]">৳{deliveryCharge}</span>
                      </div>
                      <div className="pt-2 border-t border-black/[0.06] flex justify-between text-sm font-bold text-[#1D1D1F]">
                        <span>সর্বমোট প্রদেয়:</span>
                        <span className="font-mono text-[#0071E3] text-base">৳{total}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingCart className="w-12 h-12 text-[#86868B] mx-auto opacity-40" />
                    <p className="font-serif-bengali text-base font-bold text-[#1D1D1F]">
                      আপনার কার্ট খালি রয়েছে
                    </p>
                    <p className="text-xs text-[#86868B] font-sans-bengali">
                      লাইব্রেরি থেকে আপনার পছন্দের উপন্যাস কার্টে যোগ করুন।
                    </p>
                  </div>
                )}
              </>
            )}

            {step === "checkout" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="font-serif-bengali text-base font-bold text-[#1D1D1F]">
                  অর্ডারের বিবরণ ও ডেলিভারি ঠিকানা
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-sans-bengali font-semibold text-[#1D1D1F]">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: রাশেদুল ইসলাম"
                    className="w-full bg-white border border-black/[0.1] rounded-xl px-4 py-2.5 text-xs font-sans-bengali text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans-bengali font-semibold text-[#1D1D1F]">মোবাইল নম্বর (বিকাশ/যোগাযোগ)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full bg-white border border-black/[0.1] rounded-xl px-4 py-2.5 text-xs font-sans-bengali text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans-bengali font-semibold text-[#1D1D1F]">পূর্ণাঙ্গ ঠিকানা</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা/হোল্ডিং, রোড, থানা, জেলা"
                    className="w-full bg-white border border-black/[0.1] rounded-xl px-4 py-2 text-xs font-sans-bengali text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans-bengali font-semibold text-[#1D1D1F]">পেমেন্ট মাধ্যম</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bKash")}
                      className={`py-2.5 rounded-xl border text-xs font-sans-bengali font-medium transition-all ${
                        paymentMethod === "bKash"
                          ? "border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E]"
                          : "border-black/[0.1] bg-white text-[#1D1D1F]"
                      }`}
                    >
                      বিকাশ অনলাইন পেমেন্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`py-2.5 rounded-xl border text-xs font-sans-bengali font-medium transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3]"
                          : "border-black/[0.1] bg-white text-[#1D1D1F]"
                      }`}
                    >
                      ক্যাশ অন ডেলিভারি (COD)
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-[#34C759] mx-auto" />
                <h3 className="font-serif-bengali text-xl font-bold text-[#1D1D1F]">
                  আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
                </h3>
                <p className="text-xs text-[#86868B] font-sans-bengali max-w-sm mx-auto">
                  খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করে আপনার ঠিকানায় বই পৌঁছে দেবেন। ধন্যবাদ!
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-black/[0.06] bg-white flex items-center justify-between">
            {step === "cart" && (
              <>
                <button
                  onClick={onClose}
                  className="text-xs font-sans-bengali text-[#86868B] hover:text-[#1D1D1F]"
                >
                  কেনাকাটা চালিয়ে যান
                </button>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setStep("checkout")}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-sans-bengali font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>অর্ডার কনফার্ম করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {step === "checkout" && (
              <>
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs font-sans-bengali text-[#86868B] hover:text-[#1D1D1F]"
                >
                  কার্টে ফিরে যান
                </button>
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-sans-bengali font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "প্রসেসিং..." : `অর্ডার প্লেস করুন (৳${total})`}</span>
                </button>
              </>
            )}

            {step === "success" && (
              <button
                onClick={() => {
                  setStep("cart");
                  onClose();
                }}
                className="w-full bg-[#1D1D1F] text-white text-xs font-sans-bengali font-medium py-3 rounded-full cursor-pointer"
              >
                বন্ধ করুন
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
