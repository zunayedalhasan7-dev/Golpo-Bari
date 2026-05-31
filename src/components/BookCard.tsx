import React, { MouseEvent } from "react";
import { Book } from "../types";
import { motion } from "motion/react";
import { BookOpen, AlertCircle, ShoppingCart, Eye, Star, Download } from "lucide-react";

interface BookCardProps {
  key?: string | number;
  book: Book;
  onSelect: (book: Book) => void;
  onRead: (book: Book) => void;
  onBuy: (book: Book) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
}

export default function BookCard({ book, onSelect, onRead, onBuy, isLoggedIn, onDownloadAuthNeeded }: BookCardProps) {
  // Beautiful interactive handler for downloading
  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      onDownloadAuthNeeded();
      return;
    }
    
    // Aesthetic simulated dynamic text file creation!
    const fileContent = `================================================
  গল্পবাড়ি (GolpoBari) - প্রিমিয়াম সাহিত্য সংস্করণ
  উপন্যাস: ${book.title}
  লেখক: ${book.author}
  বিভাগ: ${book.genre}
  ================================================
  
  ${book.longDesc}
  
  ------------------------------------------------
  ${book.chapters.map((ch, idx) => `\nঅধ্যায় ${idx + 1}: ${ch.title}\n\n${ch.content}\n`).join("\n")}
  
  ------------------------------------------------
  পড়ার জন্য ধন্যবাদ! এই বইটি গল্পবাড়ি (GolpoBari) থেকে ডাউনলোড করা হয়েছে।
  কপিরাইট © জুনায়েদ হাসান। সকল স্বত্ব সংরক্ষিত।
  ================================================`;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${book.titleEn.toLowerCase().replace(/\s+/g, "_")}_edition.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={() => onSelect(book)}
      className="group cursor-pointer bg-white border border-brand-gold/15 rounded-xl md:rounded-2xl p-2.5 max-sm:p-2 sm:p-4 md:p-5 flex flex-col justify-between card-hover-glow transition-all duration-300"
      id={`book-card-${book.id}`}
    >
      <div>
        {/* Cover Artwork Container */}
        <div className="relative overflow-hidden rounded-lg md:rounded-xl aspect-[3/4] mb-3 md:mb-5 bg-brand-sepia shadow-sm group-hover:shadow-md transition-all duration-300">
          {/* Inject safe SVG directly */}
          <div 
            className="w-full h-full object-cover transform motion-safe:group-hover:scale-105 transition-transform duration-500 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: book.coverUrl }}
          />

          {/* Premium/Free badge */}
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex gap-1">
            {book.isPremium ? (
              <span className="bg-brand-charcoal border border-brand-gold/40 text-brand-gold text-[8px] sm:text-[11px] font-bold font-sans-bengali px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full shadow-lg flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 text-brand-gold fill-brand-gold" />
                ৳{book.price}
              </span>
            ) : (
              <span className="bg-brand-gold/90 text-brand-charcoal text-[8px] sm:text-[11px] font-bold font-sans-bengali px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full shadow-lg">
                ফ্রি
              </span>
            )}
          </div>

          {/* Elegant overlay on hover */}
          <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-brand-beige text-brand-charcoal px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[9px] sm:text-xs font-semibold font-sans-bengali tracking-wide flex items-center gap-1 sm:gap-1.5 shadow-lg border border-brand-gold/20"
            >
              <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-gold" />
              বিস্তারিত
            </motion.div>
          </div>
        </div>

        {/* Book Details */}
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-[9px] sm:text-xs text-brand-charcoal/40 font-mono">
            <span>{book.genre}</span>
            <div className="flex items-center gap-0.5 text-brand-gold font-sans-bengali">
              <Star className="w-2.5 h-2.5 text-brand-gold fill-brand-gold" />
              <span>{book.rating}</span>
            </div>
          </div>
          
          <h3 className="text-xs sm:text-sm md:text-xl font-bold font-serif-bengali text-brand-charcoal group-hover:text-brand-gold-dark transition-colors duration-300 leading-snug line-clamp-1 sm:line-clamp-2">
            {book.title}
          </h3>
          
          <p className="text-[10px] sm:text-xs text-brand-charcoal/50 font-sans-bengali">
            লেখক: {book.author}
          </p>
          
          <p className="hidden sm:block text-xs text-brand-charcoal/60 leading-relaxed font-sans-bengali line-clamp-3 mt-2 font-light">
            {book.shortDesc}
          </p>
        </div>
      </div>

      <div className="mt-3 sm:mt-5 pt-2 sm:pt-4 border-t border-brand-gold/10">
        {/* Statistics or visual markers */}
        <div className="flex items-center justify-between mb-2 sm:mb-4 text-[9px] sm:text-[11px] font-medium text-brand-charcoal/40 font-sans-bengali">
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {book.views.toLocaleString("bn-BD")} বার
          </span>
          <span>{book.readTime}</span>
        </div>

        {/* Dynamic CTA button strip */}
        <div className="flex items-center gap-1 sm:gap-2">
          {book.isPremium ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy(book);
                }}
                className="flex-1 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold border border-brand-gold/30 hover:border-brand-gold text-[9px] sm:text-xs font-semibold py-1 md:py-2 px-1 sm:px-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1 transition-all duration-300"
                id={`btn-buy-${book.id}`}
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                কিনুন
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(book);
                }}
                className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal hover:text-white text-[9px] sm:text-xs font-semibold py-1 md:py-2 px-1 sm:px-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1 transition-all duration-300"
                id={`btn-read-${book.id}`}
              >
                <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                পড়ুন
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(book);
                }}
                className="flex-1 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-[9px] sm:text-xs font-semibold py-1.5 md:py-2 px-2 sm:px-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1 transition-all duration-300"
                id={`btn-read-free-${book.id}`}
              >
                <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-gold" />
                পড়ুন
              </button>
              <button
                onClick={handleDownload}
                className="bg-brand-sepia hover:bg-brand-gold/15 text-brand-charcoal p-1.5 md:p-2 rounded-lg md:rounded-xl flex items-center justify-center transition-colors duration-300 border border-brand-gold/10"
                title="ডাউনলোড বিবরণী"
                id={`btn-download-${book.id}`}
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-charcoal/75 group-hover:text-brand-charcoal" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
