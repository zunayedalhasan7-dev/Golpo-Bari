import React, { useState } from "react";
import { AppItem } from "../types";
import { 
  Download, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  HardDrive, 
  Tag, 
  Info,
  Check,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

interface AppsPageProps {
  apps: AppItem[];
  onRefresh?: () => void;
}

export default function AppsPage({ apps }: AppsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব অ্যাপ");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const categories = ["সব অ্যাপ", ...Array.from(new Set(apps.map((a) => a.category).filter(Boolean)))];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.category && app.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "সব অ্যাপ" || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = async (app: AppItem) => {
    setDownloadingId(app.id);
    
    // Increment download count in Firestore if possible
    try {
      if (app.id && !app.id.startsWith("local-") && !app.id.startsWith("app-golpobari")) {
        const appRef = doc(db, "apps", app.id);
        await updateDoc(appRef, {
          downloadsCount: increment(1)
        });
      }
    } catch (e) {
      console.warn("Could not increment download count: ", e);
    }

    // Trigger download
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = app.downloadUrl;
      link.setAttribute("download", `${app.name.replace(/\s+/g, "_")}_${app.version}.apk`);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadingId(null);
    }, 600);
  };

  const handleCopyLink = (app: AppItem) => {
    const fullUrl = app.downloadUrl.startsWith("http") 
      ? app.downloadUrl 
      : `${window.location.origin}${app.downloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <motion.div
      key="apps-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 md:py-20"
    >
      {/* Hero Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 bg-brand-gold/15 text-brand-charcoal text-xs font-bold px-4 py-1.5 rounded-full">
          <Smartphone className="w-3.5 h-3.5 text-brand-gold" />
          অফিসিয়াল অ্যাপ্লিকেশন হাব
        </span>

        <h1 className="text-3xl md:text-5xl font-black font-serif-bengali text-brand-charcoal leading-tight">
          অ্যাপ্লিকেশন সম্ভার
        </h1>

        <p className="text-xs md:text-sm text-neutral-600 font-sans-bengali font-light leading-relaxed">
          জুনায়েদ হাসানের সমস্ত উপন্যাস অফলাইনে পড়া এবং সাহিত্যের বিশেষ ফিচারের জন্য প্রস্তুতকৃত অফিসিয়াল অ্যাপসমূহ সরাসরি ডাউনলোড করুন।
        </p>

        {/* Quick action buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-brand-charcoal bg-white py-2.5 px-5 rounded-2xl shadow-2xs transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-brand-gold" />
            {showInstallGuide ? "ইনস্টল নির্দেশিকা লুকান" : "APK ইনস্টল করার নিয়ম"}
          </button>
        </div>
      </div>

      {/* APK Installation Guide Collapsible */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-brand-charcoal font-bold font-serif-bengali text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                অ্যান্ড্রয়েড ফোনে APK ইনস্টল করার সহজ ৩টি ধাপ:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans-bengali text-neutral-600">
                <div className="bg-neutral-50 p-4 rounded-2xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-charcoal text-brand-gold text-[11px] font-bold flex items-center justify-center">১</span>
                  <div className="font-bold text-brand-charcoal">ডাউনলোড সম্পন্ন করুন</div>
                  <p>নিচের পছন্দের অ্যাপের "ডাউনলোড" বাটনে ক্লিক করে APK ফাইলটি সংগ্রহ করুন।</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-charcoal text-brand-gold text-[11px] font-bold flex items-center justify-center">২</span>
                  <div className="font-bold text-brand-charcoal">অনুমতি দিন (Allow Source)</div>
                  <p>ডাউনলোড ফাইলটিতে চাপ দিলে "Settings" থেকে "Allow from this source" অপশনটি চালু করুন।</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-charcoal text-brand-gold text-[11px] font-bold flex items-center justify-center">৩</span>
                  <div className="font-bold text-brand-charcoal">ইনস্টল বাটনে ট্যাপ করুন</div>
                  <p>"Install" অপশনে চাপলেই অ্যাপটি আপনার ফোনে ইনস্টল হয়ে যাবে এবং ব্যবহারের জন্য প্রস্তুত হবে।</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Category Filter */}
      <div className="mb-10 space-y-4 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অ্যাপ খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-xs font-sans-bengali focus:outline-none shadow-2xs placeholder:text-neutral-400"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-charcoal text-brand-gold font-bold shadow-xs"
                    : "bg-white text-neutral-600 hover:text-brand-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-2xs max-w-md mx-auto space-y-3">
          <Smartphone className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-charcoal">কোনো অ্যাপ পাওয়া যায়নি</h3>
          <p className="text-xs text-neutral-500 font-light">
            অনুগ্রহ করে অন্য কোনো নাম দিয়ে সার্চ করুন অথবা অ্যাডমিন প্যানেল থেকে নতুন অ্যাপ আপলোড করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-5">
                {/* Top Bar: Icon + Meta */}
                <div className="flex items-start gap-4">
                  {/* App Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-brand-charcoal/5 shrink-0 flex items-center justify-center shadow-xs">
                    {app.iconUrl && (app.iconUrl.startsWith("http") || app.iconUrl.startsWith("/uploads") || app.iconUrl.startsWith("data:image")) ? (
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-charcoal to-neutral-800 flex items-center justify-center text-brand-gold">
                        <Smartphone className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Name and Badges */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-charcoal">
                        {app.category || "অ্যান্ড্রয়েড অ্যাপ"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {app.version}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> ফ্রি
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-bold font-serif-bengali text-brand-charcoal group-hover:text-brand-gold transition-colors leading-snug">
                      {app.name}
                    </h2>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-sans-bengali">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-neutral-400" />
                        {app.size}
                      </span>
                      <span>•</span>
                      <span>{app.platform || "Android"}</span>
                      {app.downloadsCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{app.downloadsCount.toLocaleString("bn-BD")} ডাউনলোড</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-neutral-600 font-sans-bengali font-light leading-relaxed">
                  {app.description}
                </p>

                {/* Features Highlights */}
                {app.features && app.features.length > 0 && (
                  <div className="space-y-1.5 bg-neutral-50/70 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      প্রধান সুবিধাসমূহ
                    </span>
                    <ul className="space-y-1 text-xs text-neutral-700 font-sans-bengali">
                      {app.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleDownload(app)}
                  disabled={downloadingId === app.id}
                  className="flex-1 bg-brand-charcoal hover:bg-black text-brand-gold font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-xs md:text-sm disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 text-brand-gold ${downloadingId === app.id ? "animate-bounce" : ""}`} />
                  {downloadingId === app.id ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড করুন (APK)"}
                </button>

                <button
                  onClick={() => handleCopyLink(app)}
                  title="ডাউনলোড লিঙ্ক কপি করুন"
                  className="bg-neutral-100 hover:bg-neutral-200 text-brand-charcoal p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center"
                >
                  {copiedId === app.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
