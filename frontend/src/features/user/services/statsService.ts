import apiClient from '../features/auth/services/api';

export interface UserStats {
  totalBooks: number;
  readingBooks: number;
  completedBooks: number;
  wantToReadBooks: number;
  totalReviews: number;
  averageRating: number;
  totalPagesRead: number;
  readingProgress: number;
  lastCompletedBook: {
    id: number;
    googleBooksId: string;
    title: string;
    authors: string;
    thumbnailUrl: string;
  } | null;
  currentlyReading: {
    id: number;
    googleBooksId: string;
    title: string;
    authors: string;
    thumbnailUrl: string;
  } | null;
}

const getUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get<UserStats>('/stats/my');
  return response.data;
};

const statsService = {
  getUserStats,
};

export default statsService; 