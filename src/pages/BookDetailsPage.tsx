import React, { MouseEvent, useState, useEffect } from "react";
import { Book, Review } from "../types";
import { ArrowLeft, Star, BookOpen, Clock, Layers, Calendar, Eye, Download, User, MessageSquare, Send } from "lucide-react";
import { db } from "../firebase";
import { collection, query, onSnapshot, addDoc, orderBy } from "firebase/firestore";

interface BookDetailsPageProps {
  book: Book;
  onBack: () => void;
  onRead: (book: Book) => void;
  isLoggedIn: boolean;
  onDownloadAuthNeeded: () => void;
  books: Book[];
  onSelectBookByRef: (book: Book) => void;
}

export default function BookDetailsPage({
  book,
  onBack,
  onRead,
  isLoggedIn,
  onDownloadAuthNeeded,
  books,
  onSelectBookByRef,
}: BookDetailsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const q = query(collection(db, "books", book.id, "reviews"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(fetchedReviews);
    });
    return () => unsubscribe();
  }, [book.id]);

  const handleAddReview = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, "books", book.id, "reviews"), {
      user: "পাঠক",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString()
    });
    setNewComment("");
  };

  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      onDownloadAuthNeeded();
      return;
    }

    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank");
      return;
    }
    
    const fileContent = `================================================
  গল্পবাড়ি - সাহিত্য সংস্করণ
  উপন্যাস: ${book.title}
  লেখক: ${book.author}
  ------------------------------------------------
  ${book.longDesc}
  ------------------------------------------------`;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${book.titleEn ? book.titleEn.toLowerCase().replace(/\s+/g, "_") : "story"}_book.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const relatedBooks = books
    .filter((b) => b.id !== book.id)
    .slice(0, 3);

  return (
    <div className="w-full bg-[#FBFBFA] min-h-screen py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-neutral-600 hover:text-brand-charcoal transition-colors bg-white py-2.5 px-5 rounded-full shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          ফিরে যান
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xs p-6 md:p-12 flex flex-col lg:flex-row gap-10">
          
          {/* Cover */}
          <div className="w-full lg:w-2/5 flex flex-col items-center">
            <div className="w-60 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden shadow-md bg-brand-charcoal relative flex items-center justify-center">
              {book.coverUrl && (book.coverUrl.startsWith("http") || book.coverUrl.startsWith("data:image") || book.coverUrl.includes(".") && !book.coverUrl.includes("<svg")) ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div 
                  className="w-full h-full object-cover flex items-center justify-center" 
                  dangerouslySetInnerHTML={{ __html: book.coverUrl }} 
                />
              )}

              <div className="absolute top-3 left-3 bg-brand-gold text-brand-charcoal font-bold px-3 py-1 rounded-full text-xs shadow-xs">
                ফ্রি
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="w-full lg:w-3/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="bg-brand-gold/15 text-brand-charcoal text-xs font-bold px-3.5 py-1 rounded-full">
                {book.genre}
              </span>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-serif-bengali text-brand-charcoal leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-neutral-500 pt-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-gold" />
                  লেখক: <span className="text-brand-charcoal font-bold">{book.author}</span>
                </p>
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed font-light">
                {book.shortDesc}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onRead(book)}
                className="w-full sm:flex-[2] bg-brand-charcoal hover:bg-black text-brand-gold font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer text-sm"
              >
                <BookOpen className="w-4 h-4 text-brand-gold" />
                উপন্যাসটি পড়ুন
              </button>
              
              <button
                onClick={handleDownload}
                className="w-full sm:flex-1 bg-neutral-100 hover:bg-neutral-200 text-brand-charcoal font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" />
                ডাউনলোড
              </button>
            </div>
          </div>
        </div>

        {/* Similar Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12 bg-white p-8 rounded-3xl shadow-2xs">
            <h3 className="text-lg font-bold font-serif-bengali text-brand-charcoal mb-6">আরও উপন্যাস</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedBooks.map((rb) => (
                <div 
                  key={rb.id} 
                  onClick={() => onSelectBookByRef(rb)}
                  className="cursor-pointer group flex items-center gap-4 bg-neutral-50 p-3 rounded-2xl hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-brand-charcoal shrink-0 flex items-center justify-center">
                    {rb.coverUrl && rb.coverUrl.includes("<svg") ? (
                      <div className="w-full h-full scale-50" dangerouslySetInnerHTML={{ __html: rb.coverUrl }} />
                    ) : (
                      <img src={rb.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-charcoal line-clamp-1">{rb.title}</h4>
                    <span className="text-[10px] text-neutral-400">{rb.genre}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
