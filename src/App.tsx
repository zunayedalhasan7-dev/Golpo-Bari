import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Book, AppItem } from "./types";
import { BOOK_DATA, NOVELIST_BIO, NOVELIST_NAME, NOVELIST_AVATAR, DEFAULT_APPS } from "./data";
import Navbar from "./components/Navbar";
import BookCard from "./components/BookCard";
import ReadingApp from "./components/ReadingApp";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import BookDetailsPage from "./pages/BookDetailsPage";
import PremiumPage from "./pages/PremiumPage";
import AppsPage from "./pages/AppsPage";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, Award, Search, Sparkles, ArrowRight, Smartphone, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, increment } from "firebase/firestore";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const [books, setBooks] = useState<Book[]>([]);
  const [apps, setApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem("gob_apps_catalog");
    return saved ? JSON.parse(saved) : DEFAULT_APPS;
  });

  // Realtime Books from Firestore
  useEffect(() => {
    const q = query(collection(db, "books"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbBooks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Book));
      setBooks(dbBooks.length > 0 ? dbBooks : BOOK_DATA);
    }, (err) => {
      console.warn("Firestore books error:", err);
    });
    return () => unsubscribe();
  }, []);

  // Realtime Apps from Firestore
  useEffect(() => {
    const q = query(collection(db, "apps"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbApps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppItem));
      if (dbApps.length > 0) {
        setApps(dbApps);
        localStorage.setItem("gob_apps_catalog", JSON.stringify(dbApps));
      } else {
        setApps(DEFAULT_APPS);
      }
    }, (err) => {
      console.warn("Firestore apps error:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = location.pathname.substring(1) || "home";
    if (path.startsWith("book/")) {
      const bookId = path.substring(5);
      const activeList = books.length > 0 ? books : BOOK_DATA;
      const foundBook = activeList.find((b) => b.id === bookId);
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
        setSelectedBook(null);
      }
    }
  }, [location.pathname, books]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedBook, readingBook]);

  const [authorBio, setAuthorBio] = useState<string>(() => {
    return localStorage.getItem("gob_author_bio") || NOVELIST_BIO;
  });

  const handleUpdateAuthorBio = (newBio: string) => {
    setAuthorBio(newBio);
    localStorage.setItem("gob_author_bio", newBio);
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

  // App handlers for Admin
  const handleAddApp = async (nApp: AppItem) => {
    try {
      await addDoc(collection(db, "apps"), {
        ...nApp,
        createdAt: new Date()
      });
    } catch (e) {
      console.error("Error adding app to Firestore: ", e);
      const updated = [nApp, ...apps];
      setApps(updated);
      localStorage.setItem("gob_apps_catalog", JSON.stringify(updated));
    }
  };

  const handleUpdateApp = async (uApp: AppItem) => {
    try {
      const appRef = doc(db, "apps", uApp.id);
      await updateDoc(appRef, { ...uApp });
    } catch (e) {
      console.error("Error updating app: ", e);
      const updated = apps.map(a => a.id === uApp.id ? uApp : a);
      setApps(updated);
      localStorage.setItem("gob_apps_catalog", JSON.stringify(updated));
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      const appRef = doc(db, "apps", id);
      await deleteDoc(appRef);
    } catch (e) {
      console.error("Error deleting app: ", e);
      const updated = apps.filter(a => a.id !== id);
      setApps(updated);
      localStorage.setItem("gob_apps_catalog", JSON.stringify(updated));
    }
  };

  const catalogBooks = books.length > 0 ? books : BOOK_DATA;

  // Filter & Search Engine
  const filteredBooks = catalogBooks.filter((b) => {
    const matchesSearch = b.title.includes(searchQuery) || b.genre.includes(searchQuery) || b.shortDesc.includes(searchQuery);
    const matchesGenre = genreFilter === "সব বিভাগ" || b.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const genres = ["সব বিভাগ", ...Array.from(new Set(catalogBooks.map(b => b.genre)))];

  const navigateToPage = (target: string) => {
    navigate("/" + target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    navigateToPage(`book/${book.id}`);
  };

  const featuredApp = apps[0] || DEFAULT_APPS[0];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFA] text-[#111111]" id="platform-root-viewport">
      <Navbar 
        navigateToPage={navigateToPage}
        currentPage={currentPage}
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
            {/* Borderless Minimalist Hero */}
            <section className="relative px-6 py-20 md:py-32 max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
              <div className="flex-1 space-y-6">
                <span className="inline-block bg-brand-gold/15 text-brand-charcoal text-xs font-bold px-4 py-1.5 rounded-full">
                  জুনায়েদ হাসানের সাহিত্য সম্ভার
                </span>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif-bengali leading-[1.1] text-brand-charcoal tracking-tight">
                  শব্দের ক্যানভাসে<br/>অফুরন্ত গল্প
                </h1>

                <p className="text-sm md:text-base text-neutral-600 font-sans-bengali font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  সবগুলো উপন্যাস এবং মোবাইল অ্যাপ্লিকেশন এখন সম্পূর্ণ বিনামূল্যে ও বিজ্ঞাপনমুক্ত পরিবেশে উপভোগ করুন।
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <button 
                    onClick={() => navigateToPage("read")}
                    className="w-full sm:w-auto bg-brand-charcoal hover:bg-black text-brand-gold text-xs md:text-sm font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-brand-gold" /> উপন্যাসসমূহ পড়ুন
                  </button>

                  <button 
                    onClick={() => navigateToPage("apps")}
                    className="w-full sm:w-auto bg-white hover:bg-neutral-50 text-brand-charcoal text-xs md:text-sm font-bold py-4 px-7 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-brand-gold" /> অ্যাপস ডাউনলোড
                  </button>
                </div>
              </div>

              {/* Author Avatar Preview */}
              <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl bg-brand-charcoal relative">
                <img src={NOVELIST_AVATAR} className="w-full h-full object-cover opacity-90" alt="জুনায়েদ হাসান" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <span className="text-white font-serif-bengali font-bold text-lg">জুনায়েদ হাসান</span>
                </div>
              </div>
            </section>

            {/* Homepage: Show ONLY SOME books (first 2 books), NO ALL */}
            <section className="px-6 py-16 max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-serif-bengali text-brand-charcoal">নির্বাচিত উপন্যাস</h2>
                <button 
                  onClick={() => navigateToPage("read")}
                  className="text-xs font-bold text-brand-charcoal hover:text-brand-gold flex items-center gap-1 cursor-pointer"
                >
                  সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                {catalogBooks.slice(0, 2).map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelect={handleSelectBook}
                    onRead={(b) => setReadingBook(b)}
                    isLoggedIn={isLoggedIn}
                    onDownloadAuthNeeded={() => {}}
                  />
                ))}
              </div>
            </section>

            {/* Official Mobile App Showcase Section */}
            {featuredApp && (
              <section className="px-6 py-12 max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-brand-charcoal/5 flex items-center justify-center shadow-xs shrink-0">
                      {featuredApp.iconUrl && (featuredApp.iconUrl.startsWith("http") || featuredApp.iconUrl.startsWith("/uploads") || featuredApp.iconUrl.startsWith("data:image")) ? (
                        <img src={featuredApp.iconUrl} alt={featuredApp.name} className="w-full h-full object-cover" />
                      ) : (
                        <Smartphone className="w-10 h-10 text-brand-charcoal" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-charcoal">
                          {featuredApp.category || "অ্যান্ড্রয়েড APK"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {featuredApp.version}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-brand-charcoal">
                        {featuredApp.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-sans-bengali max-w-md">
                        {featuredApp.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => navigateToPage("apps")}
                      className="w-full sm:w-auto bg-brand-charcoal hover:bg-black text-brand-gold text-xs font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4 text-brand-gold" />
                      অ্যাপ ডাউনলোড করুন
                    </button>
                    <button
                      onClick={() => navigateToPage("apps")}
                      className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer"
                    >
                      সব অ্যাপস ({apps.length})
                    </button>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        ) : currentPage === "read" ? (
          <motion.div
            key="read-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 md:py-20"
          >
            <div className="mb-10 text-center max-w-xl mx-auto space-y-4">
              <h1 className="text-3xl md:text-4xl font-black font-serif-bengali text-brand-charcoal">সকল উপন্যাস</h1>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="বই খুঁজুন..."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-xs font-sans-bengali focus:outline-none shadow-2xs"
                />
              </div>

              {/* Genre Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenreFilter(g)}
                    className={`text-xs px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      genreFilter === g
                        ? "bg-brand-charcoal text-brand-gold font-bold shadow-xs"
                        : "bg-white text-neutral-600 hover:text-brand-charcoal"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onRead={(b) => setReadingBook(b)}
                  isLoggedIn={isLoggedIn}
                  onDownloadAuthNeeded={() => {}}
                />
              ))}
            </div>
          </motion.div>
        ) : currentPage === "apps" ? (
          <AppsPage apps={apps} />
        ) : currentPage === "premium" ? (
          <PremiumPage 
            books={catalogBooks}
            onSelectBook={handleSelectBook}
            onReadBook={(b) => setReadingBook(b)}
            isLoggedIn={isLoggedIn}
            onDownloadAuthNeeded={() => {}}
          />
        ) : currentPage === "book-details" && selectedBook ? (
          <BookDetailsPage
            book={selectedBook}
            onBack={() => navigateToPage("read")}
            onRead={(b) => setReadingBook(b)}
            isLoggedIn={isLoggedIn}
            onDownloadAuthNeeded={() => {}}
            books={catalogBooks}
            onSelectBookByRef={handleSelectBook}
          />
        ) : currentPage === "admin" ? (
          <AdminDashboard
            books={catalogBooks}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            apps={apps}
            onAddApp={handleAddApp}
            onUpdateApp={handleUpdateApp}
            onDeleteApp={handleDeleteApp}
            authorBio={authorBio}
            onUpdateAuthorBio={handleUpdateAuthorBio}
            paymentRequests={[]}
            onApproveRequest={() => {}}
            onRejectRequest={() => {}}
            onClose={() => navigateToPage("home")}
          />
        ) : (
          <Navigate to="/home" replace />
        )}
      </AnimatePresence>

      <Footer 
        onPageChange={navigateToPage}
        onAdminOpen={() => navigateToPage("admin")}
      />

      {/* Immersive Reading Modal */}
      {readingBook && (
        <ReadingApp
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}
    </div>
  );
}
