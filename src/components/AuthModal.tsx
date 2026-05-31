import React, { useState, FormEvent } from "react";
import { X, Lock, Mail, User, Sparkles, CheckCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (name: string, email: string) => void;
  initialMode?: "login" | "signup";
  message?: string;
}

export default function AuthModal({ onClose, onLoginSuccess, initialMode = "login", message }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("সবগুলো ঘর সঠিকভাবে পূরণ করুন।");
      return;
    }

    if (mode === "signup" && !name) {
      setError("অনুগ্রহ করে আপনার নাম প্রদান করুন।");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const displayName = name || email.split("@")[0];
        localStorage.setItem("gob_current_user", JSON.stringify({ name: displayName, email }));
        
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(displayName, email);
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || email.split("@")[0];
        localStorage.setItem("gob_current_user", JSON.stringify({ name: displayName, email }));
        
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(displayName, email);
          setSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("এই ইমেইল দিয়ে ইতিমধ্যেই অ্যাকাউন্ট খোলা হয়েছে।");
      } else if (err.code === "auth/invalid-email") {
        setError("ইমেইল ঠিকানাটি সঠিক নয়।");
      } else if (err.code === "auth/weak-password") {
        setError("পাসওয়ার্ড অত্যন্ত দুর্বল। অন্তত ৬টি অক্ষর ব্যবহার করুন।");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("ভুল ইমেইল অথবা পাসওয়ার্ড! পুনরায় চেষ্টা করুন।");
      } else {
        setError("ত্রুটি ঘটেছে: " + (err.message || "পুনরায় চেষ্টা করুন।"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const displayName = user.displayName || user.email?.split("@")[0] || "User";
      localStorage.setItem("gob_current_user", JSON.stringify({ name: displayName, email: user.email }));
      
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(displayName, user.email || "");
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError("গুগল লগইন বাতিল করা হয়েছে বা সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-charcoal/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="auth-modal-backdrop">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-brand-beige border border-brand-gold/30 rounded-3xl overflow-hidden shadow-2xl relative"
        id="auth-modal-panel"
      >
        {/* Dynamic header badge or warning banner */}
        {message && (
          <div className="bg-brand-gold/20 border-b border-brand-gold/30 px-6 py-3 text-center text-xs font-semibold text-brand-gold-dark font-sans-bengali">
            ✨ {message}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-500/10 transition-colors z-10"
          id="auth-close-btn"
        >
          <X className="w-5 h-5 text-brand-charcoal/50" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2 flex flex-col items-center justify-center">
            <img
              src="https://i.postimg.cc/KvdBcxT5/daabb61c-d861-4bce-97f3-a904a33af923-Photoroom.png"
              alt="গল্পবাড়ি"
              className="w-20 h-20 object-contain"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-2xl font-black font-serif-bengali text-brand-charcoal">
              {mode === "login" ? "গল্পবাড়িতে প্রবেশ করুন" : "নতুন সদস্য হোন"}
            </h3>
            <p className="text-xs font-sans-bengali text-brand-charcoal/50">
              {mode === "login"
                ? "প্রিয় উপন্যাসগুলি পড়তে ও সংরক্ষণ করতে লগইন করুন"
                : "আজই গল্পবাড়ির সাহিত্যানুরাগী বন্ধুদের বৃত্তে যুক্ত হোন"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-6 space-y-4"
                id="auth-success-screen"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200 mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-lg font-serif-bengali text-brand-charcoal">
                    সাফল্যের সাথে সম্পন্ন হয়েছে!
                  </h4>
                  <p className="text-xs font-sans-bengali text-brand-charcoal/50 mt-1">
                    গল্পবাড়িতে আপনাকে আন্তরিক স্বাগতম।
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
                id="auth-form-body"
              >
                {/* Name field for Signup mode */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/60 font-sans-bengali flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-gold" />
                      আপনার সম্পূর্ণ নাম:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: অনামিকা রহমান"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-brand-gold/15 rounded-xl py-2.5 px-3.5 text-xs font-sans-bengali focus:outline-none focus:border-brand-gold shadow-xs"
                      id="auth-input-name"
                    />
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-charcoal/60 font-sans-bengali flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                    ইমেইল ঠিকানা:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-brand-gold/15 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-brand-gold shadow-xs"
                    id="auth-input-email"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-charcoal/60 font-sans-bengali flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-brand-gold" />
                    পাসওয়ার্ড:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-brand-gold/15 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-brand-gold shadow-xs"
                    id="auth-input-password"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-semibold font-sans-bengali bg-red-50 border border-red-100 p-2.5 rounded-xl text-center">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-gold border border-brand-gold/30 py-3 rounded-xl text-xs font-bold font-sans-bengali flex items-center justify-center gap-1.5 transition-all shadow-md transform active:scale-98 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  id="auth-submit-btn"
                >
                  <Sparkles className="w-4 h-4 text-brand-gold animate-spin-slow" />
                  {loading ? "অপেক্ষা করুন..." : mode === "login" ? "অ্যাকাউন্টে প্রবেশ করুন" : "নতুন অ্যাকাউন্ট খুলুন"}
                </button>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-px bg-brand-gold/15"></div>
                  <span className="text-[10px] text-brand-charcoal/40 font-bold uppercase tracking-widest font-sans">OR</span>
                  <div className="flex-1 h-px bg-brand-gold/15"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full bg-white hover:bg-neutral-50 text-brand-charcoal border border-neutral-200 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all shadow-sm transform active:scale-98 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  id="google-auth-btn"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {mode === "login" ? "Google দিয়ে লগইন করুন" : "Google দিয়ে অ্যাকাউন্ট খুলুন"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle triggers */}
          {!success && (
            <div className="text-center pt-4 border-t border-brand-gold/10 text-xs font-sans-bengali text-brand-charcoal/50">
              {mode === "login" ? (
                <p>
                  আপনার কোনো অ্যাকাউন্ট নেই?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className="text-brand-gold hover:text-brand-gold-dark font-bold hover:underline transition-all"
                    id="toggle-to-signup"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </p>
              ) : (
                <p>
                  ইতিমধ্যেই অ্যাকাউন্ট আছে?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="text-brand-gold hover:text-brand-gold-dark font-bold hover:underline transition-all"
                    id="toggle-to-login"
                  >
                    সহজেই লগইন করুন
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
