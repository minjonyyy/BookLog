import apiClient from './api';
import type { BookDetail } from '../types/book';

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

// 서버의 UserBook 응답 타입
export interface UserBook {
  id: number;
  userId: number;
  username: string;
  status: ReadingStatus;
  startedAt: string | null;
  completedAt: string | null;
  currentPage: number;
  progress: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  book: {
    id: number;
    googleBooksId: string;
    title: string;
    authors: string;
    publisher: string;
    publishedDate: string;
    description: string;
    pageCount: number;
    thumbnailUrl: string;
    isbn: string;
  };
}

const getMyLibrary = async (): Promise<UserBook[]> => {
  const response = await apiClient.get('/user-books');
  return response.data.content || [];
};

const addUserBook = async (book: BookDetail, readingStatus: ReadingStatus): Promise<UserBook> => {
  const requestData = {
    googleBooksId: book.googleBooksId,
    status: readingStatus,
    title: book.title,
    authors: book.authors.join(', '),
    publisher: book.publisher,
    publishedDate: book.publishedDate,
    description: book.description,
    pageCount: book.pageCount,
    thumbnailUrl: book.thumbnailUrl,
    isbn: book.isbn,
  };
  const response = await apiClient.post<UserBook>('/user-books', requestData);
  return response.data;
};

const updateUserBook = async (
  userBookId: number, 
  status?: ReadingStatus, 
  currentPage?: number, 
  memo?: string
): Promise<UserBook> => {
  const requestData: any = {};
  if (status !== undefined) requestData.status = status;
  if (currentPage !== undefined) requestData.currentPage = currentPage;
  if (memo !== undefined) requestData.memo = memo;
  
  const response = await apiClient.put<UserBook>(`/user-books/${userBookId}`, requestData);
  return response.data;
};

const deleteUserBook = async (userBookId: number): Promise<void> => {
  await apiClient.delete(`/user-books/${userBookId}`);
};

const userBookService = {
  getMyLibrary,
  addUserBook,
  updateUserBook,
  deleteUserBook,
};

export default userBookService; 