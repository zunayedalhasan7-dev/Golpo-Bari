import React, { MouseEvent } from "react";
import { Book } from "../types";
import { motion } from "motion/react";
import { BookOpen, Eye, Star, Download } from "lucide-react";

interface BookCardProps {
  key?: string | number;
  book: Book;
  onSelect: (book: Book) => void;
  onRead: (book: Book) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
}

export default function BookCard({ book, onSelect, onRead, isLoggedIn, onDownloadAuthNeeded }: BookCardProps) {
  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      onDownloadAuthNeeded();
      return;
    }

    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank");
      return;
    }
    
    const fileContent = `================================================
  গল্পবাড়ি - সাহিত্য সংস্করণ
  উপন্যাস: ${book.title}
  লেখক: ${book.author}
  ------------------------------------------------
  ${book.shortDesc}
  ------------------------------------------------`;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${book.titleEn ? book.titleEn.toLowerCase().replace(/\s+/g, "_") : "story"}_edition.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      onClick={() => onSelect(book)}
      className="group cursor-pointer bg-white rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 shadow-2xs"
    >
      <div>
        {/* Cover Container - Zero Borders */}
        <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-4 bg-brand-sepia shadow-2xs group-hover:shadow-md transition-all duration-300 flex items-center justify-center">
          {book.coverUrl && (book.coverUrl.startsWith("http") || book.coverUrl.startsWith("data:image") || book.coverUrl.includes(".") && !book.coverUrl.includes("<svg")) ? (
            <img 
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transform motion-safe:group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div 
              className="w-full h-full object-cover transform motion-safe:group-hover:scale-105 transition-transform duration-500 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: book.coverUrl }}
            />
          )}

          {/* Minimalist Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-brand-charcoal text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
              বিনামূল্যে
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white text-brand-charcoal px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
              পড়ুন
            </div>
          </div>
        </div>

        {/* Book Details - Clean & Minimal text */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>{book.genre}</span>
            <div className="flex items-center gap-1 text-brand-gold font-bold">
              <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
              <span>{book.rating}</span>
            </div>
          </div>
          
          <h3 className="text-sm md:text-base font-bold text-brand-charcoal group-hover:text-brand-gold-dark transition-colors line-clamp-1">
            {book.title}
          </h3>
          
          <p className="text-xs text-neutral-500">
            {book.author}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3">
        <div className="flex items-center justify-between mb-3 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {book.views.toLocaleString("bn-BD")} বার
          </span>
          <span>{book.readTime}</span>
        </div>

        {/* Action Buttons - Zero Borders */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(book);
            }}
            className="flex-1 bg-brand-charcoal hover:bg-black text-brand-gold text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
            পড়ুন
          </button>
          <button
            onClick={handleDownload}
            className="bg-neutral-100 hover:bg-neutral-200 text-brand-charcoal p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            title="ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5 text-brand-charcoal/75" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
