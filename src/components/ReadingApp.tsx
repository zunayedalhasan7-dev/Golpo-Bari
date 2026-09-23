import React, { useState, useEffect, useRef } from "react";
import { Book } from "../types";
import { X, Bookmark, BookmarkCheck, Sun, Moon, ChevronLeft, ChevronRight, ListOrdered, Type } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReadingAppProps {
  book: Book;
  onClose: () => void;
}

export default function ReadingApp({ book, onClose }: ReadingAppProps) {
  // Theme state: "day" | "sepia" | "night"
  const [theme, setTheme] = useState<"day" | "sepia" | "night">("day");
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeChapter = book.chapters[currentChapterIndex] || book.chapters[0];

  useEffect(() => {
    const savedLastRead = localStorage.getItem(`gob_last_read_${book.id}`);
    if (savedLastRead) {
      setCurrentChapterIndex(parseInt(savedLastRead, 10) || 0);
    }
  }, [book.id]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`gob_bookmark_${book.id}`);
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setIsBookmarked(parsed.chapterIndex === currentChapterIndex);
      } catch {
        setIsBookmarked(false);
      }
    } else {
      setIsBookmarked(false);
    }
  }, [book.id, currentChapterIndex]);

  useEffect(() => {
    localStorage.setItem(`gob_last_read_${book.id}`, String(currentChapterIndex));
  }, [currentChapterIndex, book.id]);

  const toggleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem(`gob_bookmark_${book.id}`);
      setIsBookmarked(false);
    } else {
      const bookmarkData = {
        bookId: book.id,
        chapterIndex: currentChapterIndex,
        chapterTitle: activeChapter.title,
        timestamp: Date.now(),
      };
      localStorage.setItem(`gob_bookmark_${book.id}`, JSON.stringify(bookmarkData));
      setIsBookmarked(true);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }
  };

  const nextChapter = () => {
    if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }
  };

  // Apple Books exact theme palettes
  const themeStyles = {
    day: {
      bg: "bg-[#FFFFFF]",
      text: "text-[#1D1D1F]",
      nav: "bg-white/80 border-black/[0.06]",
      panel: "bg-white border-black/[0.06] shadow-[0_12px_32px_rgba(0,0,0,0.1)]",
      muted: "text-[#86868B]",
      buttonBg: "bg-black/[0.05] hover:bg-black/[0.08]",
    },
    sepia: {
      bg: "bg-[#F7F1E5]",
      text: "text-[#3C3228]",
      nav: "bg-[#F7F1E5]/80 border-[#E8DCC8]",
      panel: "bg-[#F0E6D2] border-[#E8DCC8] shadow-[0_12px_32px_rgba(60,50,40,0.1)]",
      muted: "text-[#8A7968]",
      buttonBg: "bg-black/[0.05] hover:bg-black/[0.08]",
    },
    night: {
      bg: "bg-[#1C1C1E]",
      text: "text-[#E5E5EA]",
      nav: "bg-[#1C1C1E]/80 border-white/[0.08]",
      panel: "bg-[#2C2C2E] border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.5)]",
      muted: "text-[#8E8E93]",
      buttonBg: "bg-white/[0.08] hover:bg-white/[0.12]",
    },
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 ${themeStyles[theme].bg} flex flex-col`}
      id="reader-container"
    >
      {/* Apple Books Frosted Header */}
      <header
        className={`sticky top-0 z-40 border-b px-4 md:px-8 py-3 backdrop-blur-2xl flex items-center justify-between transition-colors ${themeStyles[theme].nav}`}
        id="reader-nav"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-full active:scale-95 transition-all cursor-pointer ${themeStyles[theme].buttonBg}`}
            id="reader-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className={`font-serif-bengali font-bold text-sm leading-none ${themeStyles[theme].text}`}>
              {book.title}
            </h2>
            <p className={`text-[10px] font-sans-bengali mt-0.5 ${themeStyles[theme].muted}`}>
              {activeChapter.title}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Typography Settings Menu Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full active:scale-95 transition-all cursor-pointer ${
              showSettings ? "bg-[#0071E3] text-white" : themeStyles[theme].buttonBg
            }`}
            title="ফন্ট ও থিম"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-full active:scale-95 transition-all cursor-pointer ${themeStyles[theme].buttonBg}`}
            title={isBookmarked ? "বুকমার্ক সংরক্ষিত" : "বুকমার্ক করুন"}
            id="reader-bookmark-btn"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-[#0071E3] fill-[#0071E3]" />
            ) : (
              <Bookmark className="w-4 h-4 opacity-70" />
            )}
          </button>

          {/* Chapters Table */}
          <button
            onClick={() => setShowChaptersMenu(true)}
            className={`p-2 rounded-full active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${themeStyles[theme].buttonBg}`}
            title="সূচিপত্র"
            id="reader-chapters-btn"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Apple Books AA Settings Floating Card */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className={`fixed top-16 right-4 sm:right-8 z-50 w-72 rounded-[20px] p-4 border ${themeStyles[theme].panel} ${themeStyles[theme].text}`}
          >
            <div className="space-y-4 text-xs font-sans-bengali">
              {/* Themes Selector */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${themeStyles[theme].muted}`}>
                  থিম
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full">
                  <button
                    onClick={() => setTheme("day")}
                    className={`py-1.5 rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      theme === "day" ? "bg-white text-black shadow-sm font-semibold" : "opacity-70"
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>দিবা</span>
                  </button>
                  <button
                    onClick={() => setTheme("sepia")}
                    className={`py-1.5 rounded-full transition-all cursor-pointer ${
                      theme === "sepia" ? "bg-[#3C3228] text-[#FAF8F5] shadow-sm font-semibold" : "opacity-70"
                    }`}
                  >
                    সেপিয়া
                  </button>
                  <button
                    onClick={() => setTheme("night")}
                    className={`py-1.5 rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      theme === "night" ? "bg-[#1C1C1E] text-white shadow-sm font-semibold" : "opacity-70"
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>রাত্রি</span>
                  </button>
                </div>
              </div>

              {/* Font Type */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${themeStyles[theme].muted}`}>
                  টাইপোগ্রাফি
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsSerif(true)}
                    className={`py-1.5 rounded-full border transition-all cursor-pointer ${
                      isSerif ? "border-[#0071E3] text-[#0071E3] font-semibold" : "border-black/[0.08] dark:border-white/[0.08]"
                    }`}
                  >
                    সেরিফ (Serif)
                  </button>
                  <button
                    onClick={() => setIsSerif(false)}
                    className={`py-1.5 rounded-full border transition-all cursor-pointer ${
                      !isSerif ? "border-[#0071E3] text-[#0071E3] font-semibold" : "border-black/[0.08] dark:border-white/[0.08]"
                    }`}
                  >
                    সানস (Sans)
                  </button>
                </div>
              </div>

              {/* Font Size Stepper */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${themeStyles[theme].muted}`}>
                  ফন্ট সাইজ
                </span>
                <div className="flex items-center justify-between bg-black/[0.04] dark:bg-white/[0.06] p-1.5 rounded-full">
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-black/30 shadow-xs flex items-center justify-center font-bold text-sm cursor-pointer active:scale-95"
                  >
                    A-
                  </button>
                  <span className="font-mono text-xs">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-black/30 shadow-xs flex items-center justify-center font-bold text-sm cursor-pointer active:scale-95"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reading Article */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-8 md:py-14 flex flex-col justify-between">
        
        {/* Article Content */}
        <article
          className={`leading-[2.2] md:leading-[2.4] outline-none select-text ${
            isSerif ? "font-serif-bengali" : "font-sans-bengali"
          } ${themeStyles[theme].text}`}
          style={{ fontSize: `${fontSize}px` }}
          id="reader-text-canvas"
        >
          {/* Chapter Header */}
          <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-6 mb-10 text-center">
            <p className="text-xs font-mono text-[#0071E3] uppercase tracking-wider mb-2 font-semibold">
              অধ্যায় {currentChapterIndex + 1}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {activeChapter.title}
            </h1>
          </div>

          {/* Paragraphs */}
          <div className="space-y-6">
            {activeChapter.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="indent-6">
                {para}
              </p>
            ))}
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08] pt-8 mt-16 pb-12 font-sans-bengali text-xs">
          <button
            onClick={prevChapter}
            disabled={currentChapterIndex === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer ${themeStyles[theme].buttonBg}`}
            id="reader-prev-chapter-btn"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী অধ্যায়</span>
          </button>

          <span className={`font-mono text-xs font-semibold ${themeStyles[theme].muted}`}>
            {Math.round(((currentChapterIndex + 1) / book.chapters.length) * 100)}%
          </span>

          <button
            onClick={nextChapter}
            disabled={currentChapterIndex === book.chapters.length - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer ${themeStyles[theme].buttonBg}`}
            id="reader-next-chapter-btn"
          >
            <span>পরবর্তী অধ্যায়</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Apple Books Style Chapter Sheet */}
      <AnimatePresence>
        {showChaptersMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChaptersMenu(false)}
              className="fixed inset-0 z-[100] bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className={`fixed top-0 right-0 bottom-0 z-[101] w-full max-w-xs p-6 shadow-2xl flex flex-col justify-between ${
                theme === "night" ? "bg-[#1C1C1E] text-white" : "bg-white text-[#1D1D1F]"
              }`}
              id="reader-chapters-drawer"
            >
              <div>
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-4">
                  <h3 className="font-serif-bengali font-bold text-base">সূচিপত্র</h3>
                  <button
                    onClick={() => setShowChaptersMenu(false)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[75vh] pr-1">
                  {book.chapters.map((ch, idx) => {
                    const isSelected = idx === currentChapterIndex;
                    return (
                      <button
                        key={ch.id || idx}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setShowChaptersMenu(false);
                          if (containerRef.current) containerRef.current.scrollTop = 0;
                        }}
                        className={`w-full text-left p-3 rounded-[12px] text-xs font-sans-bengali flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0071E3] text-white font-semibold"
                            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="line-clamp-1">{ch.title}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono pl-2">
                            চলতি
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3 text-center">
                <p className="text-[10px] text-[#86868B] font-sans-bengali">
                  {book.title} · {book.author}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
