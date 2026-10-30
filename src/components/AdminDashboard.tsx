import React, { useState, FormEvent, ChangeEvent } from "react";
import { Book, Chapter, AppItem } from "../types";
import { NOVELIST_NAME } from "../data";
import { 
  X, 
  Plus, 
  Trash, 
  Edit, 
  Check, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  BookOpen, 
  Award, 
  User, 
  Smartphone, 
  Upload, 
  Download, 
  HardDrive, 
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  FolderUp,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { convertBijoyToUnicode } from "bijoy2unicode";

interface AdminDashboardProps {
  books: Book[];
  onAddBook: (newBook: Book) => void;
  onUpdateBook: (updatedBook: Book) => void;
  onDeleteBook: (id: string) => void;
  apps?: AppItem[];
  onAddApp?: (newApp: AppItem) => void;
  onUpdateApp?: (updatedApp: AppItem) => void;
  onDeleteApp?: (id: string) => void;
  onClose: () => void;
  isAdmin?: boolean;
  paymentRequests?: any[];
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
  authorBio: string;
  onUpdateAuthorBio: (newBio: string) => void;
}

export default function AdminDashboard({ 
  books, 
  onAddBook, 
  onUpdateBook, 
  onDeleteBook, 
  apps = [],
  onAddApp = () => {},
  onUpdateApp = () => {},
  onDeleteApp = () => {},
  onClose, 
  isAdmin = false,
  paymentRequests = [],
  onApproveRequest = () => {},
  onRejectRequest = () => {},
  authorBio,
  onUpdateAuthorBio
}: AdminDashboardProps) {
  // Authorization State
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");

  // Auth Handler
  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "Champa01626538051") {
      setIsAuthorized(true);
      setAuthError("");
    } else {
      setAuthError("ভুল পাসওয়ার্ড! সঠিক পাসকোড দিয়ে প্রবেশ করুন।");
    }
  };

  // Tab State: "list" | "create" | "edit" | "apps" | "create_app" | "edit_app" | "payments" | "bio"
  const [activeTab, setActiveTab] = useState<
    "list" | "create" | "edit" | "apps" | "create_app" | "edit_app" | "payments" | "bio"
  >("list");
  
  // Selection for edit
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // Bio state in editor
  const [tempBio, setTempBio] = useState(authorBio);

  // Book Form State
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
  const [pdfUrl, setPdfUrl] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState("");

  // App Form State
  const [appName, setAppName] = useState("");
  const [appCategory, setAppCategory] = useState("অ্যান্ড্রয়েড অ্যাপ (APK)");
  const [appVersion, setAppVersion] = useState("v1.0.0");
  const [appSize, setAppSize] = useState("15.0 MB");
  const [appDownloadUrl, setAppDownloadUrl] = useState("");
  const [appIconUrl, setAppIconUrl] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appPlatform, setAppPlatform] = useState("Android");
  const [appFeaturesText, setAppFeaturesText] = useState("অফলাইনে উপন্যাস পড়ার সুবিধা\nডার্ক ও সেপিয়া রিডিং মোড\nবিজ্ঞাপনহীন মসৃণ অভিজ্ঞতা");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Custom Bijoy to Unicode translator helper
  const fixBijoyText = (text: string): string => {
    if (!text) return "";
    try {
      const result = convertBijoyToUnicode(text);
      return result || text;
    } catch (e) {
      console.error("Error in Bijoy conversion: ", e);
      return text;
    }
  };
  
  // Dynamic Chapter Builder
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "ch-1", title: "১. উম্মোচন", content: "এখানে আপনার প্রথম অধ্যায়ের মূল গল্প লিখুন..." }
  ]);

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

  const [formError, setFormError] = useState("");

  // Book Form Submitter
  const handleSubmitBook = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title || !shortDesc) {
      setFormError("উপন্যাসের নাম এবং সংক্ষিপ্ত বিবরণ দেওয়া আবশ্যক।");
      return;
    }

    if (activeTab === "create") {
      const coverUrl = customCoverUrl.trim() || generatePremiumSVG(title, genre);
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
        price: isPremium ? price : 0,
        rating: 5.0,
        reviewsCount: 1,
        pages,
        publishedDate: "২০২৬",
        readTime,
        featured,
        popular,
        views: 120,
        chapters,
        pdfUrl: pdfUrl.trim() || undefined
      };
      onAddBook(newBook);
    } else if (activeTab === "edit" && editingBookId) {
      const existing = books.find(b => b.id === editingBookId);
      const updatedBook: Book = {
        id: editingBookId,
        title,
        titleEn: titleEn || existing?.titleEn || "untitled_book",
        author: NOVELIST_NAME,
        genre,
        shortDesc,
        longDesc: longDesc || shortDesc,
        coverUrl: customCoverUrl.trim() || existing?.coverUrl || generatePremiumSVG(title, genre),
        isPremium,
        price: isPremium ? price : 0,
        rating: existing?.rating || 5.0,
        reviewsCount: existing?.reviewsCount || 1,
        pages,
        publishedDate: existing?.publishedDate || "২০২৬",
        readTime,
        featured,
        popular,
        views: existing?.views || 100,
        chapters,
        pdfUrl: pdfUrl.trim() || undefined
      };
      onUpdateBook(updatedBook);
    }

    resetBookForm();
    setActiveTab("list");
  };

  // App File Upload Handler
  const handleAppFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadStatusMsg(`আপলোড হচ্ছে: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.fileUrl) {
        setAppDownloadUrl(data.fileUrl);
        if (data.sizeFormatted) {
          setAppSize(data.sizeFormatted);
        }
        if (!appName) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setAppName(cleanName);
        }
        setUploadStatusMsg(`✅ সফলভাবে আপলোড হয়েছে: ${file.name} (${data.sizeFormatted})`);
      } else {
        setUploadStatusMsg(`❌ আপলোড ব্যর্থ: ${data.error || "অজানা সমস্যা"}`);
      }
    } catch (err: any) {
      console.error("App upload error:", err);
      setUploadStatusMsg("❌ সার্ভারে আপলোড করা সম্ভব হয়নি। সরাসরি ডাউনলোড লিঙ্ক দিন।");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // App Icon Upload Handler
  const handleAppIconUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.fileUrl) {
        setAppIconUrl(data.fileUrl);
      }
    } catch (err) {
      console.error("App icon upload error:", err);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // App Form Submitter
  const handleSubmitApp = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!appName.trim()) {
      setFormError("অ্যাপের নাম পূরণ করুন।");
      return;
    }
    if (!appDownloadUrl.trim()) {
      setFormError("অ্যাপের ফাইল আপলোড করুন অথবা ডাউনলোড লিঙ্ক প্রদান করুন।");
      return;
    }

    const featuresList = appFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (activeTab === "create_app") {
      const newApp: AppItem = {
        id: `app-${Date.now()}`,
        name: appName.trim(),
        category: appCategory || "অ্যান্ড্রয়েড অ্যাপ (APK)",
        version: appVersion.trim() || "v1.0.0",
        size: appSize.trim() || "15.0 MB",
        downloadUrl: appDownloadUrl.trim(),
        iconUrl: appIconUrl.trim() || "https://i.postimg.cc/KvdBcxT5/daabb61c-d861-4bce-97f3-a904a33af923-Photoroom.png",
        description: appDescription.trim() || "গল্পবাড়ি অফিসিয়াল মোবাইল অ্যাপ্লিকেশন।",
        features: featuresList.length > 0 ? featuresList : ["দ্রুত ডাউনলোড ও অফলাইন ব্যবহার", "বিজ্ঞাপনমুক্ত পরিবেশ"],
        platform: appPlatform || "Android",
        downloadsCount: 0,
        releaseDate: "২০২৬",
        isPublished: true,
      };
      onAddApp(newApp);
    } else if (activeTab === "edit_app" && editingAppId) {
      const existing = apps.find((a) => a.id === editingAppId);
      const updatedApp: AppItem = {
        id: editingAppId,
        name: appName.trim(),
        category: appCategory || "অ্যান্ড্রয়েড অ্যাপ (APK)",
        version: appVersion.trim() || "v1.0.0",
        size: appSize.trim() || "15.0 MB",
        downloadUrl: appDownloadUrl.trim(),
        iconUrl: appIconUrl.trim() || existing?.iconUrl || "",
        description: appDescription.trim(),
        features: featuresList,
        platform: appPlatform || "Android",
        downloadsCount: existing?.downloadsCount || 0,
        releaseDate: existing?.releaseDate || "২০২৬",
        isPublished: true,
      };
      onUpdateApp(updatedApp);
    }

    resetAppForm();
    setActiveTab("apps");
  };

  const handleEditBookTrigger = (b: Book) => {
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
    setPdfUrl(b.pdfUrl || "");
    setCustomCoverUrl((b.coverUrl && !b.coverUrl.startsWith("data:image/svg+xml")) ? b.coverUrl : "");
    setActiveTab("edit");
  };

  const handleEditAppTrigger = (app: AppItem) => {
    setEditingAppId(app.id);
    setAppName(app.name);
    setAppCategory(app.category || "অ্যান্ড্রয়েড অ্যাপ (APK)");
    setAppVersion(app.version || "v1.0.0");
    setAppSize(app.size || "15 MB");
    setAppDownloadUrl(app.downloadUrl || "");
    setAppIconUrl(app.iconUrl || "");
    setAppDescription(app.description || "");
    setAppPlatform(app.platform || "Android");
    setAppFeaturesText((app.features || []).join("\n"));
    setActiveTab("edit_app");
  };

  const resetBookForm = () => {
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
    setPdfUrl("");
    setCustomCoverUrl("");
    setChapters([{ id: "ch-1", title: "১. উম্মোচন", content: "গল্প লিখুন..." }]);
  };

  const resetAppForm = () => {
    setEditingAppId(null);
    setAppName("");
    setAppCategory("অ্যান্ড্রয়েড অ্যাপ (APK)");
    setAppVersion("v1.0.0");
    setAppSize("15.0 MB");
    setAppDownloadUrl("");
    setAppIconUrl("");
    setAppDescription("");
    setAppPlatform("Android");
    setAppFeaturesText("অফলাইনে উপন্যাস পড়ার সুবিধা\nডার্ক ও সেপিয়া রিডিং মোড\nবিজ্ঞাপনহীন মসৃণ অভিজ্ঞতা");
    setUploadStatusMsg("");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8" id="admin-page-container">
      <AnimatePresence mode="wait">
        {!isAuthorized ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md mx-auto mt-16 bg-white border border-brand-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl relative"
            id="admin-auth-panel"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              id="admin-auth-close"
            >
              <X className="w-4 h-4 text-neutral-400 hover:text-brand-charcoal" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-charcoal text-brand-gold flex items-center justify-center mx-auto shadow-md">
                <Key className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold font-serif-bengali text-brand-charcoal">
                  গল্পবাড়ি অ্যাডমিন কন্ট্রোল
                </h3>
                <p className="text-xs font-sans-bengali text-neutral-500 mt-1">
                  বই প্রকাশনা এবং মোবাইল অ্যাপ (APK) আপলোড ও পরিচালনার জন্য অনুমোদিত পাসকোড দিন।
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-left text-xs font-bold text-neutral-700 font-sans-bengali">
                    অ্যাডমিন পাসকোড:
                  </label>
                  <input
                    type="password"
                    placeholder="পাসকোড লিখুন..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-center bg-neutral-50 border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal font-bold tracking-widest text-lg focus:outline-none focus:border-brand-charcoal"
                    autoFocus
                    id="admin-passcode-input"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-600 font-medium font-sans-bengali bg-red-50 border border-red-200 p-2.5 rounded-xl">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-charcoal hover:bg-black text-brand-gold px-4 py-3.5 rounded-2xl text-xs font-bold font-sans-bengali shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="admin-auth-submit"
                >
                  <ShieldCheck className="w-4 h-4" />
                  প্যানেল উম্মোচন করুন
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-[#FDFDFC] border border-black/[0.08] shadow-2xl rounded-3xl overflow-hidden flex flex-col min-h-[80vh]"
            id="admin-dashboard-panel"
          >
            {/* Top Bar Header */}
            <div className="bg-brand-charcoal p-5 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gold/20">
              <div className="flex items-center space-x-3 text-brand-beige">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold text-lg font-serif-bengali shadow-md shrink-0">
                  ক
                </div>
                <div>
                  <h2 className="font-bold text-lg md:text-xl font-serif-bengali text-brand-gold flex items-center gap-2">
                    অ্যাডমিন কন্ট্রোল হাব
                  </h2>
                  <p className="text-[10px] md:text-xs text-brand-beige/60 font-sans-bengali">
                    বই প্রকাশনা ও মোবাইল অ্যাপ (APK) আপলোড প্যানেল
                  </p>
                </div>
              </div>

              {/* Quick Actions in Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { resetAppForm(); setActiveTab("create_app"); }}
                  className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  + অ্যাপ আপলোড করুন
                </button>

                <button
                  onClick={() => { resetBookForm(); setActiveTab("create"); }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + বই প্রকাশ করুন
                </button>

                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer ml-1"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Prominent Top Horizontal Tabs (Always visible without scrolling!) */}
            <div className="bg-neutral-100/90 border-b border-black/[0.06] px-4 md:px-8 py-2.5 flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => { resetBookForm(); setActiveTab("list"); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-sans-bengali flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "list" || activeTab === "edit"
                    ? "bg-brand-charcoal text-brand-gold shadow-sm"
                    : "text-neutral-600 hover:bg-white hover:text-brand-charcoal"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                বইয়ের তালিকা ({books.length})
              </button>

              <button
                onClick={() => { resetAppForm(); setActiveTab("apps"); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-sans-bengali flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "apps" || activeTab === "edit_app"
                    ? "bg-brand-charcoal text-brand-gold shadow-sm"
                    : "text-neutral-600 hover:bg-white hover:text-brand-charcoal"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-brand-gold" />
                অ্যাপস তালিকা ({apps.length})
              </button>

              <button
                onClick={() => { resetAppForm(); setActiveTab("create_app"); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-sans-bengali flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "create_app"
                    ? "bg-brand-charcoal text-brand-gold shadow-sm"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                নতুন অ্যাপ আপলোড ⬆️
              </button>

              <button
                onClick={() => { resetBookForm(); setActiveTab("create"); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-sans-bengali flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "create"
                    ? "bg-brand-charcoal text-brand-gold shadow-sm"
                    : "text-neutral-600 hover:bg-white hover:text-brand-charcoal"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন বই প্রকাশ
              </button>

              <button
                onClick={() => { setActiveTab("bio"); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-sans-bengali flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "bio"
                    ? "bg-brand-charcoal text-brand-gold shadow-sm"
                    : "text-neutral-600 hover:bg-white hover:text-brand-charcoal"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                লেখক তথ্য
              </button>
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8" id="admin-main-canvas">
              <AnimatePresence mode="wait">
                
                {/* TAB: BOOKS LIST */}
                {activeTab === "list" && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    id="admin-novel-list"
                  >
                    {/* Fast Jump Card for App Upload */}
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-base font-serif-bengali text-brand-gold">
                            মোবাইল অ্যাপ আপলোড করতে চান?
                          </h4>
                          <p className="text-xs text-neutral-300 font-sans-bengali">
                            আপনার অ্যান্ড্রয়েড APK বা সফটওয়্যার ফাইল সরাসরি আপলোড করুন যাতে পাঠকরা ডাউনলোড করতে পারেন।
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { resetAppForm(); setActiveTab("create_app"); }}
                        className="bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> অ্যাপ আপলোড করুন
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                      <h4 className="text-base font-bold font-serif-bengali text-brand-charcoal">
                        আপনার প্রকাশিত উপন্যাসসমূহ ({books.length})
                      </h4>
                      <button
                        onClick={() => { setActiveTab("create"); resetBookForm(); }}
                        className="text-xs font-bold bg-brand-charcoal text-brand-gold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> নতুন বই যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-3">
                      {books.map((b) => (
                        <div key={b.id} className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 rounded-xl overflow-hidden aspect-[3/4] shadow bg-brand-charcoal shrink-0 flex items-center justify-center">
                              {b.coverUrl && (b.coverUrl.startsWith("http") || b.coverUrl.startsWith("data:image") || (b.coverUrl.includes(".") && !b.coverUrl.includes("<svg"))) ? (
                                <img src={b.coverUrl} className="w-full h-full object-cover" alt={b.title} referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full object-cover flex items-center justify-center" dangerouslySetInnerHTML={{ __html: b.coverUrl }} />
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm md:text-base font-serif-bengali text-brand-charcoal flex items-center gap-2">
                                {b.title}
                                {b.isPremium ? (
                                  <span className="text-[9px] font-bold bg-brand-charcoal text-brand-gold px-1.5 py-0.2 rounded font-sans-bengali">৳{b.price}</span>
                                ) : (
                                  <span className="text-[9px] font-bold bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.2 rounded font-sans-bengali">ফ্রি</span>
                                )}
                              </h5>
                              <p className="text-[10px] text-neutral-500 font-sans-bengali mt-0.5">
                                বিভাগ: {b.genre} • অধ্যায়: {b.chapters.length}টি • দর্শক: {b.views}
                              </p>
                              
                              <div className="flex items-center gap-1.5 mt-2">
                                {b.featured && <span className="text-[9px] bg-brand-gold/30 text-brand-charcoal px-2 py-0.5 rounded-full font-semibold font-sans-bengali">Featured</span>}
                                {b.popular && <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold font-sans-bengali">Popular</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 md:gap-2">
                            <button
                              onClick={() => handleEditBookTrigger(b)}
                              className="p-2 rounded-xl text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-100 transition-all cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteBook(b.id)}
                              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                              title="ডিলিট করুন"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB: APPS LIST */}
                {activeTab === "apps" && (
                  <motion.div
                    key="apps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    id="admin-apps-list"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
                      <div>
                        <h4 className="text-base font-bold font-serif-bengali text-brand-charcoal flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-brand-gold" />
                          আপলোডকৃত অ্যাপ্লিকেশন সম্ভার ({apps.length})
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-sans-bengali">
                          এখানে আপনার আপলোডকৃত সমস্ত অ্যাপ রয়েছে। নতুন অ্যাপ আপলোড করতে পাশের বাটনে চাপুন।
                        </p>
                      </div>
                      <button
                        onClick={() => { setActiveTab("create_app"); resetAppForm(); }}
                        className="bg-brand-charcoal hover:bg-black text-brand-gold text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
                      >
                        <Upload className="w-4 h-4" /> + নতুন অ্যাপ আপলোড
                      </button>
                    </div>

                    {apps.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-black/[0.06] rounded-3xl flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center">
                          <Smartphone className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-base font-bold text-brand-charcoal font-serif-bengali">এখনো কোনো অ্যাপ নেই</h5>
                          <p className="text-xs text-neutral-500 max-w-sm font-sans-bengali">
                            আপনি সরাসরি APK ফাইল বা ড্রাইভ লিঙ্ক আপলোড করতে পারেন।
                          </p>
                        </div>
                        <button
                          onClick={() => { setActiveTab("create_app"); resetAppForm(); }}
                          className="bg-brand-charcoal text-brand-gold text-xs font-bold py-3 px-6 rounded-2xl cursor-pointer"
                        >
                          প্রথম অ্যাপ আপলোড করুন
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {apps.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white border border-black/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-charcoal/5 shrink-0 flex items-center justify-center shadow-xs">
                                {app.iconUrl && (app.iconUrl.startsWith("http") || app.iconUrl.startsWith("/uploads") || app.iconUrl.startsWith("data:image")) ? (
                                  <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Smartphone className="w-7 h-7 text-brand-charcoal" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-bold text-sm font-serif-bengali text-brand-charcoal">
                                    {app.name}
                                  </h5>
                                  <span className="text-[10px] font-bold bg-brand-gold/20 text-brand-charcoal px-2 py-0.5 rounded-full">
                                    {app.version}
                                  </span>
                                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                                    {app.category}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-500 font-sans-bengali flex items-center gap-3">
                                  <span>সাইজ: {app.size}</span>
                                  <span>•</span>
                                  <span>প্ল্যাটফর্ম: {app.platform}</span>
                                  <span>•</span>
                                  <span>{app.downloadsCount} বার ডাউনলোড</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 justify-end">
                              <a
                                href={app.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="p-2.5 rounded-xl text-neutral-700 hover:text-brand-charcoal hover:bg-neutral-100 transition-all flex items-center gap-1.5 text-xs font-bold"
                                title="ডাউনলোড টেস্ট করুন"
                              >
                                <Download className="w-4 h-4 text-brand-gold" />
                                টেস্ট
                              </a>
                              <button
                                onClick={() => handleEditAppTrigger(app)}
                                className="p-2.5 rounded-xl text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-100 transition-all cursor-pointer"
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteApp(app.id)}
                                className="p-2.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                                title="ডিলিট করুন"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB: CREATE OR EDIT APP (The Upload View) */}
                {(activeTab === "create_app" || activeTab === "edit_app") && (
                  <motion.form
                    key="app-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmitApp}
                    className="space-y-6 max-w-4xl"
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                      <div>
                        <h4 className="text-lg font-bold font-serif-bengali text-brand-charcoal flex items-center gap-2">
                          <Upload className="w-5 h-5 text-brand-gold" />
                          {activeTab === "create_app" ? "নতুন অ্যাপ্লিকেশন আপলোড ফরম" : `"${appName}" সম্পাদনা ফরম`}
                        </h4>
                        <p className="text-xs text-neutral-500 font-sans-bengali">
                          এখানে APK ফাইল আপলোড করুন অথবা গুগল ড্রাইভ ডাউনলোড লিংক দিয়ে প্রকাশ করুন।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { resetAppForm(); setActiveTab("apps"); }}
                        className="text-xs font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer bg-neutral-100 py-1.5 px-3 rounded-xl"
                      >
                        অ্যাপস তালিকায় ফিরুন
                      </button>
                    </div>

                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold font-sans-bengali flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {formError}
                      </div>
                    )}

                    {/* Step 1: File Upload Box */}
                    <div className="bg-white border-2 border-dashed border-neutral-300 hover:border-brand-charcoal p-8 rounded-3xl text-center space-y-3 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-brand-charcoal flex items-center justify-center mx-auto shadow-2xs">
                        <FolderUp className="w-7 h-7 text-brand-charcoal" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-brand-charcoal font-serif-bengali">
                          আপনার মোবাইল অ্যাপ (.APK) ফাইল এখানে আপলোড করুন
                        </p>
                        <p className="text-xs text-neutral-400 font-sans-bengali">
                          সরাসরি ডিভাইস থেকে ফাইল সিলেক্ট করুন (অটোমেটিক সাইজ ও লিংক যুক্ত হবে)
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="inline-flex bg-brand-charcoal hover:bg-black text-brand-gold text-xs font-bold py-3.5 px-7 rounded-2xl cursor-pointer transition-all items-center gap-2 shadow-sm">
                          <Upload className="w-4 h-4" />
                          {isUploadingFile ? "ফাইল আপলোড হচ্ছে..." : "ডিভাইস থেকে ফাইল নির্বাচন করুন (Choose File)"}
                          <input
                            type="file"
                            accept=".apk,.xapk,.zip,.exe,.pdf,*/*"
                            onChange={handleAppFileUpload}
                            disabled={isUploadingFile}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {uploadStatusMsg && (
                        <div className="text-xs font-sans-bengali font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl max-w-md mx-auto">
                          {uploadStatusMsg}
                        </div>
                      )}
                    </div>

                    {/* Step 2: Form Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          ডাউনলোড লিঙ্ক (Download URL) * :
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: /uploads/app.apk বা Google Drive লিঙ্ক"
                          value={appDownloadUrl}
                          onChange={(e) => setAppDownloadUrl(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal"
                        />
                        <span className="text-[10px] text-neutral-400 font-sans-bengali">
                          ফাইল আপলোড করলে এই লিঙ্কটি স্বয়ংক্রিয়ভাবে পূর্ণ হবে।
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          অ্যাপের নাম * :
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: গল্পবাড়ি রিডার অ্যাপ"
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal font-serif-bengali"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          ক্যাটাগরি / বিভাগ:
                        </label>
                        <select
                          value={appCategory}
                          onChange={(e) => setAppCategory(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal"
                        >
                          <option value="অ্যান্ড্রয়েড অ্যাপ (APK)">অ্যান্ড্রয়েড অ্যাপ (APK)</option>
                          <option value="ই-রিডার (eReader)">ই-রিডার (eReader)</option>
                          <option value="ইউটিলিটি ও টুলস">ইউটিলিটি ও টুলস</option>
                          <option value="অডিওবুক ও মিডিয়া">অডিওবুক ও মিডিয়া</option>
                          <option value="উইন্ডোজ সফটওয়্যার">উইন্ডোজ সফটওয়্যার</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          প্ল্যাটফর্ম (Platform):
                        </label>
                        <select
                          value={appPlatform}
                          onChange={(e) => setAppPlatform(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal"
                        >
                          <option value="Android">Android (অ্যান্ড্রয়েড)</option>
                          <option value="Windows">Windows (উইন্ডোজ)</option>
                          <option value="Web">Web App (ওয়েব)</option>
                          <option value="Cross-Platform">Cross-Platform</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          ভার্সন (Version):
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: v1.0.0"
                          value={appVersion}
                          onChange={(e) => setAppVersion(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          ফাইল সাইজ (Size):
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: 15.0 MB"
                          value={appSize}
                          onChange={(e) => setAppSize(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>
                    </div>

                    {/* App Icon */}
                    <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-3">
                      <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                        অ্যাপের আইকন / লোগো (Icon):
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                          {appIconUrl ? (
                            <img src={appIconUrl} alt="App icon preview" className="w-full h-full object-cover" />
                          ) : (
                            <Smartphone className="w-8 h-8 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            placeholder="আইকনের লিঙ্ক (URL) দিন..."
                            value={appIconUrl}
                            onChange={(e) => setAppIconUrl(e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded-xl py-2 px-3 text-xs text-neutral-900 focus:outline-none"
                          />
                          <div>
                            <label className="text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1.5 px-3.5 rounded-lg cursor-pointer transition-all inline-block">
                              {isUploadingIcon ? "আপলোড হচ্ছে..." : "আইকন ছবি সিলেক্ট করুন"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAppIconUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description & Features */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          সংক্ষিপ্ত বিবরণ (Description):
                        </label>
                        <textarea
                          rows={3}
                          value={appDescription}
                          onChange={(e) => setAppDescription(e.target.value)}
                          placeholder="অ্যাপের মূল উদ্দেশ্য ও সংক্ষিপ্ত বিবরণ..."
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal resize-none font-sans-bengali leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          অ্যাপের সুবিধাসমূহ (Features - প্রতি লাইনে ১টি করে লিখুন):
                        </label>
                        <textarea
                          rows={4}
                          value={appFeaturesText}
                          onChange={(e) => setAppFeaturesText(e.target.value)}
                          placeholder="অফলাইনে উপন্যাস পড়ার সুবিধা&#10;ডার্ক মোড রিডিং&#10;সম্পূর্ণ বিজ্ঞাপনহীন"
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-xs text-neutral-900 focus:outline-none focus:border-brand-charcoal resize-none font-sans-bengali leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06]">
                      <button
                        type="submit"
                        disabled={isUploadingFile}
                        className="flex-1 bg-brand-charcoal text-brand-gold hover:bg-black py-4 rounded-2xl text-xs md:text-sm font-bold font-sans-bengali flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 text-brand-gold" />
                        {activeTab === "create_app" ? "অ্যাপ আপলোড ও প্রকাশ করুন" : "পরিবর্তন সংরক্ষণ করুন"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { resetAppForm(); setActiveTab("apps"); }}
                        className="px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-2xl font-sans-bengali transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* TAB: CREATE OR EDIT BOOK */}
                {(activeTab === "create" || activeTab === "edit") && (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmitBook}
                    className="space-y-6 max-w-4xl"
                    id="admin-editor-form"
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                      <h4 className="text-lg font-bold font-serif-bengali text-brand-charcoal">
                        {activeTab === "create" ? "নতুন সাহিত্য প্রকাশ করুন" : `"${title}" সম্পাদনালয়`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => { resetBookForm(); setActiveTab("list"); }}
                        className="text-xs font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer bg-neutral-100 py-1.5 px-3 rounded-xl"
                      >
                        বইয়ের তালিকায় ফিরুন
                      </button>
                    </div>
                    
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold font-sans-bengali">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">উপন্যাসের নাম (বাংলায়):</label>
                          {title && (
                            <button
                              type="button"
                              onClick={() => setTitle(fixBijoyText(title))}
                              className="text-[10px] text-brand-gold hover:underline font-bold font-sans-bengali flex items-center gap-0.5 cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> বিজয় ঠিক করুন 🪄
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: মেঘবালিকার ডায়েরি"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-serif-bengali focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">উপন্যাসের নাম (ইংরেজিতে):</label>
                        <input
                          type="text"
                          placeholder="যেমন: Meghbalikar Diary"
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">বিভাগ বা জনরা:</label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-charcoal"
                        >
                          <option value="ম্যাজিকাল রিয়ালিজম">ম্যাজিকাল রিয়ালিজম (Magical Realism)</option>
                          <option value="রহস্য ও থ্রিলার">রহস্য ও থ্রিলার (Mystery / Thriller)</option>
                          <option value="ধ্রুপদী উপন্যাস">ধ্রুপদী উপন্যাস (Classical Novel)</option>
                          <option value="মনস্তাত্ত্বিক উপন্যাস">মনস্তাত্ত্বিক উপন্যাস (Psychological Novel)</option>
                          <option value="রোমান্টিক সামাজিক">রোমান্টিক সামাজিক (Romantic Drama)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">আনুমানিক পড়ার সময়:</label>
                        <input
                          type="text"
                          placeholder="যেমন: ৩ ঘণ্টা"
                          value={readTime}
                          onChange={(e) => setReadTime(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans-bengali focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">বইয়ের কভার ছবির URL (ঐচ্ছিক):</label>
                        <input
                          type="url"
                          placeholder="যেমন: https://example.com/cover.jpg"
                          value={customCoverUrl}
                          onChange={(e) => setCustomCoverUrl(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">বইয়ের PDF ড্রাইভ লিঙ্ক (ঐচ্ছিক):</label>
                        <input
                          type="url"
                          placeholder="যেমন: https://drive.google.com/..."
                          value={pdfUrl}
                          onChange={(e) => setPdfUrl(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-black/[0.06] pt-4">
                      <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-neutral-200">
                        <input
                          type="checkbox"
                          checked={isPremium}
                          onChange={(e) => setIsPremium(e.target.checked)}
                          className="w-4 h-4 text-brand-charcoal rounded cursor-pointer"
                          id="form-is-premium"
                        />
                        <label htmlFor="form-is-premium" className="text-xs font-bold text-neutral-700 font-sans-bengali cursor-pointer select-none">
                          প্রিমিয়াম উপন্যাস (Paid)
                        </label>
                      </div>

                      {isPremium && (
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">বইয়ের মূল্য (টাকা ৳):</label>
                          <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-charcoal"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-sans-bengali">মোট পৃষ্ঠা সংখ্যা:</label>
                        <input
                          type="number"
                          min="10"
                          value={pages}
                          onChange={(e) => setPages(Number(e.target.value))}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-sans focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-black/[0.06] pt-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">সংক্ষিপ্ত কভার বিবরণ:</label>
                          {shortDesc && (
                            <button
                              type="button"
                              onClick={() => setShortDesc(fixBijoyText(shortDesc))}
                              className="text-[10px] text-brand-gold hover:underline font-bold font-sans-bengali flex items-center gap-0.5 cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> বিজয় ঠিক করুন 🪄
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: এক বৃষ্টির দুপুরে কুয়াশায় ঢাকা..."
                          value={shortDesc}
                          onChange={(e) => setShortDesc(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-serif-bengali focus:outline-none focus:border-brand-charcoal"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">উপন্যাসের সম্পূর্ণ সিনপসিস (পটভূমি):</label>
                          {longDesc && (
                            <button
                              type="button"
                              onClick={() => setLongDesc(fixBijoyText(longDesc))}
                              className="text-[10px] text-brand-gold hover:underline font-bold font-sans-bengali flex items-center gap-0.5 cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> বিজয় ঠিক করুন 🪄
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={4}
                          value={longDesc}
                          onChange={(e) => setLongDesc(e.target.value)}
                          placeholder="গল্পের মূল প্রেক্ষাপট..."
                          className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-serif-bengali focus:outline-none focus:border-brand-charcoal resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Chapters Section */}
                    <div className="space-y-4 border-t border-black/[0.06] pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                          উপন্যাসের অধ্যায়সমূহ ({chapters.length}টি অধ্যায়)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddChapter}
                          className="text-[11px] bg-brand-charcoal text-brand-gold py-1.5 px-3 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> আরও অধ্যায় যোগ করুন
                        </button>
                      </div>

                      <div className="space-y-4">
                        {chapters.map((ch, idx) => (
                          <div key={ch.id} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-brand-charcoal font-serif-bengali">
                                অধ্যায় {idx + 1}
                              </span>
                              {chapters.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChapter(ch.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash className="w-3.5 h-3.5" /> বাদ দিন
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={ch.title}
                              onChange={(e) => handleChapterTitleChange(ch.id, e.target.value)}
                              placeholder="যেমন: ১. ঝড়ের প্রথম স্পর্শ"
                              className="w-full bg-neutral-50 rounded-xl py-2 px-3 text-xs font-bold font-serif-bengali text-brand-charcoal focus:outline-none"
                            />
                            <textarea
                              rows={8}
                              value={ch.content}
                              onChange={(e) => handleChapterContentChange(ch.id, e.target.value)}
                              placeholder="এই অধ্যায়ের মূল গল্প লিখুন..."
                              className="w-full bg-neutral-50 rounded-xl py-2.5 px-3 text-xs font-serif-bengali text-brand-charcoal focus:outline-none leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06]">
                      <button
                        type="submit"
                        className="flex-1 bg-brand-charcoal text-brand-gold hover:bg-black py-4 rounded-2xl text-xs font-bold font-sans-bengali flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-brand-gold" />
                        {activeTab === "create" ? "সাহিত্য সংকলন উম্মোচন করুন" : "পরিপত্র সেভ করুন"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { resetBookForm(); setActiveTab("list"); }}
                        className="px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-2xl font-sans-bengali transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* TAB: BIO */}
                {activeTab === "bio" && (
                  <motion.div
                    key="bio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 max-w-3xl"
                    id="admin-bio-editor"
                  >
                    <h4 className="text-base font-bold font-serif-bengali text-brand-charcoal border-b border-black/[0.06] pb-2">
                      লেখকের পরিচিতি (Bio) আপডেট
                    </h4>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-700 font-sans-bengali">
                        আপনার সম্পর্কে যা লেখা দেখাবে:
                      </label>
                      <textarea
                        rows={6}
                        value={tempBio}
                        onChange={(e) => setTempBio(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-2xl py-3 px-4 text-brand-charcoal text-xs font-serif-bengali focus:outline-none focus:border-brand-charcoal resize-none leading-relaxed"
                      />
                    </div>
                    <button
                      onClick={() => onUpdateAuthorBio(tempBio)}
                      className="w-full bg-brand-charcoal text-brand-gold px-4 py-3.5 rounded-2xl text-xs font-bold font-sans-bengali shadow-md hover:bg-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      তথ্য আপডেট করুন
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
