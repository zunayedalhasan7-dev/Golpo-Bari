import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Star, Heart, ChevronRight } from 'lucide-react';
import { Book } from '../types';
import { NOVELIST_BIO, NOVELIST_AVATAR } from '../data';

interface HomePageProps {
  books: Book[];
  setSelectedBook: (book: Book | null) => void;
  navigateToPage: (target: string) => void;
}

export default function HomePage({ books, setSelectedBook, navigateToPage }: HomePageProps) {
  return (
    <motion.div
      key="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow"
    >
      <section className="relative px-6 py-12 md:px-12 md:py-24 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 md:space-y-8" id="hero-typography">
            <div className="space-y-1.5">
              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-brand-gold font-sans">গল্পবাড়ি ডিজিটাল প্রকাশনালয়</span>
              <h2 className="text-4xl md:text-6.5xl font-extrabold font-serif-bengali text-brand-charcoal tracking-tight leading-tight md:leading-[1.1]">
                গল্পের ভেতরেই <br />
                <span className="relative inline-block text-brand-charcoal">
                  আরেকটি পৃথিবী
                  <svg className="absolute left-0 right-0 -bottom-2 h-1.5 text-brand-gold/40 fill-brand-gold/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5 Q50,0 0,5" />
                  </svg>
                </span>
              </h2>
            </div>
            <p className="text-sm md:text-base text-brand-charcoal/65 leading-relaxed font-sans-bengali font-light max-w-lg">
              জুনায়েদ হাসান -এর মায়াবী কল্পলোক থেকে উৎসারিত অসাধারণ সব বাংলা আখ্যান। বৃষ্টির দুপুর, নিস্তব্ধ জলমেদুর কদমবন আর অন্ধকার ছায়াবৃক্ষের রহস্যের ঘ্রাণ নিতে আজই পা রাখুন আপনার প্রিয় উপন্যাসের পাতায়।
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => navigateToPage("/read")}
                className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold border border-brand-gold/40 text-xs font-bold py-3.5 px-7 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-brand-gold" />
                পড়া শুরু করুন
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
