import { useState, useEffect } from "react";
import { BENGALI_QUOTES } from "../data";

interface FooterProps {
  onPageChange: (page: string) => void;
  onAdminOpen: () => void;
}

export default function Footer({ onPageChange, onAdminOpen }: FooterProps) {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * BENGALI_QUOTES.length);
    setQuote(BENGALI_QUOTES[idx]);
  }, []);

  return (
    <footer
      className="border-t border-black/[0.06] bg-[#F5F5F7] text-[#1D1D1F] mt-16 sm:mt-24 pb-20 sm:pb-10 transition-colors w-full"
      id="main-app-footer"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-2.5 text-left" id="footer-brand-section">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => onPageChange("home")}
            >
              <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-black/[0.05] p-1 flex items-center justify-center">
                <img
                  src="https://i.postimg.cc/KvdBcxT5/daabb61c-d861-4bce-97f3-a904a33af923-Photoroom.png"
                  alt="গল্পবাড়ি"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-serif-bengali text-base font-bold text-[#1D1D1F]">
                গল্পবাড়ি
              </span>
            </div>
            <p className="text-xs text-[#86868B] font-sans-bengali leading-relaxed max-w-sm">
              বাংলা কথাসাহিত্যের এক মার্জিত ও নান্দনিক ডিজিটাল সংগ্রহশালা। জুনায়েদ হাসানের সমস্ত প্রকাশিত উপন্যাস ও গল্পসম্ভার।
            </p>
          </div>

          {/* Literary Quote */}
          <div className="md:col-span-4 space-y-2 text-left" id="footer-quote-section">
            <h4 className="text-[11px] font-sans-bengali font-semibold text-[#86868B] uppercase tracking-wider">
              সাহিত্য ভাবনা
            </h4>
            <p className="text-xs font-serif-bengali text-[#48484A] leading-relaxed italic">
              "{quote || BENGALI_QUOTES[0]}"
            </p>
            <p className="text-[10px] text-[#86868B] font-sans-bengali">
              — জুনায়েদ হাসান
            </p>
          </div>

          {/* Quick Index */}
          <div className="md:col-span-3 space-y-2 text-left" id="footer-links-section">
            <h4 className="text-[11px] font-sans-bengali font-semibold text-[#86868B] uppercase tracking-wider">
              সূচিপত্র
            </h4>
            <ul className="space-y-1.5 text-xs font-sans-bengali text-[#48484A]">
              <li>
                <button
                  onClick={() => onPageChange("home")}
                  className="hover:text-[#0071E3] transition-colors cursor-pointer"
                >
                  মূল পাতা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange("read")}
                  className="hover:text-[#0071E3] transition-colors cursor-pointer"
                >
                  উপন্যাস সমগ্র
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange("premium")}
                  className="hover:text-[#0071E3] transition-colors cursor-pointer"
                >
                  প্রিমিয়াম সংকলন
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="border-t border-black/[0.06] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#86868B] font-sans-bengali gap-2">
          <p>© ২০২৬ গল্পবাড়ি। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onAdminOpen}
              className="hover:text-[#0071E3] transition-colors cursor-pointer"
            >
              লেখক প্যানেল
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
