import React, { MouseEvent } from "react";
import { Book } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Star, ShoppingCart, BookOpen, Clock, Layers, Calendar, Eye, Download, Sparkles, User, MessageSquare } from "lucide-react";

interface BookDetailsPageProps {
  book: Book;
  onBack: () => void;
  onRead: (book: Book) => void;
  onBuy: (book: Book) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
  vIsVip: boolean;
  unlockedBookIds: string[];
  currentUser: any;
  books: Book[];
  onSelectBookByRef: (book: Book) => void;
}

export default function BookDetailsPage({
  book,
  onBack,
  onRead,
  onBuy,
  isLoggedIn,
  onDownloadAuthNeeded,
  vIsVip,
  unlockedBookIds,
  currentUser,
  books,
  onSelectBookByRef,
}: BookDetailsPageProps) {
  
  // Checking readability status
  const isBookReadable = () => {
    if (!book.isPremium) return true;
    if (vIsVip) return true;
    return unlockedBookIds.includes(book.id);
  };

  // Simulated PDF load or fallback offline format generator download
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
    
    // Dynamic text compilation layout
    const fileContent = `================================================
  গল্পবাড়ি (GolpoBari) - প্রিমিয়াম সাহিত্য সংস্করণ
  উপন্যাস: ${book.title}
  লেখক: ${book.author}
  বিভাগ: ${book.genre}
  ------------------------------------------------
  
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
    link.download = `${book.titleEn ? book.titleEn.toLowerCase().replace(/\s+/g, "_") : "edition"}_book.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Find related books in the same genre or pricing category
  const relatedBooks = books
    .filter((b) => b.id !== book.id && (b.genre === book.genre || b.isPremium === book.isPremium))
    .slice(0, 4);

  return (
    <div className="w-full bg-brand-beige min-h-screen py-6 md:py-12" id="book-details-page-viewport">
      {/* Back button option and summary flow */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-brand-charcoal/70 hover:text-brand-charcoal transition-colors font-sans-bengali group border border-brand-gold/15 bg-white/40 py-2 px-4 rounded-full shadow-xs cursor-pointer"
          id="btn-back-to-catalog"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          ফিরে যান
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6" id="book-details-grid-wrapper">
        <div className="bg-white border border-brand-gold/15 rounded-3xl md:rounded-[36px] shadow-sm p-5 md:p-12 overflow-hidden flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Left Column: Cover and Quick Details */}
          <div className="w-full lg:w-2/5 flex flex-col items-center">
            <div className="w-60 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[430px] rounded-2xl md:rounded-3xl overflow-hidden border border-brand-gold/20 shadow-xl bg-brand-charcoal relative group transition-all duration-500 hover:shadow-2xl flex items-center justify-center">
              {book.coverUrl && (book.coverUrl.startsWith("http") || book.coverUrl.startsWith("data:image") || book.coverUrl.includes(".") && !book.coverUrl.includes("<svg")) ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  id="book-details-cover-image"
                />
              ) : (
                <div 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 flex items-center justify-center" 
                  dangerouslySetInnerHTML={{ __html: book.coverUrl }} 
                  id="book-details-cover-svg"
                />
              )}
              
              {book.isPremium && (
                <div className="absolute top-4 right-4 bg-brand-charcoal/90 border border-brand-gold/40 text-brand-gold font-bold px-3 py-1 rounded-full text-xs shadow-md backdrop-blur-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-brand-gold" />
                  ৳{book.price}
                </div>
              )}
            </div>

            {/* Microstats banner */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-8 border-y border-brand-gold/10 py-4 text-center font-sans-bengali">
              <div className="border-r border-brand-gold/10">
                <span className="block text-brand-gold font-bold text-sm flex items-center justify-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                  {book.rating || "5.0"}
                </span>
                <span className="text-[10px] text-brand-charcoal/40 font-medium">রেটিং</span>
              </div>
              <div className="border-r border-brand-gold/10">
                <span className="block text-brand-charcoal font-bold text-sm">
                  {book.views.toLocaleString("bn-BD")}
                </span>
                <span className="text-[10px] text-brand-charcoal/40 font-medium font-sans-bengali">পাঠক ভিউ</span>
              </div>
              <div>
                <span className="block text-brand-charcoal font-bold text-sm">
                  {book.pages} পৃষ্ঠা
                </span>
                <span className="text-[10px] text-brand-charcoal/40 font-medium">রচনাকাল</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Deep Synopsis & Actions */}
          <div className="w-full lg:w-3/5 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category tag */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-brand-gold/15 border border-brand-gold/35 text-brand-charcoal text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">
                  {book.genre}
                </span>
                {book.isPremium ? (
                  <span className="bg-brand-charcoal text-brand-gold text-[10px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                    প্রিমিয়াম সাহিত্য
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
                    বিনামূল্যে পাঠ্য
                  </span>
                )}
              </div>

              {/* Book title & author */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black font-serif-bengali text-brand-charcoal tracking-normal leading-tight">
                  {book.title}
                </h1>
                {book.titleEn && (
                  <p className="text-sm md:text-base font-medium font-sans text-brand-charcoal/40 italic">
                    {book.titleEn}
                  </p>
                )}
                <p className="text-sm md:text-base text-brand-charcoal/60 font-sans-bengali flex items-center gap-1.5 pt-1">
                  <User className="w-4 h-4 text-brand-gold" />
                  লেখক: <span className="text-brand-charcoal font-extrabold">{book.author}</span>
                </p>
              </div>

              {/* Deep Synopses content */}
              <div className="space-y-3 pt-2 border-t border-brand-gold/10">
                <h3 className="text-sm font-bold font-serif-bengali text-brand-gold-dark uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  উপন্যাসের মূল সারসংক্ষেপ ও সিনোপসিস
                </h3>
                <div className="text-sm md:text-base text-brand-charcoal/85 leading-relaxed font-sans-bengali space-y-4 font-light text-justify">
                  <p className="font-semibold italic text-brand-charcoal/70 bg-brand-beige/25 p-4 rounded-xl border border-brand-gold/5 leading-relaxed">
                    "{book.shortDesc}"
                  </p>
                  <p className="whitespace-pre-line pt-2">{book.longDesc}</p>
                </div>
              </div>

              {/* Extra Meta Grid for elegance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-beige/20 p-4 rounded-2xl border border-brand-gold/10 text-xs font-sans-bengali">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-brand-charcoal/60">পাঠের অনুমিত সময়:</span>
                  <span className="font-bold text-brand-charcoal">{book.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-brand-charcoal/60">অধ্যায়সমূহ:</span>
                  <span className="font-bold text-brand-charcoal">{book.chapters.length} টি পর্ব</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-brand-charcoal/60">প্রথম প্রকাশনা:</span>
                  <span className="font-bold text-brand-charcoal">{book.publishedDate || "মে ২০২৬"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-brand-charcoal/60">অর্গানিক রিডিং ভিউ:</span>
                  <span className="font-bold text-brand-charcoal">{book.views} বার পড়া হয়েছে</span>
                </div>
              </div>
            </div>

            {/* Bottom Operations Container */}
            <div className="mt-12 pt-6 border-t border-brand-gold/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full">
                {book.isPremium ? (
                  <>
                    {!vIsVip && (
                      <button
                        onClick={() => {
                          onBuy(book);
                        }}
                        className="flex-1 min-w-[140px] bg-gradient-to-r from-amber-500 to-brand-gold text-brand-charcoal font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-102 active:scale-98 shadow-[0_4px_20px_rgba(245,158,11,0.25)] border border-brand-gold/20 cursor-pointer text-xs md:text-sm"
                        id="details-vip-pass-btn"
                        title="ভিআইপি পাস দিয়ে পড়ুন"
                      >
                        <Star className="w-4 h-4 text-brand-charcoal fill-brand-charcoal" />
                        ভিআইপি পাস (৳২৯৯)
                      </button>
                    )}
                    
                    {!vIsVip && !unlockedBookIds.includes(book.id) && (
                      <button
                        onClick={() => {
                          onBuy(book);
                        }}
                        className="flex-1 min-w-[140px] bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(17,17,17,0.3)] cursor-pointer text-xs md:text-sm"
                        id="details-single-buy-btn"
                        title="শুধুমাত্র এই উপন্যাসটি কিনুন"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        কিনুন (৳{book.price})
                      </button>
                    )}
                    
                    <button
                      onClick={() => onRead(book)}
                      className="flex-1 min-w-[140px] bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(197,164,126,0.3)] cursor-pointer text-xs md:text-sm"
                      id="details-read-premium-btn"
                    >
                      <BookOpen className="w-4 h-4" />
                      উপন্যাসটি পড়ুন
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onRead(book)}
                    className="flex-[2] min-w-[140px] bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(17,17,17,0.3)] cursor-pointer text-xs md:text-sm"
                    id="details-read-free-btn"
                  >
                    <BookOpen className="w-4 h-4" />
                    উপন্যাসটি পড়ুন
                  </button>
                )}
                
                {isBookReadable() && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 min-w-[140px] bg-white border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-charcoal font-bold py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-xs md:text-sm"
                    id="details-download-pdf-btn"
                  >
                    <Download className="w-4 h-4" />
                    ডাউনলোড PDF
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Similar Books Section */}
        {relatedBooks.length > 0 && (
          <div className="mt-12 bg-white border border-brand-gold/15 p-6 md:p-10 rounded-3xl shadow-xs" id="details-related-books-container">
            <h3 className="text-xl md:text-2xl font-black font-serif-bengali text-brand-charcoal border-b border-brand-gold/10 pb-3 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" />
              এই লেখকের আরও অন্যান্য উপন্যাস
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((rb) => (
                <div 
                  key={rb.id} 
                  onClick={() => onSelectBookByRef(rb)}
                  className="space-y-3 cursor-pointer group flex flex-col justify-between"
                  id={`related-book-${rb.id}`}
                >
                  <div>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-brand-gold/10 shadow-sm relative group-hover:border-brand-gold/50 transition-colors flex items-center justify-center bg-brand-charcoal mb-3">
                      {rb.coverUrl && (rb.coverUrl.startsWith("http") || rb.coverUrl.startsWith("data:image") || rb.coverUrl.includes(".") && !rb.coverUrl.includes("<svg")) ? (
                        <img 
                          src={rb.coverUrl} 
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-all duration-500" 
                          alt={rb.title} 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div 
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-all duration-500" 
                          dangerouslySetInnerHTML={{ __html: rb.coverUrl }} 
                        />
                      )}
                    </div>
                    <span className="text-[10px] bg-brand-gold/10 font-bold px-2 py-0.5 rounded-full text-brand-charcoal/70">
                      {rb.genre}
                    </span>
                    <h4 className="text-sm md:text-base font-black font-serif-bengali text-brand-charcoal line-clamp-1 group-hover:text-brand-gold-dark mt-1 hover:underline transition-colors leading-snug">
                      {rb.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-sans-bengali text-brand-charcoal/50 pr-1">
                    <span>{rb.readTime}</span>
                    <span className="flex items-center gap-0.5 font-bold text-brand-gold">
                      <Star className="w-3.5 h-3.5 fill-brand-gold" />
                      {rb.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
