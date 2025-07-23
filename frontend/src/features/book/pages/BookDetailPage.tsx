import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import bookService from '../services/bookService';
import type { BookDetail } from '../types/book';
import AddBookToLibraryModal from '../../../components/common/AddBookToLibraryModal';
import ReviewForm from '../../../components/review/ReviewForm';
import useAuthStore from '../../auth/store/authStore';
import reviewService, { Review } from '../../user/services/reviewService';
import ReviewList from '../../../components/review/ReviewList';
import userBookService, { ReadingStatus, UserBook } from '../../user/services/userBookService';

const BookDetailPage = () => {
  const { googleBooksId } = useParams<{ googleBooksId: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuthStore();
  const [existingUserBook, setExistingUserBook] = useState<UserBook | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchReviews = async (googleBooksId: string, page: number = 0) => {
    try {
      const response = await reviewService.getReviewsByBook(googleBooksId, page);
      setReviews(response.content);
      setTotalReviews(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviews([]);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleEditReviewSubmit = async (rating: number, content: string) => {
    if (!editingReview) return;
    
    try {
      await reviewService.updateReview(editingReview.id, {
        rating,
        oneLineReview: content,
        detailedReview: '' // 간단하게 oneLineReview만 사용
      });
      alert('리뷰가 수정되었습니다.');
      setEditingReview(null);
      // 리뷰 목록 새로고침
      if (googleBooksId) {
        await fetchReviews(googleBooksId, reviewPage);
      }
    } catch (err) {
      console.error('Failed to update review:', err);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Base64로 인코딩된 간단한 책 이미지 placeholder
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFNUU1RTUiLz4KPHR5eHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await reviewService.deleteReview(reviewId);
      alert('리뷰가 삭제되었습니다.');
      // 리뷰 목록 새로고침
      if (googleBooksId) {
        await fetchReviews(googleBooksId, reviewPage);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      if (!googleBooksId) {
        setError('Book ID not found.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // 책 정보 가져오기
        const bookData = await bookService.getBookDetail(googleBooksId);
        setBook(bookData);

        if (isLoggedIn) {
          try {
            // 내 서재에서 이 책의 상태 확인
            const myLibrary = await userBookService.getMyLibrary();
            const userBook = myLibrary.find(book => book.book.googleBooksId === googleBooksId);
            setExistingUserBook(userBook || null);
          } catch (err) {
            console.error('Failed to check library status:', err);
          }
        }

        // 리뷰 목록 가져오기
        await fetchReviews(googleBooksId, reviewPage);
      } catch (err) {
        console.error('Failed to fetch book details:', err);
        setError('책 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookAndReviews();
  }, [googleBooksId, isLoggedIn, reviewPage]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddBook = async (readingStatus: ReadingStatus) => {
    if (!book) return;
    try {
      const result = await userBookService.addUserBook(book, readingStatus);
      setExistingUserBook(result);
      alert('내 서재에 책이 추가되었습니다.');
      handleModalClose();
    } catch (error: any) {
      console.error('Failed to add book to library:', error);
      if (error.response?.status === 409) {
        alert('이미 내 서재에 있는 책입니다.');
      } else {
        alert('책을 서재에 추가하는 데 실패했습니다.');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setReviewPage(page);
  };

  if (isLoading) return <LoadingText>Loading...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!book) return <ErrorText>Book not found.</ErrorText>;

  return (
    <Container>
      <BookInfoContainer>
        <Thumbnail 
          src={imageError ? fallbackImage : (book.thumbnailUrl || fallbackImage)} 
          alt={book.title} 
          onError={handleImageError} 
        />
        <Info>
          <Title>{book.title}</Title>
          <Author>Authors: {book.authors?.join(', ')}</Author>
          <Publisher>Publisher: {book.publisher}</Publisher>
          <PublishedDate>Published Date: {book.publishedDate}</PublishedDate>
          <PageCount>Pages: {book.pageCount}</PageCount>
          <Description dangerouslySetInnerHTML={{ __html: book.description || 'No description available.' }} />
          {isLoggedIn && (
            existingUserBook ? (
              <StatusBadge>
                {existingUserBook.status === 'WANT_TO_READ' && '읽고 싶은 책'}
                {existingUserBook.status === 'READING' && '읽는 중인 책'}
                {existingUserBook.status === 'COMPLETED' && '다 읽은 책'}
              </StatusBadge>
            ) : (
              <AddButton onClick={handleModalOpen}>내 서재에 추가</AddButton>
            )
          )}
        </Info>
      </BookInfoContainer>

      <ReviewSection>
        <SectionTitle>리뷰</SectionTitle>
        <ReviewList 
          reviews={reviews}
          totalElements={totalReviews}
          currentPage={reviewPage}
          totalPages={totalPages}
          currentUserId={user?.id}
          onPageChange={handlePageChange}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />
      </ReviewSection>

      {isModalOpen && book && (
        <AddBookToLibraryModal
          isOpen={isModalOpen}
          book={book}
          onClose={handleModalClose}
          onAddBook={handleAddBook}
        />
      )}

      {editingReview && (
        <Modal>
          <ModalContent>
            <ReviewForm
              onSubmit={handleEditReviewSubmit}
              onCancel={handleCancelEdit}
              initialRating={editingReview.rating}
              initialContent={editingReview.oneLineReview}
              isEditMode={true}
            />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// ... styled-components ...
const Container = styled.div`
  padding: 2rem;
`;

const BookInfoContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Thumbnail = styled.img`
  width: 200px;
  object-fit: contain;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
`;

const Author = styled.p`
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const Publisher = styled.p`
  font-size: 1rem;
  color: #777;
  margin-bottom: 1rem;
`;

const PublishedDate = styled.p`
  font-size: 1rem;
  color: #777;
  margin-bottom: 1rem;
`;

const PageCount = styled.p`
  font-size: 1rem;
  color: #777;
  margin-bottom: 1rem;
`;

const Description = styled.div`
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const AddButton = styled.button`
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ReviewSection = styled.div`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.5rem;
  color: #555;
`;

const ErrorText = styled.p`
  color: red;
  text-align: center;
  font-size: 1.2rem;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 20px;
  font-weight: bold;
  margin-top: 1rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

export default BookDetailPage; 