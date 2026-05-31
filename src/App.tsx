import React, { useState, useEffect, FormEvent } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Book } from "./types";
import { BOOK_DATA, NOVELIST_BIO, NOVELIST_NAME, NOVELIST_AVATAR } from "./data";
import Navbar from "./components/Navbar";
import BookCard from "./components/BookCard";
import ReadingApp from "./components/ReadingApp";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, Award, Heart, CheckCircle, ChevronRight, Eye, Search, Settings, Calendar, User, ShoppingCart, HelpCircle, ArrowLeft, BookmarkCheck, X, RefreshCw } from "lucide-react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // --- STATE ENGINES ---
  const [currentPage, setCurrentPage] = useState<string>(location.pathname.substring(1) || "home");

  useEffect(() => {
    const path = location.pathname.substring(1) || "home";
    if (path !== currentPage) {
      setCurrentPage(path);
      setSelectedBook(null); // Clean stack on route change
    }
  }, [location.pathname]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Authentication State Managers
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("gob_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("সব বিভাগ");
  const [priceFilter, setPriceFilter] = useState<string>("সব"); // "সব" | "ফ্রি" | "প্রিমিয়াম"
  const [sortBy, setSortBy] = useState<string>("default"); // "default" | "views" | "rating" | "pages"
  
  // Unlocked premium books id tracker stored in local state
  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("gob_unlocked_books");
    return saved ? JSON.parse(saved) : [];
  });

  // VIP Membership Pass state
  const [userVipStatuses, setUserVipStatuses] = useState<Record<string, "none" | "pending" | "approved">>(() => {
    const saved = localStorage.getItem("gob_user_vip_statuses");
    return saved ? JSON.parse(saved) : {};
  });

  const currentEmail = currentUser?.email || "guest@gopobari.com";
  const currentVipStatus = userVipStatuses[currentEmail] || (localStorage.getItem("gob_vip_user") === "true" ? "approved" : "none");

  const [vIsVip, setVIsVip] = useState<boolean>(() => {
    return currentVipStatus === "approved";
  });

  useEffect(() => {
    setVIsVip(currentVipStatus === "approved");
  }, [currentVipStatus]);

  const updateUserVipStatus = (email: string, status: "none" | "pending" | "approved") => {
    const updated = { ...userVipStatuses, [email]: status };
    setUserVipStatuses(updated);
    localStorage.setItem("gob_user_vip_statuses", JSON.stringify(updated));
    if (email === (currentUser?.email || "guest@gopobari.com")) {
      setVIsVip(status === "approved");
    }
  };

  const [paymentRequests, setPaymentRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem("gob_payment_requests");
    return saved ? JSON.parse(saved) : [];
  });

  const syncPaymentRequests = (reqs: any[]) => {
    setPaymentRequests(reqs);
    localStorage.setItem("gob_payment_requests", JSON.stringify(reqs));
  };

  const [showVipBanner, setShowVipBanner] = useState<boolean>(() => {
    return localStorage.getItem("gob_dismiss_vip_banner") !== "true";
  });

  // Core Books Catalog State
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("gob_books_catalog");
    return saved ? JSON.parse(saved) : BOOK_DATA;
  });

  // Interactive Payment Modal target
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [checkoutPass, setCheckoutPass] = useState<boolean>(false); // Membership pass purchase
  const [paymentProvider, setPaymentProvider] = useState<"bkash" | "nagad" | "card">("bkash");
  const [checkoutName, setCheckoutName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [txnSuccess, setTxnSuccess] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Authentication State Managers
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [authMessage, setAuthMessage] = useState<string>("");
  
  // Scroll to top on any page/book navigation state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedBook, readingBook]);

  // Synchronize dynamic Firebase Auth session states
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "সদস্য";
        const email = firebaseUser.email || "";
        const userData = { name: displayName, email };
        setCurrentUser(userData);
        localStorage.setItem("gob_current_user", JSON.stringify(userData));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("gob_current_user");
      }
    });

    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---
  // Sync changed books list with client disk
  const syncAndSetBooks = (newCatalog: Book[]) => {
    setBooks(newCatalog);
    localStorage.setItem("gob_books_catalog", JSON.stringify(newCatalog));
  };

  const handleAddBook = (nBook: Book) => {
    const updated = [nBook, ...books];
    syncAndSetBooks(updated);
  };

  const handleUpdateBook = (uBook: Book) => {
    const updated = books.map((b) => (b.id === uBook.id ? uBook : b));
    syncAndSetBooks(updated);
    if (selectedBook?.id === uBook.id) {
      setSelectedBook(uBook);
    }
  };

  const handleDeleteBook = (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    syncAndSetBooks(updated);
    if (selectedBook?.id === id) {
      setSelectedBook(null);
    }
  };

  // Derived unlockedBookIds of the logged-in user based on approved payment requests
  const userApprovedBooks = paymentRequests
    .filter((req) => req.userEmail === (currentUser?.email || "guest@gopobari.com") && req.itemType === "book" && req.status === "approved")
    .map((req) => req.itemId)
    .filter(Boolean) as string[];

  const totalUnlockedBookIds = Array.from(new Set([...unlockedBookIds, ...userApprovedBooks]));

  // Check if book is fully readable by active guest
  const isBookReadable = (book: Book) => {
    if (!book.isPremium) return true;
    if (vIsVip) return true;
    return totalUnlockedBookIds.includes(book.id);
  };

  // Open books for immersive reading
  const handleReadRequest = (book: Book) => {
    if (!currentUser) {
      setAuthMessage("উপন্যাসটি সম্পূর্ণ পড়তে অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
    }
    if (isBookReadable(book)) {
      setReadingBook(book);
    } else {
      // Trigger prompt to unlock
      setCheckoutBook(book);
    }
  };

  const handleDownloadReq = (book: Book) => {
    if (!currentUser) {
      setAuthMessage("বই ডাউনলোড করার জন্য অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
    }
    // Aesthetic simulated text file download for cover/details
    const fileContent = `================================================
গল্পবাড়ি (GolpoBari) - প্রিমিয়াম সংস্করণ
বই: ${book.title}
লেখক: ${book.author}
বিভাগ: ${book.genre}
------------------------------------------------
এটি একটি সীমিত নমুনা সংস্করণ ডাউনলোড।
বইটি সম্পূর্ণ পড়ার জন্য গল্পবাড়ি প্ল্যাটফর্মে যুক্ত হোন।
================================================`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${book.titleEn.toLowerCase().replace(/\s+/g, "_")}_preview.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Complete transactions and persist in local database
  const executePayment = (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    
    if (!checkoutName || !phoneNumber || !transactionId) {
      setCheckoutError("দয়া করে আপনার নাম, মোবাইল নাম্বার এবং ট্রান্সজেকশন আইডি সঠিকভাবে প্রদান করুন।");
      return;
    }
    
    if (phoneNumber.length < 11) {
      setCheckoutError("সঠিক মোবাইল নম্বার প্রদান করুন।");
      return;
    }

    if (transactionId.length < 8) {
      setCheckoutError("ট্রান্সজেকশন আইডি সঠিক নয়। পুনরায় চেষ্টা করুন।");
      return;
    }

    // Capture payment details
    const newRequest = {
      id: "req_" + Date.now(),
      userEmail: currentUser?.email || "guest@gopobari.com",
      name: checkoutName,
      phone: phoneNumber,
      trxId: transactionId,
      amount: checkoutPass ? 299 : (checkoutBook?.price || 120),
      itemType: checkoutPass ? "vip" : "book",
      itemId: checkoutPass ? undefined : checkoutBook?.id,
      itemName: checkoutPass ? "ভিআইপি আজীবন মেম্বারশিপ পাস" : (checkoutBook?.title || "প্রিমিয়াম উপন্যাস"),
      status: "pending",
      timestamp: new Date().toLocaleDateString("bn-BD") + " " + new Date().toLocaleTimeString("bn-BD")
    };

    setTxnSuccess(true);
    setTimeout(() => {
      // Save request
      const updatedReqs = [newRequest, ...paymentRequests];
      syncPaymentRequests(updatedReqs);

      if (checkoutPass) {
        // Set user to VIP pending
        updateUserVipStatus(currentUser?.email || "guest@gopobari.com", "pending");
      } else if (checkoutBook) {
        // For individual books, let's store it as pending under the user's book claims
        const savedClaims = JSON.parse(localStorage.getItem("gob_book_claims") || "{}");
        savedClaims[checkoutBook.id] = "pending";
        localStorage.setItem("gob_book_claims", JSON.stringify(savedClaims));
      }
      
      // Close checkout with clean animation
      setTimeout(() => {
        setTxnSuccess(false);
        setCheckoutBook(null);
        setCheckoutPass(false);
        setPhoneNumber("");
        setTransactionId("");
        setCheckoutName("");
      }, 1500);
    }, 1500);
  };

  // Approve a payment request
  const handleApprovePaymentRequest = (id: string) => {
    const updatedReqs = paymentRequests.map((req) => {
      if (req.id === id) {
        const approvedReq = { ...req, status: "approved" as const };
        if (approvedReq.itemType === "vip") {
          updateUserVipStatus(approvedReq.userEmail, "approved");
        } else if (approvedReq.itemType === "book" && approvedReq.itemId) {
          const savedClaims = JSON.parse(localStorage.getItem("gob_book_claims") || "{}");
          savedClaims[approvedReq.itemId] = "approved";
          localStorage.setItem("gob_book_claims", JSON.stringify(savedClaims));

          if (approvedReq.userEmail === (currentUser?.email || "guest@gopobari.com")) {
            const updatedIds = Array.from(new Set([...unlockedBookIds, approvedReq.itemId]));
            setUnlockedBookIds(updatedIds);
            localStorage.setItem("gob_unlocked_books", JSON.stringify(updatedIds));
          }
        }
        return approvedReq;
      }
      return req;
    });
    syncPaymentRequests(updatedReqs);
  };

  // Reject a payment request
  const handleRejectPaymentRequest = (id: string) => {
    const updatedReqs = paymentRequests.map((req) => {
      if (req.id === id) {
        const rejectedReq = { ...req, status: "rejected" as const };
        if (rejectedReq.itemType === "vip") {
          updateUserVipStatus(rejectedReq.userEmail, "none");
        } else if (rejectedReq.itemType === "book" && rejectedReq.itemId) {
          const savedClaims = JSON.parse(localStorage.getItem("gob_book_claims") || "{}");
          savedClaims[rejectedReq.itemId] = "none";
          localStorage.setItem("gob_book_claims", JSON.stringify(savedClaims));
        }
        return rejectedReq;
      }
      return req;
    });
    syncPaymentRequests(updatedReqs);
  };

  // Filter & Search Engine
  const filteredBooks = books.filter((b) => {
    const matchesSearch = b.title.includes(searchQuery) || b.genre.includes(searchQuery) || b.shortDesc.includes(searchQuery);
    const matchesGenre = genreFilter === "সব বিভাগ" || b.genre === genreFilter;
    const matchesPrice = 
      priceFilter === "সব" || 
      (priceFilter === "ফ্রি" && !b.isPremium) || 
      (priceFilter === "প্রিমিয়াম" && b.isPremium);
    
    return matchesSearch && matchesGenre && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === "views") return b.views - a.views;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "pages") return b.pages - a.pages;
    return 0; // default order
  });

  // Auto-scoffs bookmarks
  const getSavedBookmarkText = (bookId: string) => {
    const saved = localStorage.getItem(`gob_bookmark_${bookId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return `অধ্যায় ${parsed.chapterIndex + 1}: ${parsed.chapterTitle}`;
    }
    return null;
  };

  // Page switching helper
  const navigateToPage = (target: string) => {
    navigate("/" + target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-beige text-brand-charcoal font-sans-bengali selection:bg-brand-gold/30 selection:text-brand-charcoal" id="platform-root-viewport">
      <Navbar 
        onAdminOpen={() => navigateToPage("admin")} 
        currentUser={currentUser} 
        onLoginClick={() => {
          setAuthModalMode("login");
          setAuthMessage("");
          setShowAuthModal(true);
        }} 
        onLogoutClick={() => signOut(auth)}
        navigateToPage={navigateToPage}
        currentPage={currentPage}
        vIsVip={vIsVip}
        onVipCheckout={() => {
          setCheckoutPass(true);
          setCheckoutBook(books.find((b) => b.isPremium) || books[0]);
        }}
      />

      <AnimatePresence mode="wait">
        {currentPage === "home" ? (
          <motion.div
            key="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow"
          >
            {/* Hero Section */}
            <section className="relative px-6 py-12 md:px-12 md:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12" id="home-hero">
              <div className="flex-1 space-y-6 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-charcoal text-[10px] uppercase font-bold tracking-widest mb-4">
                  <Star className="w-3 h-3 text-brand-gold" />
                  <span>নতুন প্রিমিয়াম সংকলন উন্মুক্ত</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-serif-bengali leading-[1.1] text-brand-charcoal">
                  গল্পের ভেতরেই<br/>আরেকটি পৃথিবী
                </h1>
                <p className="text-base md:text-lg text-brand-charcoal/60 font-sans-bengali font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  জুনায়েদ হাসানের লেখা অসামান্য উপন্যাসের এক অভিনব ডিজিটাল সংগ্রহ। এখনই পড়ুন আপনার পছন্দের গল্পগুলো, সম্পূর্ণ বিজ্ঞাপনমুক্ত পরিবেশে।
                </p>
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button 
                    onClick={() => navigateToPage("read")}
                    className="w-full sm:w-auto bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold text-sm font-bold py-4 px-8 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-brand-charcoal/20"
                    id="hero-cta-btn"
                  >
                    <BookOpen className="w-4 h-4" /> পড়া শুরু করুন
                  </button>
                  <button 
                    onClick={() => navigateToPage("premium")}
                    className="w-full sm:w-auto bg-transparent hover:bg-brand-gold/5 text-brand-charcoal text-sm font-bold py-4 px-8 rounded-full border border-brand-gold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    id="hero-premium-btn"
                  >
                    <Award className="w-4 h-4 text-brand-gold" /> প্রিমিয়াম পাস
                  </button>
                </div>
              </div>
              <div className="flex-1 relative w-full flex justify-center lg:justify-end" id="hero-showcase">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-brand-gold/20 rounded-full filter blur-[100px]" />
                <div className="relative w-64 h-80 lg:w-80 lg:h-[480px] bg-brand-charcoal rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 cinematic-glow">
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal to-transparent opacity-60 z-10" />
                  <img src={NOVELIST_AVATAR} className="w-full h-full object-cover opacity-80" alt="জুনায়েদ হাসান" />
                  <div className="absolute bottom-6 left-6 z-20 text-brand-beige">
                    <h3 className="font-serif-bengali font-bold text-xl">জুনায়েদ হাসান</h3>
                  </div>
                </div>
              </div>
            </section>

            {/* VIP Pass Promo Section on Home page */}
            <section className="px-6 pb-20 max-w-7xl mx-auto" id="home-vip-promo">
              <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-brand-charcoal to-[#232323] border border-brand-gold/30 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 cinematic-glow">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand-beige/5 rounded-full filter blur-[80px] pointer-events-none" />

                <div className="space-y-4 z-10 max-w-2xl text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/20 border border-brand-gold/30 rounded-full text-brand-gold text-[10px] uppercase font-bold tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    গল্পবাড়ি প্রিমিয়াম পাস
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold font-serif-bengali text-white leading-tight">
                    গল্পবাড়ি <span className="text-brand-gold">ভিআইপি প্রিমিয়াম মেম্বারশিপ পাস</span>
                  </h2>
                  <p className="text-sm text-brand-beige/70 font-sans-bengali leading-relaxed font-light">
                    আলাদা আলাদা বই না কিনে মাত্র ৳২৯৯ এককালীন ফি-তে গল্পবাড়ির প্রতিটি প্রিমিয়াম বই আজীবন কোনো বিজ্ঞাপন ছাড়া সম্পূর্ণ পড়তে পারবেন। আজই আপনার প্রিমিয়াম পাস সংগ্রহ করুন!
                  </p>
                </div>

                <div className="shrink-0 z-10 w-full md:w-auto text-center">
                  {currentVipStatus === "approved" ? (
                    <div className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-8 py-5 rounded-2xl flex flex-col items-center gap-2 shadow-lg backdrop-blur-md">
                      <CheckCircle className="w-8 h-8 text-brand-gold" />
                      <div>
                        <h4 className="text-base font-bold font-serif-bengali">ভিআইপি পাস সক্রিয়</h4>
                        <p className="text-xs font-sans-bengali opacity-70">আনলিমিটেড পড়ার সুবিধা চালু আছে</p>
                      </div>
                      <button
                        onClick={() => {
                          updateUserVipStatus(currentEmail, "none");
                        }}
                        className="mt-2 text-[10px] text-brand-beige/60 hover:text-white underline cursor-pointer font-sans-bengali transition-colors"
                        title="পেমেন্ট গেটওয়ে পরীক্ষা করতে স্ট্যাটাস রিসেট করুন"
                      >
                        [পরীক্ষা করতে ভিআইপি রিসেট করুন]
                      </button>
                    </div>
                  ) : currentVipStatus === "pending" ? (
                    <div className="bg-amber-500/20 border border-amber-500/30 text-amber-500 px-8 py-5 rounded-2xl flex flex-col items-center gap-2 shadow-lg backdrop-blur-md">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                      <div>
                        <h4 className="text-base font-bold font-serif-bengali">যাচাইকরণ প্রক্রিয়া চলছে</h4>
                        <p className="text-xs font-sans-bengali text-amber-200/80 max-w-[200px] leading-tight">আপনার পেমেন্ট রিকোয়েস্টটি লেখক ড্যাশবোর্ডে পেন্ডিং রয়েছে।</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCheckoutPass(true);
                        setCheckoutBook(books.find((b) => b.isPremium) || books[0]);
                      }}
                      className="w-full md:w-auto bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal hover:text-white transition-all duration-300 font-bold text-sm py-4 px-10 rounded-full shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 border border-brand-gold/30 cursor-pointer"
                      id="home-buy-vip-btn"
                    >
                      <Star className="w-4 h-4 fill-brand-charcoal text-brand-charcoal" />
                      মেম্বারশিপ পেমেন্ট করুন (৳২৯৯)
                    </button>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        ) : currentPage === "read" ? (
          <motion.div
            key="read-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full mx-auto pb-24"
            id="read-page-container"
          >
            {/* Read Page VIP Banner if not VIP */}
            {!vIsVip && showVipBanner && (
              <div className="mx-4 md:mx-6 mt-6 bg-gradient-to-r from-brand-charcoal to-[#232323] border border-brand-gold/30 rounded-2xl p-4 pr-10 md:pr-12 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md text-center sm:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/5 rounded-full filter blur-xl pointer-events-none" />
                <button
                  type="button"
                  onClick={() => {
                    setShowVipBanner(false);
                    localStorage.setItem("gob_dismiss_vip_banner", "true");
                  }}
                  className="absolute top-3 right-3 text-white/50 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                  id="dismiss-vip-banner-btn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-brand-gold/15 rounded-full flex items-center justify-center shrink-0 border border-brand-gold/20 text-brand-gold mx-auto sm:mx-0">
                    <Award className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm font-serif-bengali text-white flex items-center justify-center sm:justify-start gap-1.5 leading-none">
                      গল্পবাড়ি ভিআইপি মেম্বারশিপ পাস
                      <span className="text-[9px] bg-brand-gold text-brand-charcoal px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider font-sans">Popular</span>
                    </h4>
                    <p className="text-xs text-brand-beige/60 font-sans-bengali mt-1.5 md:mt-1">মাত্র ৳২৯৯ এককালীন পেমেন্টে সব প্রিমিয়াম উপন্যাস আজীবন বিজ্ঞাপন ছাড়া পড়ুন!</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCheckoutPass(true);
                    setCheckoutBook(books.find((b) => b.isPremium) || books[0]);
                  }}
                  className="w-full sm:w-auto z-10 shrink-0 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold text-xs py-2.5 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2 border border-brand-gold/20 transform hover:scale-103 active:scale-97 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-brand-charcoal text-brand-charcoal" />
                  পাস নিন (৳২৯৯)
                </button>
              </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white border rounded-2xl md:rounded-full border-brand-gold/10 mx-3.5 md:mx-6 mt-5 p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm" id="catalog-controls">
              <div className="flex w-full md:w-auto items-center gap-1.5">
                <div className="flex bg-brand-beige border border-brand-gold/15 rounded-full p-0.5 w-full md:w-auto">
                  {["সব", "ফ্রি", "প্রিমিয়াম"].map((pr) => (
                    <button
                      key={pr}
                      onClick={() => setPriceFilter(pr)}
                      className={`text-[10px] md:text-[11px] font-bold font-sans-bengali px-3.5 py-1.5 rounded-full transition-colors flex-1 md:flex-none ${
                        priceFilter === pr ? "bg-brand-charcoal text-brand-gold shadow-md" : "text-brand-charcoal/60 hover:text-brand-charcoal"
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-charcoal/40" />
                <input
                  type="text"
                  placeholder="বইয়ের নাম বা বিভাগ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-beige/50 border border-brand-gold/15 rounded-full py-1.5 md:py-2 pl-9 pr-3 text-[11px] font-sans-bengali focus:outline-none focus:border-brand-gold/40 transition-colors"
                />
              </div>

              <div className="flex overflow-x-auto w-full md:w-auto gap-1.5 pb-0.5 md:pb-0 scrollbar-hide">
                {["সব বিভাগ", "ম্যাজিকাল রিয়ালিজম", "রহস্য ও থ্রিলার", "ধ্রুপদী উপন্যাস"].map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setGenreFilter(gen)}
                    className={`shrink-0 text-[10px] md:text-[11px] font-bold font-sans-bengali px-3.5 py-1.5 rounded-full border transition-all ${
                      genreFilter === gen 
                        ? "bg-brand-gold border-brand-gold text-brand-charcoal shadow-sm"
                        : "bg-transparent border-brand-gold/15 text-brand-charcoal/65 hover:border-brand-gold/40"
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Vertical List display */}
            <AnimatePresence mode="popLayout">
              {filteredBooks.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-2 max-sm:gap-2.5 max-sm:px-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-6 mt-6"
                  id="catalog-books-grid"
                >
                  {filteredBooks.map((b) => (
                    <BookCard
                      key={b.id}
                      book={b}
                      onSelect={setSelectedBook}
                      onRead={handleReadRequest}
                      onBuy={setCheckoutBook}
                      isLoggedIn={!!currentUser}
                      onDownloadAuthNeeded={() => {
                        setAuthMessage("বইটি অফলাইনে ডাউনলোড করতে অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
                        setAuthModalMode("login");
                        setShowAuthModal(true);
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-32 px-4">
                  <HelpCircle className="w-12 h-12 text-brand-gold/30 mx-auto mb-4" />
                  <p className="text-base font-sans-bengali text-brand-charcoal/50 font-bold">আপনার খোঁজা মানের সাথে সামঞ্জস্যপূর্ণ কোনো উপন্যাস পাওয়া যায়নি।</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setGenreFilter("সব বিভাগ"); setPriceFilter("সব"); }}
                    className="mt-6 text-sm font-bold text-brand-gold bg-brand-charcoal px-6 py-2 rounded-full hover:bg-brand-charcoal/90 transition-colors"
                  >
                    সব ফিল্টার রিসেট করুন
                  </button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : currentPage === "premium" ? (
          /* PREMIUM CANOPY EXCLUSIVE BOOK SECTION */
          <motion.div
            key="premium-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-16"
            id="premium-page-container"
          >
            {/* VIP Header Banner */}
            <div className="bg-brand-charcoal border border-brand-gold/30 rounded-3xl p-6 md:p-10 mb-12 text-center md:text-left relative overflow-hidden cinematic-glow flex flex-col md:flex-row items-center justify-between gap-8">
              
              {/* Background glowing gold decorations */}
              <div className="absolute w-40 h-40 bg-brand-gold/20 rounded-full filter blur-2xl top-1/2 -left-10" />

              <div className="space-y-3 z-10">
                <span className="text-[10px] md:text-xs tracking-widest font-bold uppercase text-brand-gold flex items-center justify-center md:justify-start gap-1">
                  <Award className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  গল্পবাড়ি ভিআইপি প্রিমিয়াম মেম্বারশিপ পাস
                </span>
                <h2 className="text-2xl md:text-3.5xl font-black font-serif-bengali text-white">
                  এককালীন সুলভ পাসে <span className="text-brand-gold">সব উপন্যাস সম্পূর্ণ আনলক</span>
                </h2>
                <p className="text-xs md:text-sm text-brand-beige/50 font-sans-bengali font-light max-w-xl">
                  আলাদা আলাদা বই না কিনে মাত্র ৳২৯৯ এককালীন ফি-তে গল্পবাড়ির প্রতিটি প্রিমিয়াম বই আজীবন কোনো বিজ্ঞাপন ছাড়া সম্পূর্ণ পড়তে পারবেন।
                </p>
              </div>

              <div className="shrink-0 z-10 w-full md:w-auto text-center" id="premium-membership-box">
                {currentVipStatus === "approved" ? (
                  <div className="bg-brand-gold/25 border border-brand-gold/40 text-brand-gold px-6 py-4 rounded-2xl flex flex-col items-center gap-1.5 shadow-md">
                    <CheckCircle className="w-6 h-6 text-brand-gold" />
                    <div>
                      <h4 className="text-sm font-bold font-serif-bengali">ভিআইপি পাস সক্রিয়</h4>
                      <p className="text-[10px] font-sans-bengali opacity-60">আনলিমিটেড পড়ার সুবিধা চালু আছে</p>
                    </div>
                    <button
                      onClick={() => {
                        updateUserVipStatus(currentEmail, "none");
                      }}
                      className="mt-1 text-[9px] text-brand-beige/60 hover:text-white underline cursor-pointer font-sans-bengali transition-colors"
                    >
                      [রিসেট করুন]
                    </button>
                  </div>
                ) : currentVipStatus === "pending" ? (
                  <div className="bg-amber-500/20 border border-amber-500/30 text-amber-500 px-6 py-4 rounded-2xl flex flex-col items-center gap-1.5 shadow-md">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold font-serif-bengali text-amber-500">যাচাইকরণ প্রক্রিয়াধীন</h4>
                      <p className="text-[10px] font-sans-bengali opacity-70">পেমেন্ট রিকোয়েস্টটি পেন্ডিং আছে</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setCheckoutPass(true); setCheckoutBook(books.find((b) => b.isPremium) || books[0]); }}
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal hover:text-white transition-all font-bold text-xs py-3.5 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    id="buy-vip-pass-btn"
                  >
                    <Star className="w-4 h-4 fill-brand-charcoal text-brand-charcoal" />
                    মেম্বারশিপ পেমেন্ট করুন (৳২৯৯)
                  </button>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-bold font-serif-bengali text-brand-charcoal border-b border-brand-gold/15 pb-2">আমাদের এক্সক্লুসিভ প্রিমিয়াম উপন্যাসসমূহ</h3>
            </div>

            {/* Render premium only grid */}
            <div className="grid grid-cols-2 max-sm:gap-2.5 gap-6 md:gap-8" id="premium-items-grid">
              {books.filter((b) => b.isPremium).map((bp) => (
                <BookCard
                  key={bp.id}
                  book={bp}
                  onSelect={setSelectedBook}
                  onRead={handleReadRequest}
                  onBuy={setCheckoutBook}
                  isLoggedIn={!!currentUser}
                  onDownloadAuthNeeded={() => {
                    setAuthMessage("বইটি অফলাইনে ডাউনলোড করতে অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
                    setAuthModalMode("login");
                    setShowAuthModal(true);
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : currentPage === "admin" ? (
          <motion.div
            key="admin-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col pt-16 md:pt-20"
          >
            <AdminDashboard
              books={books}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              onClose={() => navigateToPage("home")}
              isAdmin={currentUser?.email === "zunayedalhasan7@gmail.com"}
              paymentRequests={paymentRequests}
              onApproveRequest={handleApprovePaymentRequest}
              onRejectRequest={handleRejectPaymentRequest}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {selectedBook && !readingBook && (
        <div className="fixed inset-0 z-50 bg-brand-charcoal/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8" id="book-details-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-4xl bg-brand-beige border border-brand-gold/20 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black text-white hover:text-brand-gold rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Cover Hero Section */}
            <div className="w-full md:w-2/5 shrink-0 bg-brand-charcoal relative h-64 md:h-auto">
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-brand-charcoal to-transparent opacity-80" />
              <div 
                className="w-full h-full object-cover shadow-inner" 
                dangerouslySetInnerHTML={{ __html: selectedBook.coverUrl }} 
              />
            </div>

            {/* Scrollable Details Section */}
            <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-brand-gold tracking-widest">
                  <span className="bg-brand-gold/10 border border-brand-gold/30 px-2 py-0.5 rounded-full text-brand-charcoal">{selectedBook.genre}</span>
                  {selectedBook.isPremium ? (
                    <span className="bg-brand-charcoal text-brand-gold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-brand-gold text-brand-gold" /> প্রিমিয়াম</span>
                  ) : (
                    <span className="bg-white border border-brand-gold/20 text-brand-charcoal px-2 py-0.5 rounded-full">ফ্রি</span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold font-serif-bengali text-brand-charcoal tracking-tight leading-[1.1]">
                  {selectedBook.title}
                </h2>
                
                <p className="text-sm text-brand-charcoal/60 font-sans-bengali font-medium">
                  লেখক: <span className="text-brand-charcoal font-bold">{selectedBook.author}</span>
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-brand-charcoal/50 font-sans-bengali pt-2 pb-4 border-y border-brand-gold/10">
                  <span className="text-brand-gold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-brand-gold" />
                    {selectedBook.rating || "5.0"}
                  </span>
                  <span>•</span>
                  <span>{selectedBook.readTime} পাঠ কাল</span>
                  <span>•</span>
                  <span>{selectedBook.pages} পৃষ্ঠা</span>
                </div>

                <div className="text-sm text-brand-charcoal/70 leading-relaxed font-sans-bengali space-y-3 font-light text-justify pt-2">
                  <p>{selectedBook.longDesc}</p>
                </div>

                {/* Related Books Netflix-style Carousel */}
                <div className="pt-8">
                  <h3 className="text-sm font-bold font-serif-bengali text-brand-charcoal mb-4">একই ধরনের আরও বই</h3>
                  <div className="flex overflow-x-auto snap-x gap-3 pb-4 scrollbar-hide -mx-6 px-6">
                    {books.filter(b => b.id !== selectedBook.id && (b.genre === selectedBook.genre || b.isPremium === selectedBook.isPremium)).slice(0, 4).map(rb => (
                      <div 
                        key={rb.id} 
                        onClick={() => setSelectedBook(rb)}
                        className="snap-start shrink-0 w-24 space-y-2 cursor-pointer group"
                      >
                         <div className="aspect-[3/4] rounded-lg overflow-hidden border border-brand-gold/10 shadow-sm relative group-hover:border-brand-gold/50 transition-colors">
                           <div className="w-full h-full object-cover" dangerouslySetInnerHTML={{ __html: rb.coverUrl }} />
                         </div>
                         <h4 className="text-[10px] font-bold font-serif-bengali text-brand-charcoal line-clamp-1 group-hover:text-brand-gold truncate">{rb.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-brand-gold/10">
                <div className="flex items-center gap-3">
                  {selectedBook.isPremium ? (
                    <>
                      {!vIsVip && (
                        <button
                          onClick={() => {
                            setCheckoutPass(true);
                            setCheckoutBook(selectedBook);
                            setSelectedBook(null);
                          }}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-brand-gold text-brand-charcoal font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] border border-brand-gold/20"
                        >
                          <Star className="w-4 h-4 text-brand-charcoal fill-brand-charcoal" />
                          ভিআইপি পাস (৳২৯৯)
                        </button>
                      )}
                      
                      {!vIsVip && !unlockedBookIds.includes(selectedBook.id) && (
                        <button
                          onClick={() => {
                            setCheckoutPass(false);
                            setCheckoutBook(selectedBook);
                            setSelectedBook(null);
                          }}
                          className="flex-1 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(17,17,17,0.3)]"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          কিনুন (৳{selectedBook.price})
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReadRequest(selectedBook)}
                        className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(197,164,126,0.3)]"
                      >
                        <BookOpen className="w-4 h-4" />
                        পড়ুন
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleReadRequest(selectedBook)}
                      className="flex-[2] bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(17,17,17,0.3)]"
                    >
                      <BookOpen className="w-4 h-4" />
                      পড়ুন
                    </button>
                  )}
                  
                  {!selectedBook.isPremium && (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setAuthMessage("বইটি অফলাইনে ডাউনলোড করতে অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
                          setAuthModalMode("login");
                          setShowAuthModal(true);
                        } else {
                          alert(`'${selectedBook.title}' ডাউনলোড শুরু হয়েছে...`);
                        }
                      }}
                      className="flex-1 bg-white border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-charcoal font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      ডাউনলোড PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {readingBook && (
        <ReadingApp
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}

      {/* 5. SSL Simulated Transaction gate Modal overlay */}
      <AnimatePresence>
        {(checkoutBook || checkoutPass) && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="checkout-modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-stone-50 border border-brand-gold/25 rounded-2xl overflow-hidden shadow-2xl relative"
              id="checkout-modal-panel"
            >
              {/* Top theme header colored dynamically */}
              <div className="p-3 text-white flex items-center justify-between bg-[#E2136E] relative overflow-hidden">
                {/* Diagonal subtle stripes for realism */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_50%,#fff_50%,#fff_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                
                <div className="flex items-center space-x-2 z-10">
                  <div className="bg-white/10 p-1 rounded-lg backdrop-blur-xs shrink-0">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm font-serif-bengali leading-tight">গল্পবাড়ি নিরাপদ পেমেন্ট</h3>
                    <p className="text-[8px] text-white/80 font-sans tracking-wide leading-none">SECURED GATEWAY</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setCheckoutBook(null); setCheckoutPass(false); }}
                  className="p-1 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10 cursor-pointer"
                  id="checkout-close"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transaction form details */}
              {txnSuccess ? (
                <div className="p-8 text-center space-y-4 bg-white" id="checkout-success-view">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
                  </motion.div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold font-serif-bengali text-brand-charcoal">পেমেন্ট সফল সম্পন্ন হয়েছে!</h4>
                    <p className="text-xs font-sans-bengali text-brand-charcoal/60 leading-relaxed px-2">
                      {checkoutPass 
                        ? "আপনার আজীবন মেম্বারশিপ পাস সক্রিয় করা হয়েছে। সীমাহীন প্রিমিয়াম বই পড়া উপভোগ করুন!" 
                        : "উপন্যাসটি সম্পূর্ণ উন্মোচিত হয়েছে। পরম শান্তিতে পড়ুন।"
                      }
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block border border-emerald-100">
                    TrxID: {transactionId || "SUCCESS"}
                  </div>
                </div>
              ) : (
                <form onSubmit={executePayment} className="flex flex-col bg-white" id="checkout-form">
                  {/* Summary order details */}
                  <div className="bg-gradient-to-b from-[#E2136E] to-[#d12053] p-4 text-white flex flex-col items-center justify-center space-y-1 relative shadow-sm">
                    <img src="https://i.postimg.cc/mD8ZJ2n4/bkash-logo-transparent.png" alt="bKash" className="h-7 object-contain mb-1 drop-shadow" />
                    
                    <div className="text-[8px] text-white/70 uppercase tracking-widest font-semibold font-sans">Payment Amount</div>
                    <div className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-sm">৳ {checkoutPass ? 299 : (checkoutBook?.price || 0)}</div>
                    
                    {/* Invoice Item Badge */}
                    <div className="mt-1 bg-black/15 px-2.5 py-0.5 rounded-full text-[10px] font-sans-bengali text-white/90 border border-white/10 flex items-center gap-1">
                      {checkoutPass ? "👑 ভিআইপি আজীবন মেম্বারশিপ" : `📖 ${checkoutBook?.title}`}
                    </div>

                    {checkoutError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-3 left-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold font-sans-bengali text-center shadow-lg border border-red-500 z-10"
                      >
                        ⚠️ {checkoutError}
                      </motion.div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3 pt-4 space-y-3 bg-stone-50/55">
                    
                    {/* VIP Promotion Upsell inside regular checkout */}
                    {!checkoutPass && checkoutBook && (
                      <div 
                        onClick={() => setCheckoutPass(true)}
                        className="p-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10 border border-amber-500/20 cursor-pointer rounded-lg flex items-center justify-between gap-2 text-[10px] font-sans-bengali text-brand-charcoal transition-all mb-0.5 group"
                      >
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                          <div className="text-left">
                            <span className="font-bold text-[10px] text-amber-950">ভিআইপি আজীবন মেম্বারশিপে আপগ্রেড</span>
                            <span className="hidden xs:inline text-[8px] text-brand-charcoal/60 ml-1.5">(সব বই আজীবন ফ্রি)</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-[#E2136E] bg-white px-1.5 py-0.2 rounded border border-amber-500/10 shadow-3xs shrink-0">৳২৯৯</span>
                      </div>
                    )}

                    {/* Step-by-Step interactive bKash send money instructions */}
                    <div className="bg-white rounded-xl p-2.5 shadow-3xs border border-brand-charcoal/5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-brand-charcoal/50">
                        <span className="font-bold text-[#E2136E] font-serif-bengali">বিকাশ পার্সোনাল নম্বরে Send Money করুন:</span>
                        <span className="text-[8px] bg-[#E2136E]/10 text-[#E2136E] px-1 py-0.2 rounded font-sans font-bold">Personal</span>
                      </div>
                      <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-1 overflow-hidden shadow-3xs">
                        <span className="pl-2 font-mono font-black text-xs text-[#E2136E] tracking-wider selection:bg-pink-100">01626538051</span>
                        <button 
                          type="button" 
                          onClick={() => {
                           navigator.clipboard.writeText("01626538051");
                           setHasCopied(true);
                           setTimeout(() => setHasCopied(false), 2000);
                          }}
                          className="bg-[#E2136E] hover:bg-[#c40e5d] text-white px-2 py-1 rounded text-[9px] font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {hasCopied ? "Copied!" : "নম্বরটি কপি করুন"}
                        </button>
                      </div>
                      <p className="text-[9px] font-sans-bengali text-brand-charcoal/60 leading-tight">
                        ১. এই নম্বরে <strong className="text-brand-charcoal">৳{checkoutPass ? 299 : (checkoutBook?.price || 0)}</strong> পাঠিয়ে ২. নিচের ফরমে আপনার তথ্য ও মেসেজে প্রাপ্ত <strong className="text-[#E2136E] font-bold">TrxID</strong> দিন।
                      </p>
                    </div>

                    {/* Form Fields Section */}
                    <div className="space-y-2 bg-white rounded-xl p-2.5 border border-brand-charcoal/5 shadow-3xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-brand-charcoal/70 font-sans-bengali">আপনার নাম</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: জুনাইদ"
                            value={checkoutName}
                            onChange={(e) => setCheckoutName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-[#E2136E]/10 focus:border-[#E2136E] rounded-md py-1 px-1.5 text-[10px] font-sans-bengali text-brand-charcoal transition-all placeholder:text-stone-300"
                            id="checkout-name-input"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-brand-charcoal/70 font-sans-bengali">বিকাশ মোবাইল নম্বর</label>
                          <input
                            type="tel"
                            required
                            placeholder="017XXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-[#E2136E]/10 focus:border-[#E2136E] rounded-md py-1 px-1.5 text-[10px] font-mono text-brand-charcoal transition-all placeholder:text-stone-300 shadow-3xs"
                            id="checkout-mobile-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        <label className="text-[9px] font-bold text-brand-charcoal/75 font-sans-bengali flex items-center justify-between">
                          <span>ট্রান্সজেকশন আইডি (Transaction ID)</span>
                          <span className="text-[8px] text-[#E2136E] font-sans">যেমন: 8M49X8K9</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="মেসেজের TrxID টি এখানে লিখুন"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-[#E2136E]/5 border border-[#E2136E]/10 focus:bg-white focus:ring-1 focus:ring-[#E2136E]/10 focus:border-[#E2136E] rounded-md py-1.5 px-2 text-[10px] font-mono font-bold text-[#E2136E] text-center tracking-wider uppercase transition-all"
                          id="checkout-txn-input"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Submission and Bottom CTA */}
                  <div className="p-2.5 bg-stone-100 border-t border-stone-200/50 flex flex-col items-center">
                    <button
                      type="submit"
                      className="w-full bg-[#E2136E] hover:bg-[#c40e5d] text-white font-bold text-xs tracking-wide py-2 rounded-xl uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/10 active:scale-98 cursor-pointer font-serif-bengali"
                      id="checkout-verify-btn"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" /> পেমেন্ট ভেরিফাই করুন
                    </button>
                    <p className="text-[8px] text-brand-charcoal/40 font-sans mt-1">🔒 Automated SSL Cryptographic Secure Gateway</p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Footer section */}
      <Footer 
        onPageChange={navigateToPage} 
        onAdminOpen={() => navigateToPage("admin")} 
      />

      {/* 7. Beautiful Modal Auth Trigger overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            initialMode={authModalMode}
            message={authMessage}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={(name, email) => {
              setCurrentUser({ name, email });
              setShowAuthModal(false);
              if (email === "zunayedalhasan7@gmail.com") {
                navigateToPage("admin");
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* 8. Persistent VIP Membership Pass floating button if user is NOT a VIP yet */}
      {!vIsVip && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.1, 1], y: [0, -5, 0] }}
          transition={{
            scale: { duration: 0.5, ease: "easeOut" },
            y: { repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setCheckoutPass(true);
            setCheckoutBook(books.find((b) => b.isPremium) || books[0]);
          }}
          className="fixed bottom-24 right-5 md:bottom-10 md:right-10 z-40 bg-gradient-to-r from-amber-500 via-[#d97706] to-brand-charcoal text-white hover:text-brand-gold font-bold text-xs md:text-sm py-3.5 px-5 rounded-full shadow-[0_10px_35px_rgba(217,119,6,0.35)] flex items-center gap-2 border border-brand-gold/30 cursor-pointer transition-all duration-300"
          id="persistent-floating-vip-btn"
          title="ভিআইপি আজীবন মেম্বারশিপ নিন"
        >
          <span className="text-sm md:text-base">👑</span>
          <span className="font-serif-bengali tracking-wide leading-none">ভিআইপি আজীবন মেম্বারশিপ নিন</span>
          <span className="bg-brand-gold text-brand-charcoal text-[10px] md:text-xs px-2 py-0.5 rounded-full font-sans font-extrabold shadow-sm">৳২৯৯</span>
        </motion.button>
      )}

    </div>
  );
}
