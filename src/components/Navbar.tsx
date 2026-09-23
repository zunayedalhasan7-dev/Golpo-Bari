import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Award, Home, MoreVertical, X, Sparkles } from "lucide-react";

interface NavbarProps {
  navigateToPage: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ navigateToPage, currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { id: "home", label: "হোম", icon: Home },
    { id: "read", label: "উপন্যাস", icon: BookOpen },
    { id: "premium", label: "সংগ্রহ", icon: Award },
  ];

  return (
    <>
      {/* Borderless Clean Navbar */}
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-xl px-6 py-4 md:px-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => navigateToPage("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-charcoal text-brand-gold flex items-center justify-center font-serif-bengali font-bold text-lg shadow-sm">
              গ
            </div>
            <span className="font-serif-bengali font-bold text-lg md:text-xl text-brand-charcoal tracking-tight">
              গল্পবাড়ি
            </span>
          </div>

          {/* Desktop Navigation - Borderless */}
          <nav className="hidden md:flex items-center space-x-1 bg-neutral-200/55 p-1 rounded-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`px-5 py-2 text-xs font-semibold font-sans-bengali transition-all rounded-full flex items-center gap-2 cursor-pointer ${
                    isActive ? "bg-brand-charcoal text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-charcoal"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => navigateToPage("read")}
              className="bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-charcoal text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              পড়ুন
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Menu */}
      <div className="fixed bottom-6 right-6 md:hidden z-50 flex flex-col items-end gap-3" ref={menuRef}>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-brand-charcoal text-white rounded-2xl shadow-xl p-2 w-44 space-y-1"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateToPage(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${
                      isActive ? "bg-brand-gold text-brand-charcoal font-bold" : "hover:bg-white/10 text-neutral-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 rounded-full bg-brand-charcoal text-brand-gold flex items-center justify-center shadow-lg cursor-pointer"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
}
