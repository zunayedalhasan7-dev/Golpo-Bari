export interface Chapter {
  id: string;
  title: string;
  content: string; // Dynamic HTML/text reading content
}

export interface Review {
  id: string;
  bookId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  genre: string;
  shortDesc: string; // Emotional snippet
  longDesc: string; // In-depth cinematic synopsis
  coverUrl: string;
  isPremium: boolean;
  price: number; // in Taka (৳)
  rating: number;
  reviewsCount: number;
  pages: number;
  publishedDate: string;
  readTime: string;
  chapters: Chapter[];
  pdfUrl?: string; // Simulated link to download high-fidelity PDF
  featured: boolean; // Featured on Home page banner
  popular: boolean; // Mark as popular for filters
  views: number;
}

export interface Bookmark {
  bookId: string;
  chapterId: string;
  pagePosition?: number;
  progressPercent: number;
  timestamp: number;
}

export interface CartItem {
  id: string;
  book: Book;
  quantity: number;
  edition: "digital" | "paperback";
}

export interface AppItem {
  id: string;
  name: string;
  category: string; // e.g. "অ্যান্ড্রয়েড অ্যাপ (APK)", "ই-রিডার", "ইউটিলিটি", "টুলস"
  version: string; // e.g. "v1.0.0"
  size: string; // e.g. "18.2 MB"
  downloadUrl: string; // direct /uploads/... or external URL
  iconUrl?: string; // app logo/icon
  description: string;
  features?: string[];
  platform: string; // "Android" | "Windows" | "Web" | "Cross-Platform"
  downloadsCount: number;
  releaseDate: string;
  isPublished?: boolean;
  packageName?: string;
  createdAt?: any;
}
