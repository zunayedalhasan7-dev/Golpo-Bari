export interface Chapter {
  id: string;
  title: string;
  content: string; // Dynamic HTML/text reading content
}

export interface Review {
  id: string;
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
