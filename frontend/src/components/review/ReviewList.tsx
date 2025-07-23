import React, { useState } from 'react';
import styled from 'styled-components';
import type { Review } from '../../features/user/services/reviewService';

interface ReviewListProps {
  reviews: Review[];
  totalElements?: number;
  currentPage?: number;
  totalPages?: number;
  currentUserId?: number;
  onPageChange?: (page: number) => void;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
}

const StarRating = ({ rating }: { rating: number }) => (
  <Stars>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</Stars>
);

const ReviewList = ({ 
  reviews, 
  totalElements = 0, 
  currentPage = 0, 
  totalPages = 0, 
  currentUserId,
  onPageChange,
  onEditReview,
  onDeleteReview 
}: ReviewListProps) => {
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  if (reviews.length === 0) {
    return <EmptyMessage>아직 작성된 리뷰가 없습니다.</EmptyMessage>;
  }

  return (
    <Container>
      <TotalCount>총 {totalElements}개의 리뷰</TotalCount>
      <ReviewGrid>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <ReviewHeader>
              <UserInfo>
                <Username>{review.user.username}</Username>
                <StarRating rating={review.rating} />
              </UserInfo>
              <RightSection>
                <ReviewDate>{new Date(review.createdAt).toLocaleDateString()}</ReviewDate>
                {currentUserId === review.user.id && (
                  <ActionButtons>
                    <ActionButton onClick={() => onEditReview?.(review)}>
                      수정
                    </ActionButton>
                    <ActionButton 
                      $delete 
                      onClick={() => onDeleteReview?.(review.id)}
                    >
                      삭제
                    </ActionButton>
                  </ActionButtons>
                )}
              </RightSection>
            </ReviewHeader>
            <OneLineReview>{review.oneLineReview}</OneLineReview>
            {review.detailedReview && (
              <>
                <ShowMoreButton
                  onClick={() => toggleReview(review.id)}
                  type="button"
                >
                  {expandedReviews.includes(review.id) ? '접기' : '더보기'}
                </ShowMoreButton>
                {expandedReviews.includes(review.id) && (
                  <DetailedReview>{review.detailedReview}</DetailedReview>
                )}
              </>
            )}
          </ReviewCard>
        ))}
      </ReviewGrid>
      {totalPages > 1 && (
        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => (
            <PageButton
              key={i}
              $active={i === currentPage}
              onClick={() => onPageChange?.(i)}
              disabled={i === currentPage}
            >
              {i + 1}
            </PageButton>
          ))}
        </Pagination>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TotalCount = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ReviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Username = styled.span`
  font-weight: bold;
`;

const Stars = styled.div`
  color: #f0c040;
  letter-spacing: 2px;
`;

const ReviewDate = styled.span`
  font-size: 0.875rem;
  color: #888;
`;

const OneLineReview = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const DetailedReview = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap;
  margin-top: 1rem;
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  margin: 2rem 0;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $active }) => ($active ? '#333' : '#ddd')};
  background-color: ${({ $active }) => ($active ? '#333' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#333')};
  cursor: pointer;
  border-radius: 4px;

  &:hover:not(:disabled) {
    background-color: #f0f0f0;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ActionButton = styled.button<{ $delete?: boolean }>`
  padding: 0.25rem 0.5rem;
  border: 1px solid ${({ $delete }) => ($delete ? '#dc3545' : '#007bff')};
  background-color: ${({ $delete }) => ($delete ? '#dc3545' : '#007bff')};
  color: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  
  &:hover {
    background-color: ${({ $delete }) => ($delete ? '#c82333' : '#0056b3')};
    border-color: ${({ $delete }) => ($delete ? '#c82333' : '#0056b3')};
  }
`;

export default ReviewList; 