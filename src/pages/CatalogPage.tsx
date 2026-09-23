import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, BookOpen } from "lucide-react";
import { Book } from "../types";
import BookCard from "../components/BookCard";

interface CatalogPageProps {
  books: Book[];
  filteredBooks: Book[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  genreFilter: string;
  setGenreFilter: (g: string) => void;
  priceFilter: string;
  setPriceFilter: (p: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  onSelectBook: (b: Book) => void;
  onRead: (b: Book) => void;
  onBuy: (b: Book) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
}

export default function CatalogPage({
  filteredBooks,
  searchQuery,
  setSearchQuery,
  priceFilter,
  setPriceFilter,
  onSelectBook,
  onRead,
  onBuy,
  isLoggedIn,
  onDownloadAuthNeeded,
}: CatalogPageProps) {
  const filterTabs = ["সব", "ফ্রি", "প্রিমিয়াম"];

  return (
    <motion.div
      key="catalog-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto flex-grow w-full px-5 sm:px-8 py-8 sm:py-12 pb-24 sm:pb-16"
    >
      <div className="mb-8">
        <h1 className="font-serif-bengali text-2xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight">
          লাইব্রেরি ও উপন্যাস সম্ভার
        </h1>
        <p className="text-xs sm:text-sm text-[#86868B] font-sans-bengali mt-1">
          সকল প্রকাশিত উপন্যাস, গল্পগাথা ও সাহিত্যের সংগ্রহশালা
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="inline-flex p-1 bg-black/[0.04] rounded-full self-start sm:self-auto border border-black/[0.05]">
          {filterTabs.map((tab) => {
            const isActive = priceFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setPriceFilter(tab)}
                className={`relative px-4 py-1.5 text-xs font-sans-bengali font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-[#1D1D1F] bg-white shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {tab === "সব"
                  ? "সকল উপন্যাস"
                  : tab === "ফ্রি"
                  ? "ফ্রি পঠন"
                  : "বিশেষ সংস্করণ"}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="উপন্যাস অনুসন্ধান..."
            className="w-full bg-white border border-black/[0.08] rounded-full py-2 pl-9 pr-8 text-xs font-sans-bengali text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] p-0.5 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredBooks.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                onSelect={onSelectBook}
                onRead={onRead}
                onBuy={onBuy}
                isLoggedIn={isLoggedIn}
                onDownloadAuthNeeded={onDownloadAuthNeeded}
              />
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center space-y-3 bg-white rounded-[24px] border border-black/[0.06] p-8 max-w-lg mx-auto shadow-sm">
            <BookOpen className="w-10 h-10 text-[#86868B] mx-auto opacity-50" />
            <p className="font-serif-bengali text-base font-bold text-[#1D1D1F]">
              কোনো উপন্যাস খুঁজে পাওয়া যায়নি
            </p>
            <p className="text-xs text-[#86868B] font-sans-bengali">
              অন্য কোনো কিওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা ফিল্টার রিসেট করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setPriceFilter("সব");
              }}
              className="mt-2 text-xs font-sans-bengali font-semibold text-[#0071E3] hover:underline cursor-pointer"
            >
              সব রিসেট করুন
            </button>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
