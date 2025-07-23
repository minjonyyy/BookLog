import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import reviewService from '../services/reviewService';
import useAuthStore from '../store/authStore';
import { useDataRefresh } from '../store/DataRefreshContext';

interface MyReview {
  id: number;
  googleBooksId: string;
  bookTitle: string;
  bookAuthors: string;
  bookThumbnailUrl?: string;
  rating: number;
  content: string;
  createdAt: string;
}

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuthStore();
  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    fetchMyReviews();
  }, [currentPage, refreshTrigger]); // refreshTrigger 의존성 추가

  const fetchMyReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewService.getMyReviews(currentPage, 10);
      
      // 백엔드 응답 구조에 맞게 매핑
      const mappedReviews: MyReview[] = response.content.map((review: any) => ({
        id: review.id,
        googleBooksId: review.book.googleBooksId,
        bookTitle: review.book.title,
        bookAuthors: review.book.authors,
        bookThumbnailUrl: review.book.thumbnailUrl,
        rating: review.rating,
        content: review.detailedReview || review.oneLineReview,
        createdAt: review.createdAt
      }));
      
      setReviews(mappedReviews);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch my reviews:', err);
      setError('내 리뷰를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (isLoading) return <LoadingText>로딩 중...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <Container>
      <Header>
        <Title>📝 내가 작성한 리뷰</Title>
        <SubTitle>{user?.username}님이 작성한 리뷰 {reviews.length}개</SubTitle>
      </Header>

      {reviews.length > 0 ? (
        <>
          <ReviewsGrid>
            {reviews.map((review) => (
              <ReviewCard key={review.id}>
                <BookInfo>
                  <BookLink to={`/book/${review.googleBooksId}`}>
                    <BookImage 
                      src={review.bookThumbnailUrl || 'https://via.placeholder.com/80x120?text=No+Image'} 
                      alt={review.bookTitle}
                    />
                  </BookLink>
                  <BookDetails>
                    <BookTitle to={`/book/${review.googleBooksId}`}>
                      {review.bookTitle}
                    </BookTitle>
                    <BookAuthor>{review.bookAuthors}</BookAuthor>
                  </BookDetails>
                </BookInfo>
                
                <ReviewContent>
                  <RatingSection>
                    <Stars>{renderStars(review.rating)}</Stars>
                    <RatingText>{review.rating}/5</RatingText>
                  </RatingSection>
                  
                  <ReviewText>{review.content}</ReviewText>
                  
                  <ReviewDate>
                    {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </ReviewDate>
                </ReviewContent>
              </ReviewCard>
            ))}
          </ReviewsGrid>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← 이전
              </PageButton>
              
              <PageNumbers>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PageNumberButton
                      key={pageNum}
                      $active={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </PageNumberButton>
                  );
                })}
              </PageNumbers>

              <PageButton 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                다음 →
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>아직 작성한 리뷰가 없습니다</EmptyTitle>
          <EmptyDescription>
            읽은 책에 대한 생각을 리뷰로 남겨보세요!
          </EmptyDescription>
          <ActionButton to="/my-library">
            내 서재에서 리뷰 작성하기
          </ActionButton>
        </EmptyState>
      )}
    </Container>
  );
};

// 스타일드 컴포넌트들
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
`;

const ReviewsGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ReviewCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const BookInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BookLink = styled(Link)`
  text-decoration: none;
`;

const BookImage = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BookDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BookTitle = styled(Link)`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  margin-bottom: 0.5rem;
  
  &:hover {
    color: #667eea;
  }
`;

const BookAuthor = styled.p`
  color: #4a5568;
  font-size: 1rem;
`;

const ReviewContent = styled.div``;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Stars = styled.span`
  font-size: 1.2rem;
`;

const RatingText = styled.span`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
`;

const ReviewText = styled.p`
  color: #2d3748;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const ReviewDate = styled.p`
  color: #718096;
  font-size: 0.9rem;
  text-align: right;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
  
  &:hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
  }
`;

// 페이지네이션 스타일들
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    border-color: #e2e8f0;
    cursor: not-allowed;
  }
`;

const PageNumberButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  background: ${({ $active }) => $active ? '#667eea' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#667eea'};
  border: 2px solid ${({ $active }) => $active ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 45px;
  transition: all 0.2s ease;
  
  &:hover {
    ${({ $active }) => !$active && `
      background: #f0f4ff;
      border-color: #667eea;
    `}
    ${({ $active }) => $active && `
      background: #5a67d8;
    `}
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 3rem;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #e53e3e;
  font-size: 1.1rem;
  margin-top: 3rem;
  padding: 1rem;
  background: #fed7d7;
  border-radius: 12px;
  border: 1px solid #feb2b2;
`;

export default MyReviewsPage; 