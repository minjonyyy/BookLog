import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';
import bookService from '../services/bookService';
import BookCard from '../components/BookCard';
import type { BookSummary } from '../types/book';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isLoggedIn, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await bookService.searchBooks(query);
      setResults(response.content);
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const popularBooks = [
    { title: "데이터 과학", category: "📊 데이터" },
    { title: "자바스크립트", category: "💻 프로그래밍" },
    { title: "마케팅", category: "📈 비즈니스" },
    { title: "심리학", category: "🧠 심리" },
    { title: "역사", category: "📜 역사" },
    { title: "철학", category: "🤔 철학" },
  ];

  return (
    <Container>
      {/* 히어로 섹션 */}
      <HeroSection>
        <HeroContent>
          <Title>📚 나만의 책 기록, BookLog</Title>
          <Subtitle>읽고, 기록하고, 공유하는 독서의 모든 것</Subtitle>
          
          {/* 검색 폼 */}
          <SearchSection>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="책 제목이나 저자를 검색해보세요..."
              />
              <SearchButton type="submit" disabled={isLoading}>
                {isLoading ? '🔍 검색 중...' : '🔍 검색'}
              </SearchButton>
            </SearchForm>
            <SearchHint>예: "해리포터", "무라카미 하루키", "자바스크립트" 등</SearchHint>
          </SearchSection>

          {/* 빠른 액션 (로그인한 사용자만) */}
          {isLoggedIn && (
            <QuickActions>
              <QuickActionButton onClick={() => navigate('/dashboard')}>
                📊 내 통계 보기
              </QuickActionButton>
              <QuickActionButton onClick={() => navigate('/my-library')}>
                📖 내 서재 가기
              </QuickActionButton>
            </QuickActions>
          )}

          {/* 로그인하지 않은 사용자용 안내 */}
          {!isLoggedIn && (
            <LoginPrompt>
              <p>더 많은 기능을 이용하려면 로그인하세요!</p>
              <QuickActions>
                <QuickActionButton onClick={() => navigate('/login')}>
                  🔑 로그인
                </QuickActionButton>
                <QuickActionButton onClick={() => navigate('/register')}>
                  📝 회원가입
                </QuickActionButton>
              </QuickActions>
            </LoginPrompt>
          )}
        </HeroContent>
      </HeroSection>

      {/* 검색 결과 */}
      {hasSearched && (
        <SearchResultsSection>
          <SectionTitle>
            🔍 "{query}" 검색 결과 ({results.length}개)
          </SectionTitle>
          {results.length > 0 ? (
            <ResultsGrid>
              {results.map((book) => (
                <BookCard key={book.googleBooksId} book={book} />
              ))}
            </ResultsGrid>
          ) : (
            <NoResults>
              <p>검색 결과가 없습니다.</p>
              <p>다른 키워드로 검색해보세요.</p>
            </NoResults>
          )}
        </SearchResultsSection>
      )}


      {/* 서비스 소개 */}
      {!hasSearched && (
        <FeaturesSection>
          <SectionTitle>✨ BookLog의 특별한 기능들</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>📚</FeatureIcon>
              <FeatureTitle>스마트한 책 검색</FeatureTitle>
              <FeatureDescription>
                Google Books 데이터로 수백만 권의 책을 빠르게 검색할 수 있어요
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>📖</FeatureIcon>
              <FeatureTitle>독서 진행률 관리</FeatureTitle>
              <FeatureDescription>
                읽는 중인 책의 페이지를 기록하고 진행률을 시각적으로 확인하세요
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⭐</FeatureIcon>
              <FeatureTitle>리뷰 & 평점</FeatureTitle>
              <FeatureDescription>
                읽은 책에 대한 생각을 기록하고 다른 사람들과 공유해보세요
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>독서 통계</FeatureTitle>
              <FeatureDescription>
                나의 독서 패턴과 통계를 한눈에 확인할 수 있어요
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
      )}
    </Container>
  );
};

// 스타일드 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 50px;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #fff;
  color: #667eea;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SearchHint = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const QuickActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const LoginPrompt = styled.div`
  margin-top: 2rem;
  
  p {
    margin-bottom: 1rem;
    opacity: 0.9;
  }
`;

const SearchResultsSection = styled.section`
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
`;

const NoResults = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  
  p {
    margin: 0.5rem 0;
  }
`;

const PopularSection = styled.section`
  padding: 3rem 2rem;
  background: #f8f9fa;
  max-width: 1200px;
  margin: 0 auto;
`;

const PopularGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const PopularItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .category {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .title {
    display: block;
    font-weight: bold;
    color: #333;
  }
`;

const FeaturesSection = styled.section`
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

export default HomePage; 