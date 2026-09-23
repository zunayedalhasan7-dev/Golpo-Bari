import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import BookCard from '../components/BookCard';

interface PremiumPageProps {
  books: any[];
  onSelectBook: (b: any) => void;
  onReadBook: (b: any) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
}

export default function PremiumPage({ books, onSelectBook, onReadBook, isLoggedIn, onDownloadAuthNeeded }: PremiumPageProps) {
  return (
    <motion.div
      key="premium-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 max-w-5xl mx-auto w-full px-6 py-12"
    >
      <div className="bg-white rounded-3xl p-8 mb-10 text-center md:text-left shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase text-brand-gold flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            বিশেষ মাস্টারপিস সংগ্রহ
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-serif-bengali text-brand-charcoal">
            সব উপন্যাস <span className="text-brand-gold">বিনামূল্যে</span> পড়ুন
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 font-sans-bengali font-light max-w-xl">
            কোনো পেমেন্ট ছাড়াই যেকোনো বই উপভোগ করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSelect={onSelectBook}
            onRead={onReadBook}
            isLoggedIn={isLoggedIn}
            onDownloadAuthNeeded={onDownloadAuthNeeded}
          />
        ))}
      </div>
    </motion.div>
  );
}
