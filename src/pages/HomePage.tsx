import React from "react";
import { motion } from "motion/react";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { Book } from "../types";
import { NOVELIST_BIO, NOVELIST_AVATAR } from "../data";
import BookCard from "../components/BookCard";

interface HomePageProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onRead: (book: Book) => void;
  onBuy: (book: Book) => void;
  navigateToPage: (target: string) => void;
  authorBio: string;
}

export default function HomePage({
  books,
  onSelectBook,
  onRead,
  onBuy,
  navigateToPage,
  authorBio,
}: HomePageProps) {
  const featuredBook = books.find((b) => b.featured) || books[0];
  const recentBooks = books.slice(0, 12);

  return (
    <motion.div
      key="home-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-grow w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 pb-24 sm:pb-16 space-y-12 sm:space-y-16"
    >
      {/* Apple Books Expansive Hero Showcase */}
      <section className="w-full relative overflow-hidden pt-4 pb-8" id="home-hero">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#0071E3]/10 via-[#A17947]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] text-xs font-sans-bengali font-semibold text-[#86868B]">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>আজকের নির্বাচিত সাহিত্য</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-bengali font-bold text-[#1D1D1F] tracking-tight leading-[1.12]">
                শব্দের মায়াজালে <br />
                <span className="text-[#0071E3]">নতুন পৃথিবীর সন্ধান</span>
              </h1>
              <p className="text-base sm:text-lg text-[#86868B] font-sans-bengali font-normal leading-relaxed max-w-2xl">
                জুনায়েদ হাসানের সমস্ত প্রকাশিত ও অপ্রকাশিত উপন্যাস এক ছাদের নিচে। কোনো বিজ্ঞাপন বা বিভ্রান্তি নেই — কেবল নির্মল সাহিত্য ও নান্দনিক পাঠ অভিজ্ঞতা।
              </p>
            </div>

            {/* iOS Button Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => navigateToPage("read")}
                className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs sm:text-sm font-sans-bengali font-medium px-6 py-3.5 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(0,113,227,0.3)]"
                id="hero-cta-btn"
              >
                <BookOpen className="w-4 h-4" />
                <span>সম্পূর্ণ লাইব্রেরি দেখুন</span>
              </button>
              <button
                onClick={() => navigateToPage("premium")}
                className="bg-black/[0.05] hover:bg-black/[0.08] active:scale-95 text-[#1D1D1F] text-xs sm:text-sm font-sans-bengali font-medium px-6 py-3.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                id="hero-premium-btn"
              >
                <span>প্রিমিয়াম সংকলন</span>
                <ChevronRight className="w-4 h-4 text-[#86868B]" />
              </button>
            </div>
          </div>

          {/* Apple Books Spotlight Stand */}
          {featuredBook && (
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div
                onClick={() => onSelectBook(featuredBook)}
                className="group cursor-pointer w-full max-w-[280px] bg-white rounded-[24px] p-4 border border-black/[0.06] shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.14)] transition-all duration-300"
              >
                <div className="relative aspect-[3/4] w-full rounded-[16px] overflow-hidden bg-stone-200 mb-3.5 shadow-md">
                  {featuredBook.coverUrl &&
                  (featuredBook.coverUrl.startsWith("http") ||
                    featuredBook.coverUrl.startsWith("data:image") ||
                    (featuredBook.coverUrl.includes(".") && !featuredBook.coverUrl.includes("<svg"))) ? (
                    <img
                      src={featuredBook.coverUrl}
                      alt={featuredBook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: featuredBook.coverUrl }}
                    />
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-sans-bengali font-medium px-2.5 py-1 rounded-full border border-white/10">
                    স্পটলাইট
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#86868B] font-sans-bengali">{featuredBook.genre}</p>
                  <h3 className="font-serif-bengali text-base font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1">
                    {featuredBook.title}
                  </h3>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Apple Books Style Section Header & Full Screen Grid */}
      <section className="w-full" id="home-featured-books">
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="font-serif-bengali text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
              জনপ্রিয় উপন্যাসসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] font-sans-bengali mt-0.5">
              পাঠকদের পছন্দের তালিকার শীর্ষে থাকা সাহিত্য
            </p>
          </div>
          <button
            onClick={() => navigateToPage("read")}
            className="text-xs sm:text-sm font-sans-bengali font-semibold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {recentBooks.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onSelect={onSelectBook}
              onRead={onRead}
              onBuy={onBuy}
              isLoggedIn={true}
              onDownloadAuthNeeded={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Apple Style Author Note */}
      <section className="w-full py-10 px-6 sm:px-12 bg-black/[0.02] rounded-[32px] border border-black/[0.04]" id="home-about-me">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto shadow-md border-2 border-white">
            <img
              src={NOVELIST_AVATAR}
              alt="জুনায়েদ হাসান"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <p className="text-base sm:text-xl font-serif-bengali text-[#1D1D1F] leading-relaxed italic">
              "{authorBio || NOVELIST_BIO}"
            </p>
            <div>
              <p className="font-serif-bengali font-bold text-base text-[#1D1D1F]">
                জুনায়েদ হাসান
              </p>
              <p className="text-xs text-[#86868B] font-sans-bengali mt-0.5">
                কথাসাহিত্যিক
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
