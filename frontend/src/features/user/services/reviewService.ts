import apiClient from '../features/auth/services/api';

export interface Review {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
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
    averageRating: number;
    reviewCount: number;
  };
  rating: number;
  oneLineReview: string;
  detailedReview: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  googleBooksId: string;
  rating: number;
  oneLineReview: string;
  detailedReview: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  oneLineReview?: string;
  detailedReview?: string;
}

// 리뷰 작성
const createReview = async (data: CreateReviewRequest): Promise<Review> => {
  const response = await apiClient.post<Review>('/reviews', data);
  return response.data;
};

// 책별 리뷰 목록 조회
const getReviewsByBook = async (
  googleBooksId: string,
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): Promise<{ content: Review[]; totalElements: number; totalPages: number }> => {
  const response = await apiClient.get(`/reviews/book/${googleBooksId}`, {
    params: { page, size, sort, direction }
  });
  return response.data;
};

// 내 리뷰 목록 조회
const getMyReviews = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): Promise<{ content: Review[]; totalElements: number; totalPages: number }> => {
  const response = await apiClient.get('/reviews/my', {
    params: { page, size, sort, direction }
  });
  return response.data;
};

// 리뷰 수정
const updateReview = async (reviewId: number, data: UpdateReviewRequest): Promise<Review> => {
  const response = await apiClient.put<Review>(`/reviews/${reviewId}`, data);
  return response.data;
};

// 리뷰 삭제
const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/reviews/${reviewId}`);
};

const reviewService = {
  createReview,
  getReviewsByBook,
  getMyReviews,
  updateReview,
  deleteReview,
};

export default reviewService; 