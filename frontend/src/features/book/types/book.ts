// src/types/book.ts

export interface BookSummary {
  id: number;
  googleBooksId: string;
  title: string;
  authors: string[]; 
  publisher: string;
  publishedDate: string;
  thumbnailUrl: string;
  isbn: string | null; 
}

export interface BookSearchResponse {
  totalElements: number; 
  totalPages: number;
  page: number; 
  content: BookSummary[];
}

export interface BookDetail extends BookSummary {
  description: string;
  pageCount: number;
  categories: string[];
  averageRating: number;
  ratingsCount: number;
}

// 백엔드의 BookDetailResponse DTO에 맞게 수정
export type BookDetailResponse = BookDetail; 