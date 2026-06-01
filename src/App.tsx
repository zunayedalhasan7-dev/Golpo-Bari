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
import BookDetailsPage from "./pages/BookDetailsPage";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, Award, Heart, CheckCircle, ChevronRight, Eye, Search, Settings, Calendar, User, ShoppingCart, HelpCircle, ArrowLeft, BookmarkCheck, X, RefreshCw, Home, Sparkles } from "lucide-react";
import { auth } from "./firebase";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // --- STATE ENGINES ---
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = location.pathname.substring(1) || "home";
    if (path.startsWith("book/")) {
      return "book-details";
    }
    return path;
  });

  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    const path = location.pathname.substring(1) || "home";
    if (path.startsWith("book/")) {
      const bookId = path.substring(5);
      const saved = localStorage.getItem("gob_books_catalog");
      const catalog: Book[] = saved ? JSON.parse(saved) : BOOK_DATA;
      return catalog.find((b) => b.id === bookId) || null;
    }
    return null;
  });

  const [readingBook, setReadingBook] = useState<Book | null>(null);

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

  const currentEmail = "guest@gopobari.com";
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
    if (email === currentEmail) {
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
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const q = query(collection(db, "books"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbBooks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Book));
      setBooks(dbBooks);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = location.pathname.substring(1) || "home";
    if (path.startsWith("book/")) {
      const bookId = path.substring(5);
      const foundBook = books.find((b) => b.id === bookId);
      if (foundBook) {
        setSelectedBook(foundBook);
        setCurrentPage("book-details");
      } else {
        setCurrentPage("home");
        setSelectedBook(null);
      }
    } else {
      if (path !== currentPage) {
        setCurrentPage(path);
        setSelectedBook(null); // Clean stack on route change
      }
    }
  }, [location.pathname, books]);

  // Interactive Payment Modal target
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [checkoutPass, setCheckoutPass] = useState<boolean>(false); // Membership pass purchase
  const [paymentProvider, setPaymentProvider] = useState<"bkash" | "nagad" | "card">("bkash");
  const [checkoutName, setCheckoutName] = useState<string>("");
  const [checkoutEmail, setCheckoutEmail] = useState<string>("guest@gopobari.com");
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [txnSuccess, setTxnSuccess] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Authentication State Managers
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [authMessage, setAuthMessage] = useState<string>("");
  
  // Scroll to top on any page/book navigation state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedBook, readingBook]);

  // Handle automated dynamic purchase unlocks on successful redirect callback
  useEffect(() => {
    if (currentPage === "success") {
      const params = new URLSearchParams(window.location.search);
      const paymentID = params.get("paymentID");
      
      if (paymentID) {
        const pendingItem = localStorage.getItem("gob_pending_checkout_item");
        if (pendingItem) {
          if (pendingItem === "vip") {
            // Unlock VIP Membership Status
            updateUserVipStatus(currentEmail, "approved");
          } else {
            // Unlock specific Book
            const currentUnlocked = [...unlockedBookIds];
            if (!currentUnlocked.includes(pendingItem)) {
              currentUnlocked.push(pendingItem);
              setUnlockedBookIds(currentUnlocked);
              localStorage.setItem("gob_unlocked_books", JSON.stringify(currentUnlocked));
            }
            
            // Register approved status
            const savedClaims = JSON.parse(localStorage.getItem("gob_book_claims") || "{}");
            savedClaims[pendingItem] = "approved";
            localStorage.setItem("gob_book_claims", JSON.stringify(savedClaims));
          }
          // Clear payment/checkout window states
          setCheckoutBook(null);
          setCheckoutPass(false);
          setIsRedirecting(false);
          // Keep a backup of last success info for the UI view
          const pendingName = localStorage.getItem("gob_pending_checkout_name") || "সম্মানিত গ্রাহক";
          localStorage.setItem("gob_last_success_name", pendingName);
          localStorage.setItem("gob_last_success_item", pendingItem);
          
          // Clear cache context so reloads don't duplicate logic
          localStorage.removeItem("gob_pending_checkout_item");
        }
      }
    } else if (currentPage === "cancel") {
      // Clear redirections if cancelled
      setIsRedirecting(false);
    }
  }, [currentPage]);

  // Author Bio State
  const [authorBio, setAuthorBio] = useState<string>(() => {
    return localStorage.getItem("gob_author_bio") || NOVELIST_BIO;
  });

  const handleUpdateAuthorBio = (newBio: string) => {
    setAuthorBio(newBio);
    localStorage.setItem("gob_author_bio", newBio);
  };
  // Sync changed books list with client for local updates
  const syncAndSetBooks = (newCatalog: Book[]) => {
    // Only update local state, Firestore operations are handled directly in CRUD
    setBooks(newCatalog);
    localStorage.setItem("gob_books_catalog", JSON.stringify(newCatalog));
  };

  const handleAddBook = async (nBook: Book) => {
    try {
      await addDoc(collection(db, "books"), {
        ...nBook,
        timestamp: new Date()
      });
    } catch (e) {
      console.error("Error adding book: ", e);
    }
  };

  const handleUpdateBook = async (uBook: Book) => {
    try {
      const bookRef = doc(db, "books", uBook.id);
      await updateDoc(bookRef, { ...uBook });
    } catch (e) {
      console.error("Error updating book: ", e);
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      const bookRef = doc(db, "books", id);
      await deleteDoc(bookRef);
    } catch (e) {
      console.error("Error deleting book: ", e);
    }
  };

  // Derived unlockedBookIds of the logged-in user based on approved payment requests
  const userApprovedBooks = paymentRequests
    .filter((req) => req.userEmail === currentEmail && req.itemType === "book" && req.status === "approved")
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
    if (isBookReadable(book)) {
      setReadingBook(book);
    } else {
      // Trigger prompt to unlock
      setCheckoutBook(book);
    }
  };

  const handleDownloadReq = (book: Book) => {
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

  // Live payment gateway transaction flow using secure backend routes
  const executePayment = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    
    if (!checkoutName || !checkoutEmail) {
      setCheckoutError("দয়া করে আপনার নাম এবং ইমেইল সঠিকভাবে প্রদান করুন।");
      return;
    }

    const price = checkoutPass ? 299 : (checkoutBook?.price || 120);

    try {
      setIsRedirecting(true);
      
      // Cache checkout context in localStorage to apply dynamic unlock once verified on success callback
      localStorage.setItem("gob_pending_checkout_item", checkoutPass ? "vip" : (checkoutBook?.id || ""));
      localStorage.setItem("gob_pending_checkout_name", checkoutName);

      const response = await fetch("/api/make-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentEmail,
          customerName: checkoutName,
          customerEmail: checkoutEmail,
          amount: price,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || "বিকাশ পেমেন্ট সেশন তৈরি করতে ব্যর্থ হয়েছে।");
      }

      // Secure redirection to bKash gateway
      window.location.href = data.paymentUrl;

    } catch (err: any) {
      console.error("Payment creation failed:", err);
      setCheckoutError(err?.message || "বিকাশ পেমেন্ট গেটওয়ের সাথে যোগাযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
      setIsRedirecting(false);
    }
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

          if (approvedReq.userEmail === currentEmail) {
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
    const matchesGenre = true;
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

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    navigateToPage(`book/${book.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-beige text-brand-charcoal font-sans-bengali selection:bg-brand-gold/30 selection:text-brand-charcoal" id="platform-root-viewport">
      <Navbar 
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
                  আমার লেখা কিছু সাহিত্যের এক অভিনব ডিজিটাল সংগ্রহ হলো গল্পবাড়ি, এখনই পড়ুন আপনার পছন্দের গল্পগুলো, সম্পূর্ণ বিজ্ঞাপনমুক্ত পরিবেশে।
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

            {/* Featured Book Section */ }
            {books.find(b => b.featured) && (
              <section className="px-6 py-12 max-w-7xl mx-auto flex flex-col items-center" id="home-featured-book-section">
                <div className="w-full max-w-sm bg-brand-charcoal rounded-3xl p-6 shadow-2xl transform hover:scale-103 transition-transform duration-300 border-2 border-brand-gold/50" onClick={() => handleSelectBook(books.find(b => b.featured)!)}>
                  <p className="text-[10px] uppercase font-bold text-brand-gold tracking-widest mb-2">ফিচার্ড উপন্যাস</p>
                  <img src={books.find(b => b.featured)!.coverUrl} className="w-full object-cover rounded-2xl mb-4" alt={books.find(b => b.featured)!.title} referrerPolicy="no-referrer" />
                  <h3 className="font-serif-bengali font-bold text-xl text-white">{books.find(b => b.featured)!.title}</h3>
                </div>
              </section>
            )}

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
            
            {/* About Me Section */ }
            <section className="px-6 py-12 bg-brand-charcoal text-brand-beige relative overflow-hidden" id="home-about-me">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/5 via-transparent to-transparent pointer-events-none" />
              <div className="max-w-xl mx-auto text-center space-y-6 relative z-10">
                <h2 className="text-2xl font-bold font-serif-bengali text-brand-gold flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-brand-gold"></span>
                  আমার কথা
                  <span className="w-8 h-px bg-brand-gold"></span>
                </h2>
                
                <div className="relative">
                  <span className="text-4xl text-brand-gold/20 font-serif absolute -top-6 -left-2">"</span>
                  <p className="text-lg font-serif-bengali leading-relaxed text-white/90">
                    {authorBio}
                  </p>
                  <span className="text-4xl text-brand-gold/20 font-serif absolute -bottom-10 -right-2 transform rotate-180">"</span>
                </div>
                
                <div className="pt-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-brand-gold/30 p-1 bg-brand-charcoal">
                    <img src={NOVELIST_AVATAR} className="w-full h-full object-cover rounded-full" alt="জুনায়েদ হাসান" />
                  </div>
                  <p className="mt-3 text-sm font-bold font-sans-bengali tracking-widest text-brand-gold uppercase">জুনায়েদ হাসান</p>
                  <p className="text-[10px] text-brand-beige/50 font-sans-bengali mt-0.5">প্রতিষ্ঠাতা, গল্পবাড়ি</p>
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
                      onSelect={handleSelectBook}
                      onRead={handleReadRequest}
                      onBuy={setCheckoutBook}
                      isLoggedIn={true}
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
                  onSelect={handleSelectBook}
                  onRead={handleReadRequest}
                  onBuy={setCheckoutBook}
                  isLoggedIn={true}
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
              isAdmin={isAdmin}
              paymentRequests={paymentRequests}
              onApproveRequest={handleApprovePaymentRequest}
              onRejectRequest={handleRejectPaymentRequest}
              authorBio={authorBio}
              onUpdateAuthorBio={handleUpdateAuthorBio}
            />
          </motion.div>
        ) : currentPage === "book-details" && selectedBook ? (
          <motion.div
            key="book-details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex flex-col pt-12 md:pt-16"
          >
            <BookDetailsPage
              book={selectedBook}
              onBack={() => {
                navigate(-1);
              }}
              onRead={handleReadRequest}
              onBuy={setCheckoutBook}
              isLoggedIn={true}
              onDownloadAuthNeeded={() => {
                setAuthMessage("বইটি অফলাইনে ডাউনলোড করতে অনুগ্রহ করে প্রথমে গল্পবাড়িতে লগইন করুন।");
                setAuthModalMode("login");
                setShowAuthModal(true);
              }}
              vIsVip={vIsVip}
              unlockedBookIds={totalUnlockedBookIds}
              books={books}
              onSelectBookByRef={handleSelectBook}
            />
          </motion.div>
        ) : currentPage === "success" ? (
          <motion.div
            key="success-page"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-4 font-sans-bengali"
          >
            <div className="w-full max-w-md bg-white border border-emerald-500/10 rounded-2xl p-6 md:p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
              
              <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-md">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-emerald-950 font-serif-bengali">পেমেন্ট সফল সম্পন্ন হয়েছে!</h2>
                <p className="text-xs text-brand-charcoal/60 leading-relaxed max-w-xs mx-auto">
                  অভিনন্দন! আপনার গল্পবাড়ি পেমেন্টটি বিকাশ পেমেন্ট গেটওয়ের মাধ্যমে পরিশোধ করা হয়েছে।
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/60 divide-y divide-stone-200/40 text-left text-xs font-sans-bengali space-y-2.5">
                <div className="flex justify-between items-center pt-1.5 first:pt-0">
                  <span className="font-bold text-brand-charcoal/50">গ্রাহকের নাম:</span>
                  <span className="font-bold text-brand-charcoal font-sans-bengali">
                    {localStorage.getItem("gob_last_success_name") || "সম্মানিত গ্রাহক"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="font-bold text-brand-charcoal/50">ক্রয়কৃত আইটেম:</span>
                  <span className="font-bold text-brand-charcoal">
                    {localStorage.getItem("gob_last_success_item") === "vip" 
                      ? "👑 ভিআইপি আজীবন মেম্বারশিপ পাস" 
                      : (() => {
                          const item = localStorage.getItem("gob_last_success_item") || "";
                          const foundBook = books.find(b => b.id === item);
                          return foundBook ? `📖 ${foundBook.title}` : "📖 প্রিমিয়াম উপন্যাস";
                        })()
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="font-bold text-brand-charcoal/50">পরিশোধের পরিমাণ:</span>
                  <span className="font-black text-[#E2136E] font-mono text-sm leading-none">
                    ৳ {localStorage.getItem("gob_last_success_item") === "vip" ? "২৯৯ BDT" : "১২০ BDT"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 pb-0.5">
                  <span className="font-bold text-brand-charcoal/50 font-sans-bengali">ট্রান্সজেকশন আইডি:</span>
                  <span className="font-black text-emerald-700 font-mono text-xs uppercase tracking-wider bg-emerald-50/50 border border-emerald-100/60 rounded px-1.5 py-0.5 select-all">
                    {new URLSearchParams(window.location.search).get("trxID") || "SUCCESS"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const item = localStorage.getItem("gob_last_success_item") || "";
                    if (item && item !== "vip") {
                      const bookToRead = books.find(b => b.id === item);
                      if (bookToRead) {
                        setReadingBook(bookToRead);
                        navigateToPage("home");
                        return;
                      }
                    }
                    navigateToPage("home");
                  }}
                  className="flex-1 bg-[#E2136E] hover:bg-[#c40e5d] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-pink-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif-bengali"
                >
                  <BookOpen className="w-3.5 h-3.5" /> পড়া শুরু করুন
                </button>
                <button
                  onClick={() => navigateToPage("home")}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-brand-charcoal font-bold text-xs py-2.5 px-4 rounded-xl border border-stone-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif-bengali"
                >
                  <Home className="w-3.5 h-3.5" /> হোম পেজে ফিরুন
                </button>
              </div>

              <p className="text-[9px] text-brand-charcoal/40 font-mono">🔒 Securely Audited & Authenticated by bKash Gateway</p>
            </div>
          </motion.div>
        ) : currentPage === "cancel" ? (
          <motion.div
            key="cancel-page"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-4 font-sans-bengali"
          >
            <div className="w-full max-w-md bg-white border border-red-500/10 rounded-2xl p-6 md:p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
              
              <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center border-2 border-red-500 shadow-md">
                <X className="w-10 h-10 text-red-600" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-red-950 font-serif-bengali">পেমেন্ট বাতিল বা ব্যর্থ হয়েছে</h2>
                <p className="text-xs text-brand-charcoal/60 leading-relaxed max-w-xs mx-auto">
                  দুঃখিত! পেমেন্ট প্রক্রিয়াটি সম্পন্ন করা সম্ভব হয়নি অথবা বাতিল করা হয়েছে। বিকাশ অ্যাকাউন্ট থেকে কোনো অর্থ কাটা হয়নি।
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const lastItem = localStorage.getItem("gob_pending_checkout_item");
                    if (lastItem === "vip") {
                      setCheckoutPass(true);
                      setCheckoutBook(null);
                    } else if (lastItem) {
                      const book = books.find(b => b.id === lastItem);
                      if (book) {
                        setCheckoutBook(book);
                        setCheckoutPass(false);
                      }
                    }
                    navigateToPage("home");
                  }}
                  className="flex-1 bg-[#E2136E] hover:bg-[#c40e5d] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-pink-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif-bengali"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
                </button>
                <button
                  onClick={() => navigateToPage("home")}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-brand-charcoal font-bold text-xs py-2.5 px-4 rounded-xl border border-stone-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif-bengali"
                >
                  <Home className="w-3.5 h-3.5" /> মূল পাতায় ফিরুন
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              <div className="p-3.5 text-white flex items-center justify-between bg-[#E2136E] relative overflow-hidden border-b border-white/10">
                {/* Diagonal subtle stripes for realism */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_50%,#fff_50%,#fff_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                
                <div className="flex items-center space-x-2.5 z-10">
                  <div className="bg-white/15 p-1.5 rounded-xl backdrop-blur-xs shrink-0 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm font-serif-bengali leading-tight">
                      {checkoutPass ? "গল্পবাড়ি ভিআইপি মেম্বারশিপ পাস" : "গল্পবাড়ি নিরাপদ পেমেন্ট"}
                    </h3>
                    <p className="text-[7.5px] text-white/80 font-sans tracking-widest leading-none mt-0.5 font-bold uppercase">BKASH SECURED GATEWAY</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setCheckoutBook(null); setCheckoutPass(false); }}
                  className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10 cursor-pointer hover:rotate-90 duration-300 flex items-center justify-center"
                  id="checkout-close"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Transaction form details */}
              {isRedirecting ? (
                <div className="p-10 text-center space-y-4 bg-white flex flex-col items-center justify-center min-h-[300px]" id="checkout-redirect-view">
                  <div className="w-12 h-12 border-4 border-[#E2136E] border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1.5 pt-2">
                    <p className="text-sm font-bold font-sans-bengali text-brand-charcoal">বিকাশ গেটওয়েতে সংযোগ করা হচ্ছে...</p>
                    <p className="text-[10px] font-sans-bengali text-brand-charcoal/50">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন। আপনাকে বিকাশ সুরক্ষিত পাতায় পাঠানো হচ্ছে।</p>
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
                  <div className="p-4 space-y-4 bg-stone-50/55">
                    
                    {/* VIP Promotion Upsell inside regular checkout */}
                    {!checkoutPass && checkoutBook && (
                      <div 
                        onClick={() => setCheckoutPass(true)}
                        className="p-2.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10 border border-amber-500/20 cursor-pointer rounded-lg flex items-center justify-between gap-2 text-[10px] font-sans-bengali text-brand-charcoal transition-all mb-1 group"
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

                    {/* Form Fields Section */}
                    <div className="space-y-3 bg-white rounded-xl p-3 border border-brand-charcoal/5 shadow-3xs">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-charcoal/70 font-sans-bengali">আপনার নাম (Full Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: জুনায়েদ হাসান"
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-[#E2136E]/10 focus:border-[#E2136E] rounded-md py-2 px-3 text-xs font-sans-bengali text-brand-charcoal transition-all"
                          id="checkout-name-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-charcoal/70 font-sans-bengali">আপনার ইমেইল (Email Address)</label>
                        <input
                          type="email"
                          required
                          placeholder="name@email.com"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:ring-1 focus:ring-[#E2136E]/10 focus:border-[#E2136E] rounded-md py-2 px-3 text-xs font-mono text-brand-charcoal transition-all"
                          id="checkout-email-input"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] font-sans-bengali text-brand-charcoal/50 leading-relaxed text-center">
                      বিকাশ গেটওয়েতে আপনার পিন বা ওটিপি প্রদান করে পেমেন্ট সম্পন্ন করতে পারবেন। গল্পবাড়ি কখনোই আপনার পিন সংরক্ষণ করে না।
                    </p>
                  </div>

                  {/* Submission and Bottom CTA */}
                  <div className="p-3 bg-stone-100 border-t border-stone-200/50 flex flex-col items-center">
                    <button
                      type="submit"
                      className="w-full bg-[#E2136E] hover:bg-[#c40e5d] text-white font-bold text-xs tracking-wide py-2.5 rounded-xl uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/10 active:scale-98 cursor-pointer font-serif-bengali"
                      id="checkout-verify-btn"
                    >
                      <Sparkles className="w-4 h-4 text-white" /> বিকাশ দিয়ে পে করুন
                    </button>
                    <p className="text-[8px] text-brand-charcoal/40 font-sans mt-1.5">🔒 Automated Secure Checkout Payment Gateway</p>
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
              setShowAuthModal(false);
              if (email === "zunayedalhasan7@gmail.com") {
                setIsAdmin(true);
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
