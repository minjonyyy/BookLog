import React, { useState } from 'react';
import styled from 'styled-components';
import bookService from '../services/bookService';
import BookCard from '../components/BookCard';
import type { BookSummary } from '../types/book';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await searchBooks(0); // 첫 페이지부터 검색
  };

  const searchBooks = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookService.searchBooks(query, page);
      setResults(response.content); 
      setCurrentPage(page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError('책을 검색하는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      searchBooks(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Container>
      <Title>책 검색</Title>
      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 또는 저자를 입력하세요"
        />
        <SearchButton type="submit">검색</SearchButton>
      </SearchForm>

      {loading && <LoadingText>검색 중...</LoadingText>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {results.length > 0 && (
        <>
          <SearchInfo>
            "{query}" 검색 결과: {totalElements}개 (페이지 {currentPage + 1} / {totalPages})
          </SearchInfo>
          
          <ResultsGrid>
            {results.map((book) => (
              <BookCard key={book.googleBooksId} book={book} />
            ))}
          </ResultsGrid>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← 이전
              </PageButton>
              
              {/* 페이지 번호들 */}
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
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  text-align: center;
  margin: 1rem 0;
`;

const SearchInfo = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.75rem 1rem;
  background: #fff;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover:not(:disabled) {
    background: #007bff;
    color: white;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    border-color: #dee2e6;
    cursor: not-allowed;
  }
`;

const PageNumberButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  background: ${({ $active }) => $active ? '#007bff' : '#fff'};
  color: ${({ $active }) => $active ? 'white' : '#007bff'};
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 45px;
  
  &:hover:not(:disabled) {
    background: ${({ $active }) => $active ? '#0056b3' : '#e7f3ff'};
  }
`;

export default SearchPage; 