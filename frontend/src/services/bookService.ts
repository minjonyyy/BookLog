import apiClient from './api';
import type { BookSearchResponse, BookDetailResponse } from '../types/book';

const searchBooks = async (query: string, page: number = 1, size: number = 10): Promise<BookSearchResponse> => {
  const response = await apiClient.get<BookSearchResponse>('/books/search', {
    params: {
      query, 
      page,
      size,
    },
  });
  return response.data;
};

const getBookDetail = async (googleBooksId: string): Promise<BookDetailResponse> => {
  const response = await apiClient.get<BookDetailResponse>(`/books/${googleBooksId}`);
  return response.data;
};

const bookService = {
  searchBooks,
  getBookDetail,
};

export default bookService; 