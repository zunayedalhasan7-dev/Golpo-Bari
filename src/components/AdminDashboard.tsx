import React, { useState, FormEvent } from "react";
import { Book, Chapter } from "../types";
import { NOVELIST_NAME } from "../data";
import { X, Plus, Trash, Edit, Check, ShieldCheck, Key, RefreshCw, Star, StarOff, Sparkles, BookOpen, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  books: Book[];
  onAddBook: (newBook: Book) => void;
  onUpdateBook: (updatedBook: Book) => void;
  onDeleteBook: (id: string) => void;
  onClose: () => void;
  isAdmin?: boolean;
  paymentRequests?: any[];
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
}

export default function AdminDashboard({ 
  books, 
  onAddBook, 
  onUpdateBook, 
  onDeleteBook, 
  onClose, 
  isAdmin = false,
  paymentRequests = [],
  onApproveRequest = () => {},
  onRejectRequest = () => {}
}: AdminDashboardProps) {
  // Authorization State
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(isAdmin);
  const [authError, setAuthError] = useState("");

  // Tab State: "list" | "create" | "edit" | "payments"
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit" | "payments">("list");
  
  // Selection for edit
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [genre, setGenre] = useState("ম্যাজিকাল রিয়ালিজম");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState(120);
  const [pages, setPages] = useState(150);
  const [readTime, setReadTime] = useState("২ ঘণ্টা");
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  
  // Dynamic Chapter Builder
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "ch-1", title: "১. উম্মোচন", content: "এখানে আপনার প্রথম অধ্যায়ের মূল গল্প লিখুন..." }
  ]);

  // Auth Handler (Simple default 1234 passcode)
  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode === "১২৩৪") {
      setIsAuthorized(true);
      setAuthError("");
    } else {
      setAuthError("ভুল পাসকোড! অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    }
  };

  // Safe SVG auto-generator for new books to look highly premium
  const generatePremiumSVG = (bookTitle: string, bookGenre: string) => {
    const randomGradients = [
      { start: "%232d3748", end: "%231a202c" },
      { start: "%231a365d", end: "%232b6cb0" },
      { start: "%23319795", end: "%232c5282" },
      { start: "%232c3e50", end: "%23fd79a8" }
    ];
    const grad = randomGradients[Math.floor(Math.random() * randomGradients.length)];
    
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%"><defs><linearGradient id="gAuto" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${grad.start}"/><stop offset="100%" stop-color="${grad.end}"/></linearGradient></defs><rect width="400" height="600" fill="url(%23gAuto)"/><rect x="20" y="20" width="360" height="560" fill="none" stroke="%23c5a47e" stroke-width="2" stroke-opacity="0.6"/><text x="200" y="280" font-family="'Noto Serif Bengali', serif" font-weight="900" font-size="28" fill="%23fbfaf7" text-anchor="middle">${bookTitle}</text><text x="200" y="325" font-family="'Hind Siliguri', sans-serif" font-weight="300" font-size="14" fill="%23c5a47e" letter-spacing="4" text-anchor="middle">${bookGenre.toUpperCase()}</text><text x="200" y="440" font-family="'Hind Siliguri', sans-serif" font-weight="500" font-size="16" fill="%23fbfaf7" text-anchor="middle">${NOVELIST_NAME}</text><circle cx="200" cy="150" r="30" fill="none" stroke="%23c5a47e" stroke-width="1"/></svg>`;
  };

  // Chapter handlers
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    setChapters([
      ...chapters,
      { id: `ch-${Date.now()}`, title: `${nextNum}. নতুন অধ্যায়`, content: "গল্পের পরবর্তী অংশ..." }
    ]);
  };

  const handleRemoveChapter = (id: string) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((ch) => ch.id !== id));
    }
  };

  const handleChapterTitleChange = (id: string, text: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, title: text } : ch)));
  };

  const handleChapterContentChange = (id: string, text: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, content: text } : ch)));
  };

  // Replace alert with on-page error
  const [formError, setFormError] = useState("");

  // Form Submitter
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title || !shortDesc) {
      setFormError("উপন্যাসের নাম এবং সংক্ষিপ্ত বিবরণ দেওয়া আবশ্যক।");
      return;
    }

    if (activeTab === "create") {
      const coverUrl = generatePremiumSVG(title, genre);
      const newBook: Book = {
        id: `custom-${Date.now()}`,
        title,
        titleEn: titleEn || "untitled_book",
        author: NOVELIST_NAME,
        genre,
        shortDesc,
        longDesc: longDesc || shortDesc,
        coverUrl,
        isPremium,
        price: isPremium ? Number(price) : 0,
        rating: 5.0,
        reviewsCount: 1,
        pages: Number(pages),
        publishedDate: "আজ, ১৪৩৩",
        readTime,
        featured,
        popular,
        views: 120,
        chapters,
      };
      
      onAddBook(newBook);
      resetForm();
      setActiveTab("list");
    } else if (activeTab === "edit" && editingBookId) {
      const original = books.find((b) => b.id === editingBookId);
      if (!original) return;

      const updatedBook: Book = {
        ...original,
        title,
        titleEn: titleEn || original.titleEn,
        genre,
        shortDesc,
        longDesc: longDesc || original.longDesc,
        isPremium,
        price: isPremium ? Number(price) : 0,
        pages: Number(pages),
        readTime,
        featured,
        popular,
        chapters,
      };

      onUpdateBook(updatedBook);
      resetForm();
      setActiveTab("list");
    }
  };

  // Edit load trigger
  const handleEditTrigger = (b: Book) => {
    setEditingBookId(b.id);
    setTitle(b.title);
    setTitleEn(b.titleEn);
    setGenre(b.genre);
    setShortDesc(b.shortDesc);
    setLongDesc(b.longDesc);
    setIsPremium(b.isPremium);
    setPrice(b.price || 120);
    setPages(b.pages);
    setReadTime(b.readTime);
    setFeatured(b.featured);
    setPopular(b.popular);
    setChapters(b.chapters);
    setActiveTab("edit");
  };

  const resetForm = () => {
    setEditingBookId(null);
    setTitle("");
    setTitleEn("");
    setGenre("ম্যাজিকাল রিয়ালিজম");
    setShortDesc("");
    setLongDesc("");
    setIsPremium(false);
    setPrice(120);
    setPages(150);
    setReadTime("২ ঘণ্টা");
    setFeatured(false);
    setPopular(false);
    setChapters([{ id: "ch-1", title: "১. উম্মোচন", content: "গল্প লিখুন..." }]);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8" id="admin-page-container">
      <AnimatePresence>
        {!isAuthorized ? (
          /* High-Fidelity Authorization Portal */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm mx-auto mt-20 bg-white border border-brand-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl relative"
            id="admin-auth-panel"
          >

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-500/10"
              id="admin-auth-close"
            >
              <X className="w-4 h-4 text-brand-charcoal/50" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-charcoal py-3 mx-auto text-brand-gold flex items-center justify-center shadow-lg border border-brand-gold/20">
                <Key className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif-bengali text-brand-charcoal">গল্পবাড়ি লেখক প্রবেশদ্বার</h3>
                <p className="text-xs font-sans-bengali text-brand-charcoal/50 mt-1">প্যানেলটি কেবল জুনায়েদ হাসান সাহেবের ব্যবহারের জন্য সুরক্ষিত।</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4 pt-2">
                <div>
                  <label className="block text-left text-xs font-semibold text-brand-charcoal/60 mb-1.5 font-sans-bengali">৪ সংখ্যার লেখক পাসকোড:</label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-center bg-white border border-brand-gold/20 rounded-xl py-3 px-4 text-brand-charcoal font-bold tracking-widest text-lg focus:outline-none focus:border-brand-gold font-mono"
                    autoFocus
                    id="admin-passcode-input"
                  />
                  <p className="text-[10px] text-brand-gold mt-1 font-mono">সংকেত: "1234" বা "১২৩৪"</p>
                </div>

                {authError && (
                  <p className="text-xs text-red-500 font-semibold font-sans-bengali bg-red-50 border border-red-100 p-2 rounded-xl">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-charcoal text-brand-gold px-4 py-3 rounded-xl text-xs font-bold font-sans-bengali shadow-md hover:bg-brand-charcoal/90 transition-all flex items-center justify-center gap-1.5 border border-brand-gold/20"
                  id="admin-auth-submit"
                >
                  <ShieldCheck className="w-4 h-4" />
                  প্যানেল উম্মোচন করুন
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* Actual High-Fidelity Workspace Cockpit Dashboard */
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-brand-beige border border-brand-gold/25 shadow-2xl rounded-3xl overflow-hidden flex flex-col min-h-[70vh]"
            id="admin-dashboard-panel"
          >
            {/* Header */}
            <div className="bg-brand-charcoal p-5 md:px-8 flex items-center justify-between border-b border-brand-gold/20">
              <div className="flex items-center space-x-3 text-brand-beige">
                <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold text-lg font-serif-bengali shadow-md">
                  লে
                </div>
                <div>
                  <h2 className="font-bold text-lg md:text-xl font-serif-bengali text-brand-gold flex items-center gap-1.5">
                    রচনালয় <span className="text-[10px] bg-brand-gold-dark/30 border border-brand-gold/30 text-brand-gold px-2 py-0.5 rounded-full font-light font-sans-bengali">লেখক ড্যাশবোর্ড</span>
                  </h2>
                  <p className="text-[10px] md:text-xs text-brand-beige/50 font-sans-bengali">অনন্য প্রকাশনা, সম্পাদনা ও সংকলন কক্ষ</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors duration-300 text-brand-beige/70 hover:text-white"
                id="admin-panel-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar Navigation Tabs */}
              <aside className="w-full md:w-56 bg-brand-sepia/40 border-b md:border-b-0 md:border-r border-brand-gold/15 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                <button
                  onClick={() => { setActiveTab("list"); resetForm(); }}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold font-sans-bengali flex items-center gap-2 transition-colors ${
                    activeTab === "list" ? "bg-brand-charcoal text-brand-gold shadow-md" : "text-brand-charcoal/60 hover:bg-brand-gold/10"
                  }`}
                  id="admin-tab-list"
                >
                  <BookOpen className="w-4 h-4" />
                  বইয়ের তালিকা ({books.length})
                </button>
                <button
                  onClick={() => { setActiveTab("create"); resetForm(); }}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold font-sans-bengali flex items-center gap-2 transition-colors shrink-0 md:shrink ${
                    activeTab === "create" ? "bg-brand-charcoal text-brand-gold shadow-md" : "text-brand-charcoal/60 hover:bg-brand-gold/10"
                  }`}
                  id="admin-tab-create"
                >
                  <Plus className="w-4 h-4" />
                  নতুন বই প্রকাশ
                </button>
                <button
                  onClick={() => { setActiveTab("payments"); }}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold font-sans-bengali flex items-center gap-2 transition-colors shrink-0 md:shrink ${
                    activeTab === "payments" ? "bg-brand-charcoal text-brand-gold shadow-md" : "text-brand-charcoal/60 hover:bg-brand-gold/10"
                  }`}
                  id="admin-tab-payments"
                >
                  <Award className="w-4 h-4" />
                  পেমেন্ট রিকোয়েস্ট {paymentRequests.filter((r) => r.status === "pending").length > 0 && (
                    <span className="bg-[#E2136E] text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-auto animate-pulse shrink-0">
                      {paymentRequests.filter((r) => r.status === "pending").length}
                    </span>
                  )}
                </button>

                {activeTab === "edit" && (
                  <div className="w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold font-sans-bengali flex items-center gap-2 bg-brand-gold/25 border border-brand-gold text-brand-charcoal shrink-0 md:shrink">
                    <Edit className="w-4 h-4 text-brand-gold-dark" />
                    সম্পাদনা প্যানেল
                  </div>
                )}
              </aside>

              {/* Central editor panel */}
              <main className="flex-1 overflow-y-auto p-5 md:p-8" id="admin-main-canvas">
                <AnimatePresence mode="wait">
                  {activeTab === "list" ? (
                    /* Novelist Catalog manager list */
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                      id="admin-novel-list"
                    >
                      <h4 className="text-sm font-bold font-serif-bengali text-brand-charcoal border-b border-brand-gold/15 pb-2">আপনার প্রকাশিত গল্পসমূহ</h4>
                      {books.map((b) => (
                        <div key={b.id} className="bg-white border border-brand-gold/15 rounded-2xl p-4 flex items-center justify-between shadow-xs card-hover-glow transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 rounded overflow-hidden aspect-[3/4] shadow bg-brand-charcoal" dangerouslySetInnerHTML={{ __html: b.coverUrl }} />
                            <div>
                              <h5 className="font-bold text-sm md:text-base font-serif-bengali text-brand-charcoal flex items-center gap-2">
                                {b.title}
                                {b.isPremium ? (
                                  <span className="text-[9px] font-bold bg-brand-charcoal border border-brand-gold/30 text-brand-gold px-1.5 py-0.2 rounded font-sans-bengali">৳{b.price}</span>
                                ) : (
                                  <span className="text-[9px] font-bold bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.2 rounded font-sans-bengali">ফ্রি</span>
                                )}
                              </h5>
                              <p className="text-[10px] text-brand-charcoal/50 font-sans-bengali mt-0.5">
                                বিভাগ: {b.genre} • অধ্যায় সংখ্যা: {b.chapters.length}টি • দর্শক: {b.views}
                              </p>
                              
                              <div className="flex items-center gap-1.5 mt-2">
                                {b.featured && <span className="text-[9px] bg-brand-gold/30 text-brand-charcoal border border-brand-gold/40 px-2 py-0.5 rounded-full font-semibold font-sans-bengali">Featured</span>}
                                {b.popular && <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-semibold font-sans-bengali">Popular</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2">
                            <button
                              onClick={() => handleEditTrigger(b)}
                              className="p-2 rounded-xl text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-neutral-500/10 transition-all border border-brand-gold/10 hover:border-brand-gold/30"
                              title="সম্পাদনা করুন"
                              id={`admin-edit-btn-${b.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                onDeleteBook(b.id);
                              }}
                              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all border border-red-100"
                              title="ডিলিট করুন"
                              id={`admin-delete-btn-${b.id}`}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : activeTab === "payments" ? (
                    /* Payments verification history list */
                    <motion.div
                      key="payments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 font-sans-bengali text-left"
                      id="admin-payments-list"
                    >
                      <h4 className="text-sm font-bold font-serif-bengali text-brand-charcoal border-b border-brand-gold/15 pb-2">পেমেন্ট ভেরিফিকেশন ও মেম্বারশিপ রিকোয়েস্টসমূহ</h4>
                      {paymentRequests.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-brand-gold/10 rounded-2xl flex flex-col items-center justify-center p-4">
                          <Award className="w-12 h-12 text-brand-charcoal/20 mb-2.5 animate-pulse" />
                          <p className="text-xs font-bold text-brand-charcoal/50">এখন পর্যন্ত কোনো পেমেন্ট রিকোয়েস্ট পাঠানো হয়নি।</p>
                          <p className="text-[10px] text-brand-charcoal/40 mt-1">ব্যবহারকারীরা বিকাশ ফর্মে পেমেন্ট ভেরিফাই করলে এখানে নোটিফিকেশন আসবে।</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentRequests.map((req: any) => (
                            <div key={req.id} className="bg-white border border-brand-gold/15 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs hover:shadow-2xs transition-shadow">
                              <div className="space-y-1 md:max-w-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-serif-bengali font-extrabold text-sm text-brand-charcoal">{req.name}</span>
                                  <span className="text-[10px] bg-brand-charcoal/5 border border-brand-charcoal/10 text-brand-charcoal/60 px-1.5 py-0.2 rounded font-mono font-bold select-all">{req.userEmail}</span>
                                  <span className="text-[9px] bg-stone-100 text-stone-500 font-sans px-1.5 py-0.2 rounded font-bold">{req.timestamp}</span>
                                </div>
                                <div className="text-[11px] font-sans-bengali text-brand-charcoal/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span>মোবাইল: <strong className="font-mono text-[10px] text-brand-charcoal">{req.phone}</strong></span>
                                  <span>আইটেম: <strong className="text-brand-gold-dark font-sans-bengali">{req.itemName}</strong></span>
                                  <span>মূল্য: <strong className="text-[#E2136E] font-bold">৳{req.amount}</strong></span>
                                </div>
                                <div className="pt-1.5 flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-brand-charcoal/50">বিকাশ TrxID:</span>
                                  <span className="text-[10px] bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20 px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider select-all">
                                    {req.trxId}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 justify-end shrink-0 pt-2 md:pt-0">
                                {req.status === "pending" ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onRejectRequest(req.id)}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                      title="প্রত্যাখ্যান করুন"
                                      id={`btn-reject-${req.id}`}
                                    >
                                      reject (প্রত্যাখ্যান)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onApproveRequest(req.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] py-1.5 px-3.5 rounded-lg shadow-xs transition-all flex items-center gap-1 hover:scale-102 active:scale-98 cursor-pointer"
                                      title="অনুমোদন করুন"
                                      id={`btn-approve-${req.id}`}
                                    >
                                      approve (অনুমোদন)
                                    </button>
                                  </>
                                ) : (
                                  <span className={`text-[9px] font-bold font-sans px-2.5 py-1 rounded-full border ${
                                    req.status === "approved" 
                                      ? "bg-green-50 border-green-200 text-green-600" 
                                      : "bg-red-50 border-red-200 text-red-600"
                                  }`}>
                                    {req.status === "approved" ? "✅ APPROVED (অনুমোদিত)" : "❌ REJECTED (প্রত্যাখ্যাত)"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* Creating/Editing unified workspace form */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      id="admin-editor-form"
                    >
                      <h4 className="text-sm font-bold font-serif-bengali text-brand-charcoal border-b border-brand-gold/15 pb-2">
                        {activeTab === "create" ? "নতুন সাহিত্য প্রকাশ করুন" : `"${title}" সম্পাদনালয়`}
                      </h4>
                      
                      {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold font-sans-bengali">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">উপন্যাসের নাম (বাংলায়):</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: মন কেমনের জলসাঘর"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-serif-bengali focus:outline-none focus:border-brand-gold"
                            id="form-title-bn"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">উপন্যাসের নাম (ইংরেজিতে):</label>
                          <input
                            type="text"
                            placeholder="যেমন: Mon Kemoner Jolsaghor"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-gold"
                            id="form-title-en"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">বিভাগ বা জনরা:</label>
                          <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-gold"
                            id="form-genre"
                          >
                            <option value="ম্যাজিকাল রিয়ালিজম">ম্যাজিকাল রিয়ালিজম (Magical Realism)</option>
                            <option value="রহস্য ও থ্রিলার">রহস্য ও থ্রিলার (Mystery / Thriller)</option>
                            <option value="ধ্রুপদী উপন্যাস">ধ্রুপদী উপন্যাস (Classical Novel)</option>
                            <option value="মনস্তাত্ত্বিক উপন্যাস">মনস্তাত্ত্বিক উপন্যাস (Psychological Novel)</option>
                            <option value="রোমান্টিক সামাজিক">রোমান্টিক সামাজিক (Romantic Drama)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">আনুমানিক পড়ার সময়:</label>
                          <input
                            type="text"
                            placeholder="যেমন: ৩ ঘণ্টা"
                            value={readTime}
                            onChange={(e) => setReadTime(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-gold"
                            id="form-read-time"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-brand-gold/10 pt-4">
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-gold/10">
                          <input
                            type="checkbox"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                            className="w-4 h-4 text-brand-gold border-brand-gold/30 rounded focus:ring-brand-gold"
                            id="form-is-premium"
                          />
                          <label htmlFor="form-is-premium" className="text-xs font-bold text-brand-charcoal/70 font-sans-bengali cursor-pointer select-none">
                            প্রিমিয়াম উপন্যাস (Paid)
                          </label>
                        </div>

                        {isPremium && (
                          <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">বইয়ের মূল্য (টাকা ৳):</label>
                            <input
                              type="number"
                              min="1"
                              value={price}
                              onChange={(e) => setPrice(Number(e.target.value))}
                              className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-gold"
                              id="form-price"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">মোট পৃষ্ঠা সংখ্যা:</label>
                          <input
                            type="number"
                            min="10"
                            value={pages}
                            onChange={(e) => setPages(Number(e.target.value))}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-gold"
                            id="form-pages"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-gold/10 pt-4">
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-gold/10">
                          <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="w-4 h-4 text-brand-gold border-brand-gold/30 rounded focus:ring-brand-gold"
                            id="form-featured"
                          />
                          <label htmlFor="form-featured" className="text-xs font-bold text-brand-charcoal/70 font-sans-bengali cursor-pointer select-none">
                            হোম পেজে ফিচার্ড স্লাইডারে রাখুন
                          </label>
                        </div>

                        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-gold/10">
                          <input
                            type="checkbox"
                            checked={popular}
                            onChange={(e) => setPopular(e.target.checked)}
                            className="w-4 h-4 text-brand-gold border-brand-gold/30 rounded focus:ring-brand-gold"
                            id="form-popular"
                          />
                          <label htmlFor="form-popular" className="text-xs font-bold text-brand-charcoal/70 font-sans-bengali cursor-pointer select-none">
                            জনপ্রিয় তালিকায় যোগ করুন
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-brand-gold/10 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">সংক্ষিপ্ত কভার মকআপ বিবরণ (Emotional Line):</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: এক জাদুকরী বৃষ্টির দুপুরে অপরাজিতার এক অজানা রেশমি রহস্য..."
                            value={shortDesc}
                            onChange={(e) => setShortDesc(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-gold"
                            id="form-short-desc"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal/70 mb-1.5 font-sans-bengali">মূল সিনোপসিস বা দীর্ঘ গদ্য বিবরণ:</label>
                          <textarea
                            rows={4}
                            placeholder="এখানে সমস্ত সিনোপসিস লিখুন বা কপি করে বসিয়ে দিন..."
                            value={longDesc}
                            onChange={(e) => setLongDesc(e.target.value)}
                            className="w-full bg-white border border-brand-gold/15 rounded-xl py-2 px-3 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-gold resize-none"
                            id="form-long-desc"
                          />
                        </div>
                      </div>

                      {/* Chapters Builder Sections */}
                      <div className="space-y-4 border-t border-brand-gold/15 pt-6 bg-white p-4 rounded-2xl border border-brand-gold/10">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs uppercase text-brand-gold tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            অধ্যায়সমূহ ও রচনা সংস্করণ
                          </h5>
                          <button
                            type="button"
                            onClick={handleAddChapter}
                            className="bg-brand-charcoal hover:bg-brand-charcoal/80 text-brand-gold px-3 py-1.5 rounded-xl text-[10px] font-bold font-sans-bengali flex items-center gap-1 transition-all"
                            id="add-chapter-form-btn"
                          >
                            <Plus className="w-3 h-3" />
                            নতুন অধ্যায় বানান
                          </button>
                        </div>

                        <div className="space-y-4">
                          {chapters.map((ch, idx) => (
                            <div key={ch.id} className="border border-brand-gold/10 p-3 rounded-xl bg-brand-beige/50 space-y-3 relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-mono font-bold text-brand-gold">অধ্যায় - {idx + 1}</span>
                                {chapters.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveChapter(ch.id)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    id={`remove-chapter-${ch.id}`}
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <input
                                type="text"
                                value={ch.title}
                                onChange={(e) => handleChapterTitleChange(ch.id, e.target.value)}
                                placeholder="যেমন: ১. ঝড়ের প্রথম স্পর্শ"
                                className="w-full bg-white border border-brand-gold/10 rounded-lg py-1.5 px-3.5 text-xs font-bold font-serif-bengali text-brand-charcoal focus:outline-none"
                                id={`chapter-title-input-${ch.id}`}
                              />

                              <textarea
                                rows={4}
                                value={ch.content}
                                onChange={(e) => handleChapterContentChange(ch.id, e.target.value)}
                                placeholder="এই অধ্যায়ের মূল গল্প লিখুন..."
                                className="w-full bg-white border border-brand-gold/10 rounded-lg py-2 px-3.5 text-xs font-serif-bengali text-brand-charcoal focus:outline-none leading-relaxed"
                                id={`chapter-content-input-${ch.id}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Finish publish controllers */}
                      <div className="flex items-center gap-3 pt-4 border-t border-brand-gold/15">
                        <button
                          type="submit"
                          className="flex-1 bg-brand-charcoal text-brand-gold hover:bg-brand-charcoal/95 border border-brand-gold/40 py-3 rounded-xl text-xs font-bold font-sans-bengali flex items-center justify-center gap-2 transition-all shadow-md"
                          id="submit-book-btn"
                        >
                          <Check className="w-4 h-4 text-brand-gold" />
                          {activeTab === "create" ? "সাহিত্য সংকলন উম্মোচন করুন" : "পরিপত্র সেভ করুন"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setActiveTab("list");
                          }}
                          className="px-5 py-3 border border-brand-gold/10 hover:bg-brand-gold/10 hover:text-brand-charcoal font-semibold text-xs rounded-xl text-brand-charcoal/60 font-sans-bengali transition-colors"
                          id="cancel-book-btn"
                        >
                          বাতিল
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
