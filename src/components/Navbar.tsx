import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Award, Home, Search, ShieldAlert, Heart, User, LogOut, MoreVertical, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  navigateToPage: (page: string) => void;
  currentPage: string;
  vIsVip?: boolean;
  onVipCheckout?: () => void;
}

export default function Navbar({ navigateToPage, currentPage, vIsVip = false, onVipCheckout }: NavbarProps) {
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

  // Desktop header items
  const menuItems = [
    { id: "home", label: "হোম", icon: Home },
    { id: "read", label: "পড়ুন", icon: BookOpen },
    { id: "premium", label: "প্রিমিয়াম", icon: Award },
  ];

  return (
    <>
      {/* Premium Desktop Navbar */}
      <header className="sticky top-0 z-40 bg-brand-beige/80 backdrop-blur-md border-b border-brand-gold/10 px-6 py-1.5 md:px-12 cinematic-glow">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Slogan */}
          <div 
            onClick={() => navigateToPage("home")}
            className="flex items-center cursor-pointer group"
            id="nav-logo-container"
          >
            <img
              src="https://i.postimg.cc/KvdBcxT5/daabb61c-d861-4bce-97f3-a904a33af923-Photoroom.png"
              alt="গল্পবাড়ি"
              className="w-24 h-24 md:w-28 md:h-28 object-contain group-hover:scale-105 transition-transform duration-300 my-[-14px]"
              referrerPolicy="no-referrer"
              id="nav-logo-image"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-8" id="nav-desktop-menu">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToPage(item.id)}
                    className={`relative py-1 text-sm font-medium tracking-wide font-sans-bengali transition-colors duration-300 flex items-center gap-2 ${
                      isActive ? "text-brand-charcoal" : "text-brand-charcoal/60 hover:text-brand-charcoal"
                    }`}
                    id={`nav-item-${item.id}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-brand-gold" : "text-brand-charcoal/40"}`} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Floating 3-Dot Navigation button & menu for Mobile */}
      <div 
        className="fixed bottom-6 right-6 md:hidden z-50 flex flex-col items-end gap-3" 
        ref={menuRef}
        id="nav-mobile-floating"
      >
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ type: "spring", damping: 20, stiffness: 350 }}
              className="bg-brand-charcoal/95 backdrop-blur-lg border border-brand-gold/25 rounded-2xl shadow-2xl p-2 w-44 text-left space-y-1.5"
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all font-sans-bengali text-xs selection:bg-transparent ${
                      isActive 
                        ? "bg-brand-gold text-brand-charcoal font-bold shadow-md shadow-brand-gold/10" 
                        : "text-brand-beige/85 hover:bg-white/5 active:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Mobile menu items render here */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Triple Dot Trigger Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.92 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-xl hover:shadow-brand-gold/15 cursor-pointer ${
            isMenuOpen 
              ? "bg-brand-gold border-brand-gold text-brand-charcoal scale-105" 
              : "bg-brand-charcoal border-brand-gold/30 text-brand-beige"
          }`}
          aria-label="Navigation Menu"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 pointer-events-none" />
          ) : (
            <MoreVertical className="w-5 h-5 pointer-events-none animate-pulse" />
          )}
        </motion.button>
      </div>
    </>
  );
}
