import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // 페이지 마운트 시 또는 URL 변경 시 상태 초기화
  useEffect(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setCurrentPage(0);
    setTotalPages(0);
    setTotalElements(0);
  }, [location.key]); // location.key가 바뀔 때마다 실행

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await searchBooks(0); // 첫 페이지부터 검색
  };

  const searchBooks = async (page: number, searchQuery?: string) => {
    const currentQuery = searchQuery || query;
    if (!currentQuery.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await bookService.searchBooks(currentQuery, page);
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

  const handlePopularSearch = async (keyword: string) => {
    setQuery(keyword);
    await searchBooks(0, keyword); // 키워드를 직접 전달
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

      {/* 인기 검색어 섹션 */}
      {!loading && results.length === 0 && (
        <PopularSearchSection>
          <PopularTitle>🔥 인기 검색어</PopularTitle>
          <PopularSubtitle>
            {query ? `"${query}"에 대한 검색 결과가 없습니다. 다른 키워드를 시도해보세요!` 
                  : '다른 사용자들이 많이 검색한 키워드예요'}
          </PopularSubtitle>
          
          <PopularGrid>
            <PopularItem onClick={() => handlePopularSearch('해리포터')}>
              <PopularRank>1</PopularRank>
              <PopularKeyword>해리포터</PopularKeyword>
              <PopularBadge>📚 소설</PopularBadge>
            </PopularItem>
            
            <PopularItem onClick={() => handlePopularSearch('무라카미 하루키')}>
              <PopularRank>2</PopularRank>
              <PopularKeyword>무라카미 하루키</PopularKeyword>
              <PopularBadge>✍️ 작가</PopularBadge>
            </PopularItem>
            
            <PopularItem onClick={() => handlePopularSearch('자바스크립트')}>
              <PopularRank>3</PopularRank>
              <PopularKeyword>자바스크립트</PopularKeyword>
              <PopularBadge>💻 프로그래밍</PopularBadge>
            </PopularItem>
            
            <PopularItem onClick={() => handlePopularSearch('데이터 과학')}>
              <PopularRank>4</PopularRank>
              <PopularKeyword>데이터 과학</PopularKeyword>
              <PopularBadge>📊 데이터</PopularBadge>
            </PopularItem>
            
            <PopularItem onClick={() => handlePopularSearch('심리학')}>
              <PopularRank>5</PopularRank>
              <PopularKeyword>심리학</PopularKeyword>
              <PopularBadge>🧠 심리</PopularBadge>
            </PopularItem>
            
            <PopularItem onClick={() => handlePopularSearch('역사')}>
              <PopularRank>6</PopularRank>
              <PopularKeyword>역사</PopularKeyword>
              <PopularBadge>📜 역사</PopularBadge>
            </PopularItem>
          </PopularGrid>
          
          <ComingSoonNotice>
            <ComingSoonIcon>🚀</ComingSoonIcon>
            <ComingSoonText>
              <strong>실시간 인기 검색어 기능 개발 중!</strong>
              <br />
              곧 사용자들의 실제 검색 데이터를 기반으로 한 
              <br />
              실시간 인기 검색어를 제공할 예정입니다.
            </ComingSoonText>
          </ComingSoonNotice>
        </PopularSearchSection>
      )}

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
  background: #f8fafc;
  min-height: 100vh;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 600;
  color:rgb(0, 0, 0);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);

  &:hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #667eea;
  font-weight: 500;
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background: #fed7d7;
  border-radius: 8px;
  border: 1px solid #feb2b2;
`;

const SearchInfo = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: #4a5568;
  font-size: 1.1rem;
  font-weight: 500;
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
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 1rem;
  }
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
    transform: translateY(-1px);
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
  
  &:hover:not(:disabled) {
    ${({ $active }) => !$active && `
      background: #f0f4ff;
      border-color: #667eea;
    `}
    ${({ $active }) => $active && `
      background: #5a67d8;
    `}
    transform: translateY(-1px);
  }
`;

const PopularSearchSection = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const PopularTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PopularSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
`;

const PopularGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const PopularItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f4ff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e7ff;

  &:hover {
    background: #e0e7ff;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 0.5rem;
  }
`;

const PopularRank = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  min-width: 20px;
  text-align: right;
`;

const PopularKeyword = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  flex-grow: 1;
`;

const PopularBadge = styled.span`
  padding: 0.3rem 0.7rem;
  background: #667eea;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ComingSoonNotice = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #fef7ff 100%);
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  text-align: center;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 0.85rem;
  }
`;

const ComingSoonIcon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const ComingSoonText = styled.p`
  line-height: 1.6;
`;

export default SearchPage; 