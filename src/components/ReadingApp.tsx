import { useState, useEffect, useRef } from "react";
import { Book } from "../types";
import { X, Bookmark, BookmarkCheck, Sun, Moon, Sparkles, Sliders, ChevronLeft, ChevronRight, ListOrdered } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReadingAppProps {
  book: Book;
  onClose: () => void;
}

export default function ReadingApp({ book, onClose }: ReadingAppProps) {
  // Theme state: "day" | "sepia" | "night"
  const [theme, setTheme] = useState<"day" | "sepia" | "night">("sepia");
  const [fontSize, setFontSize] = useState<number>(18); // default in pixels
  const [isSerif, setIsSerif] = useState<boolean>(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChapter = book.chapters[currentChapterIndex] || book.chapters[0];

  const [isUIVisible, setIsUIVisible] = useState<boolean>(true);

  // Load bookmarks
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`gob_bookmark_${book.id}`);
    if (savedBookmarks) {
      const parsed = JSON.parse(savedBookmarks);
      if (parsed.chapterIndex !== undefined) {
        // If same chapter, mark as bookmarked
        if (parsed.chapterIndex === currentChapterIndex) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
      }
    } else {
      setIsBookmarked(false);
    }
  }, [book.id, currentChapterIndex]);

  // Handle bookmark toggle
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

  // Switch chapters
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

  // Styling maps based on theme
  const themeStyles = {
    day: {
      bg: "bg-brand-beige",
      text: "text-brand-charcoal",
      panel: "bg-white border-brand-gold/10",
      btnActive: "bg-brand-gold text-brand-charcoal",
    },
    sepia: {
      bg: "bg-brand-sepia",
      text: "text-[rgb(74,53,30)]",
      panel: "bg-[rgb(236,224,208)] border-[rgba(197,164,126,0.25)]",
      btnActive: "bg-[rgb(197,164,126)] text-[rgb(74,53,30)] font-semibold",
    },
    night: {
      bg: "bg-[rgb(18,18,18)]",
      text: "text-brand-beige/85",
      panel: "bg-[rgb(28,28,28)] border-brand-gold/5",
      btnActive: "bg-brand-gold text-brand-charcoal",
    },
  };

  return (
    <div ref={containerRef} className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-500 ease-out ${themeStyles[theme].bg} flex flex-col`} id="reader-container">
      {/* Top sticky controls */}
      <nav className={`sticky top-0 z-50 border-b p-4 backdrop-blur-md flex items-center justify-between ${
        theme === "night" ? "bg-[rgb(18,18,18)]/90 border-brand-gold/10" : "bg-brand-beige/90 border-brand-gold/10"
      }`} id="reader-nav">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose}
            className={`p-2.5 rounded-full hover:bg-neutral-500/10 transition-colors duration-300 ${theme === "night" ? "text-white" : "text-brand-charcoal"}`}
            id="reader-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className={`font-bold font-serif-bengali text-sm md:text-base leading-tight ${theme === "night" ? "text-white" : "text-brand-charcoal"}`}>
              {book.title}
            </h2>
            <p className="text-[10px] md:text-xs text-brand-gold font-sans-bengali font-light">
              অধ্যায় {currentChapterIndex + 1}/{book.chapters.length}: {activeChapter.title}
            </p>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2.5 rounded-full transition-colors duration-300 ${
              isBookmarked ? "text-brand-gold" : "text-neutral-500/50 hover:text-brand-gold"
            }`}
            title={isBookmarked ? "বুকমার্ক করা হয়েছে" : "বুকমার্ক করুন"}
            id="reader-bookmark-btn"
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-brand-gold text-brand-gold" /> : <Bookmark className="w-5 h-5" />}
          </button>

          {/* Chapter drawer trigger */}
          <button
            onClick={() => setShowChaptersMenu(true)}
            className={`p-2.5 rounded-full hover:bg-neutral-500/10 transition-colors duration-300 flex items-center gap-1 ${
              theme === "night" ? "text-brand-gold hover:text-white" : "text-brand-gold hover:text-brand-charcoal"
            }`}
            title="সূচিপত্র"
            id="reader-chapters-btn"
          >
            <ListOrdered className="w-5 h-5" />
            <span className="text-xs font-semibold font-sans-bengali hidden md:inline">সূচিপত্র</span>
          </button>
        </div>
      </nav>

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 md:px-8 md:py-16 flex flex-col justify-between">
        {/* Settings Bar */}
        <div className={`p-4 rounded-2xl mb-8 border transition-all duration-300 flex flex-wrap gap-4 items-center justify-between shadow-sm ${themeStyles[theme].panel}`} id="reader-quick-settings">
          <div className="flex items-center gap-2">
            <Sliders className={`w-4 h-4 ${theme === "night" ? "text-neutral-400" : "text-brand-charcoal/50"}`} />
            <span className={`text-xs font-semibold font-sans-bengali ${theme === "night" ? "text-neutral-300" : "text-brand-charcoal/70"}`}>পাঠকীয় সুবিধা:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Selectors */}
            <div className="flex items-center gap-1 border border-brand-gold/20 p-0.5 rounded-xl bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setTheme("day")}
                className={`text-xs font-sans-bengali px-2.5 py-1 rounded-lg transition-colors ${
                  theme === "day" ? "bg-white text-brand-charcoal shadow-sm" : "text-neutral-500 hover:text-brand-charcoal"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`text-xs font-semibold font-sans-bengali px-2.5 py-1 rounded-lg transition-colors ${
                  theme === "sepia" ? "bg-[rgb(197,164,126)] text-[rgb(74,53,30)] shadow-sm" : "text-neutral-500 hover:text-brand-charcoal"
                }`}
              >
                সেপিয়া
              </button>
              <button
                onClick={() => setTheme("night")}
                className={`text-xs font-sans-bengali px-2.5 py-1 rounded-lg transition-colors ${
                  theme === "night" ? "bg-neutral-800 text-white shadow-xs" : "text-neutral-500 hover:text-brand-charcoal"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Type toggler */}
            <button
              onClick={() => setIsSerif(!isSerif)}
              className={`text-xs font-sans-bengali border border-brand-gold/25 px-2.5 py-1.5 rounded-xl hover:bg-neutral-500/10 transition-colors ${
                theme === "night" ? "text-white" : "text-brand-charcoal"
              }`}
            >
              {isSerif ? "অভিনব ফন্ট (Serif)" : "আধুনিক ফন্ট (Sans)"}
            </button>

            {/* Font Size Tuners */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className={`w-8 h-8 rounded-full border border-brand-gold/15 flex items-center justify-center font-bold font-sans text-xs hover:bg-neutral-500/10 ${
                  theme === "night" ? "text-white hover:text-brand-gold" : "text-brand-charcoal"
                }`}
              >
                অ-
              </button>
              <span className={`text-xs font-mono font-semibold px-1 ${theme === "night" ? "text-neutral-400" : "text-brand-charcoal/60"}`}>{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className={`w-8 h-8 rounded-full border border-brand-gold/15 flex items-center justify-center font-bold font-sans text-xs hover:bg-neutral-500/10 ${
                  theme === "night" ? "text-white hover:text-brand-gold" : "text-brand-charcoal"
                }`}
              >
                অ+
              </button>
            </div>
          </div>
        </div>
        
        {/* Real-time Content Typography Canvas */}
        <article 
          className={`leading-[2.1] md:leading-[2.3] outline-none text-justify ${
            isSerif ? "font-serif-bengali" : "font-sans-bengali"
          } ${themeStyles[theme].text}`}
          style={{ fontSize: `${fontSize}px` }}
          id="reader-text-canvas"
        >
          {/* Chapter Header */}
          <div className="border-b border-brand-gold/15 pb-6 mb-10 text-center">
            <p className="text-xs uppercase tracking-widest text-brand-gold font-bold mb-2">অধ্যায় - {currentChapterIndex + 1}</p>
            <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mt-1">
              {activeChapter.title}
            </h1>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-4" />
          </div>

          {/* Chapter Paragraphs */}
          <div className="space-y-8 select-text">
            {activeChapter.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="indent-8 relative">
                {para}
              </p>
            ))}
          </div>
        </article>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-brand-gold/15 pt-8 mt-16 pb-12" id="reader-foot-navigation">
          <button
            onClick={prevChapter}
            disabled={currentChapterIndex === 0}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border border-brand-gold/15 text-xs font-semibold font-sans-bengali transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
              theme === "night" ? "text-white hover:border-brand-gold hover:text-brand-gold" : "text-brand-charcoal hover:bg-white"
            }`}
            id="reader-prev-chapter-btn"
          >
            <ChevronLeft className="w-4 h-4" />
            পূর্ববর্তী
          </button>

          <span className={`text-xs font-semibold font-sans-bengali ${theme === "night" ? "text-neutral-400" : "text-brand-charcoal/60"}`}>
            {Math.round(((currentChapterIndex + 1) / book.chapters.length) * 100)}%
          </span>

          <button
            onClick={nextChapter}
            disabled={currentChapterIndex === book.chapters.length - 1}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border border-brand-gold/15 text-xs font-semibold font-sans-bengali transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
              theme === "night" ? "text-white hover:border-brand-gold hover:text-brand-gold" : "text-brand-charcoal hover:bg-white"
            }`}
            id="reader-next-chapter-btn"
          >
            পরবর্তী
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Slide-out Chapters Panel Menu Drawer */}
      <AnimatePresence>
        {showChaptersMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChaptersMenu(false)}
              className="fixed inset-0 z-[100] bg-black"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={`fixed top-0 right-0 bottom-0 z-[101] w-full max-w-xs p-6 shadow-2xl flex flex-col justify-between ${
                theme === "night" ? "bg-[rgb(24,24,24)] text-white" : "bg-brand-beige text-brand-charcoal"
              }`}
              id="reader-chapters-drawer"
            >
              <div>
                <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4 mb-6">
                  <h3 className="text-lg font-bold font-serif-bengali flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    সূচিপত্র
                  </h3>
                  <button 
                    onClick={() => setShowChaptersMenu(false)}
                    className="p-1 rounded-full hover:bg-neutral-500/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                  {book.chapters.map((ch, idx) => {
                    const isSelected = idx === currentChapterIndex;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setShowChaptersMenu(false);
                          if (containerRef.current) containerRef.current.scrollTop = 0;
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-sans-bengali flex items-center justify-between transition-colors ${
                          isSelected 
                            ? "bg-brand-gold border-brand-gold text-brand-charcoal font-semibold"
                            : theme === "night"
                              ? "border-neutral-800 hover:bg-neutral-800"
                              : "border-brand-gold/10 hover:bg-white shadow-xs"
                        }`}
                        id={`reader-drawer-ch-${idx}`}
                      >
                        <span className="line-clamp-1">{ch.title}</span>
                        {isSelected && <span className="text-[9px] uppercase tracking-wider bg-brand-charcoal text-brand-gold px-1.5 py-0.5 rounded font-bold">পঠনরত</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-brand-gold/10 pt-4 text-center">
                <p className="text-[10px] text-brand-gold/70 font-sans-bengali font-light">
                  {book.title} • {book.author}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
