import { useState, useEffect } from "react";
import { BENGALI_QUOTES } from "../data";
import { Heart, Globe, Feather, Award, Coffee, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface FooterProps {
  onPageChange: (page: string) => void;
  onAdminOpen: () => void;
}

export default function Footer({ onPageChange, onAdminOpen }: FooterProps) {
  const [quote, setQuote] = useState("");

  // Cycle a beautiful literary quote on mount
  useEffect(() => {
    const idx = Math.floor(Math.random() * BENGALI_QUOTES.length);
    setQuote(BENGALI_QUOTES[idx]);
  }, []);

  return (
    <footer 
      className="bg-brand-charcoal text-brand-beige border-t border-brand-gold/15 mt-8 sm:mt-16 pt-6 pb-12 sm:pt-12 sm:pb-12 px-4 md:px-12 relative overflow-hidden"
      id="main-app-footer"
    >
      {/* Decorative top beige overlay gradient */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16">
        {/* About column */}
        <div className="md:col-span-5 space-y-2" id="footer-brand-section">
          <div className="flex items-center cursor-pointer" onClick={() => onPageChange("home")}>
            <img
              src="https://i.postimg.cc/KvdBcxT5/daabb61c-d861-4bce-97f3-a904a33af923-Photoroom.png"
              alt="গল্পবাড়ি"
              className="w-20 h-20 md:w-28 md:h-28 object-contain my-[-10px]"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-[11px] sm:text-xs text-brand-beige/65 leading-relaxed font-sans-bengali font-light max-w-sm">
            গল্পবাড়ি হলো বাংলা কথাসাহিত্যের এক নান্দনিক ও সিনেমাটিক ডিজিটাল স্বর্গরাজ্য। এখানে আমাদের সময়ের অন্যতম প্রধান জনপ্রিয় কথাসাহিত্যিক জুনায়েদ হাসান সাহেবের সমস্ত উপন্যাস, গল্পগাথা ও অপ্রকাশিত রোমাঞ্চ এক ছাদের নিচে ডিজিটাল ও ফিজিক্যাল সংস্করণে পরিবেশিত হয়।
          </p>

          {/* Social icons */}
          <div className="flex items-center space-x-2.5 pt-1" id="footer-social-links">
            <a href="#" className="w-7 h-7 rounded-full border border-brand-gold/15 hover:border-brand-gold/60 text-brand-beige hover:text-brand-gold flex items-center justify-center transition-colors duration-300 bg-white/5" title="Goodreads">
              <BookOpen className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-7 h-7 rounded-full border border-brand-gold/15 hover:border-brand-gold/60 text-brand-beige hover:text-brand-gold flex items-center justify-center transition-colors duration-300 bg-white/5" title="Medium Publication">
              <Feather className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-7 h-7 rounded-full border border-brand-gold/15 hover:border-brand-gold/60 text-brand-beige hover:text-brand-gold flex items-center justify-center transition-colors duration-300 bg-white/5" title="Personal Blog">
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Cinematic Literary Quote */}
        <div className="md:col-span-4 space-y-3" id="footer-quote-section">
          <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-gold font-bold">আজকের সাহিত্যের উক্তি</h4>
          <blockquote className="border-l-2 border-brand-gold/40 pl-3.5 py-0.5">
            <p className="text-xs sm:text-sm font-serif-bengali text-brand-beige/80 leading-relaxed font-light">
              "{quote || BENGALI_QUOTES[0]}"
            </p>
            <cite className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-gold mt-1.5 font-sans font-semibold">
              — জুনায়েদ হাসান
            </cite>
          </blockquote>
        </div>

        {/* Navigation Menus */}
        <div className="md:col-span-3 space-y-2" id="footer-links-section">
          <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-gold font-bold">সাহিত্য সূচী</h4>
          <ul className="space-y-1.5 text-[11px] sm:text-xs font-sans-bengali text-brand-beige/65 font-light">
            <li>
              <button onClick={() => onPageChange("home")} className="hover:text-brand-gold hover:underline transition-all cursor-pointer">গল্পবাড়ি হোম</button>
            </li>
            <li>
              <button onClick={() => onPageChange("read")} className="hover:text-brand-gold hover:underline transition-all cursor-pointer">অনলাইন পড়ুন</button>
            </li>
            <li>
              <button onClick={() => onPageChange("premium")} className="hover:text-brand-gold hover:underline transition-all cursor-pointer">প্রিমিয়াম সাহিত্যসমূহ</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Credit Section */}
      <div className="max-w-7xl mx-auto border-t border-brand-gold/10 mt-6 sm:mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-brand-beige/45 font-sans-bengali gap-2.5">
        <p>কপিরাইট © ২০২৬ গল্পবাড়ি। জুনায়েদ হাসান কর্তৃক সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex items-center gap-1.5">
          <span>সাহিত্যরস ছড়িয়ে দিতে সচেষ্ট</span>
          <Heart className="w-3 h-3 text-brand-gold fill-brand-gold" />
          <span>দ্বারা নির্মিত</span>
        </div>
      </div>
    </footer>
  );
}
