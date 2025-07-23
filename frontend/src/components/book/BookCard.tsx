import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import bookService from '../../features/book/services/bookService';

interface BookCardProps {
  book: {
    id: number;
    googleBooksId: string; // 상세 페이지 이동을 위해 googleBooksId 사용
    title: string;
    authors: string[]; 
    thumbnailUrl: string;
  };
}

const BookCard = ({ book }: BookCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [actualThumbnailUrl, setActualThumbnailUrl] = useState(book.thumbnailUrl);
  // Base64로 인코딩된 간단한 책 이미지 placeholder
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDEyOCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0U1RTVFNSIvPgo8dGV4dCB4PSI2NCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  // thumbnailUrl이 빈 문자열이거나 없을 때 Google Books API에서 가져오기
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (!book.thumbnailUrl || book.thumbnailUrl.trim() === '') {
        try {
          const bookDetail = await bookService.getBookDetail(book.googleBooksId);
          if (bookDetail.thumbnailUrl) {
            setActualThumbnailUrl(bookDetail.thumbnailUrl);
          }
        } catch (error) {
          console.error(`Failed to fetch thumbnail for ${book.title}:`, error);
        }
      }
    };

    fetchThumbnail();
  }, [book.googleBooksId, book.thumbnailUrl, book.title]);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError ? fallbackImage : (actualThumbnailUrl || fallbackImage);
  
  return (
    <CardLink to={`/book/${book.googleBooksId}`}>
      <img 
        src={imageUrl} 
        alt={book.title}
        onError={handleImageError}
      />
      <BookTitle>{book.title}</BookTitle>
      <BookAuthor>{book.authors?.join(', ')}</BookAuthor> {/* 배열을 문자열로 변환 */}
    </CardLink>
  );
};

const CardLink = styled(Link)`
  display: block;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    max-width: 100%;
    height: 180px;
    object-fit: cover;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
`;

const BookTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BookAuthor = styled.p`
  font-size: 0.875rem;
  color: #666;
`;

export default BookCard; 