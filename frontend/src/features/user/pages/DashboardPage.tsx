import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import statsService, { UserStats } from '../../../services/statsService';
import useAuthStore from '../../auth/store/authStore';
import { useDataRefresh } from '../../common/store/DataRefreshContext';

const DashboardPage = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const userStats = await statsService.getUserStats();
        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('통계 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]); // refreshTrigger 의존성 추가

  if (isLoading) return <LoadingText>로딩 중...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!stats) return <ErrorText>통계 정보가 없습니다.</ErrorText>;

  return (
    <Container>
      <Title>📊 내 독서 통계</Title>
      <WelcomeMessage>안녕하세요, {user?.username}님! 📚</WelcomeMessage>

      {/* 기본 통계 카드들 */}
      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalBooks}</StatNumber>
          <StatLabel>총 등록한 책</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.readingBooks}</StatNumber>
          <StatLabel>읽는 중인 책</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.completedBooks}</StatNumber>
          <StatLabel>완독한 책</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.wantToReadBooks}</StatNumber>
          <StatLabel>읽고 싶은 책</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* 리뷰 통계 */}
      <Section>
        <SectionTitle>📝 리뷰 활동</SectionTitle>
        <ReviewStatsGrid>
          <ReviewStatCardLink to="/my-reviews">
            <StatNumber>{stats.totalReviews}</StatNumber>
            <StatLabel>작성한 리뷰</StatLabel>
          </ReviewStatCardLink>
          <ReviewStatCard>
            <StatNumber>{stats.averageRating.toFixed(1)}</StatNumber>
            <StatLabel>평균 평점</StatLabel>
          </ReviewStatCard>
        </ReviewStatsGrid>
      </Section>

      {/* 읽기 진행 통계 */}
      <Section>
        <SectionTitle>📖 읽기 진행률</SectionTitle>
        <ProgressSection>
          <ProgressStat>
            <StatNumber>{stats.totalPagesRead}</StatNumber>
            <StatLabel>총 읽은 페이지</StatLabel>
          </ProgressStat>
          <ProgressStat>
            <StatNumber>{stats.readingProgress.toFixed(1)}%</StatNumber>
            <StatLabel>전체 진행률</StatLabel>
          </ProgressStat>
        </ProgressSection>
      </Section>

      {/* 최근 활동 */}
      <Section>
        <SectionTitle>📚 최근 활동</SectionTitle>
        <RecentActivityGrid>
          {stats.currentlyReading && (
            <BookActivityCard>
              <ActivityLabel>최근 읽고 있는 책</ActivityLabel>
              <BookLink to={`/book/${stats.currentlyReading.googleBooksId}`}>
                <BookImage 
                  src={stats.currentlyReading.thumbnailUrl || 'https://via.placeholder.com/60x80?text=No+Image'} 
                  alt={stats.currentlyReading.title}
                />
                <BookInfo>
                  <BookTitle>{stats.currentlyReading.title}</BookTitle>
                  <BookAuthor>{stats.currentlyReading.authors}</BookAuthor>
                </BookInfo>
              </BookLink>
            </BookActivityCard>
          )}

          {stats.lastCompletedBook && (
            <BookActivityCard>
              <ActivityLabel>최근 완독한 책</ActivityLabel>
              <BookLink to={`/book/${stats.lastCompletedBook.googleBooksId}`}>
                <BookImage 
                  src={stats.lastCompletedBook.thumbnailUrl || 'https://via.placeholder.com/60x80?text=No+Image'} 
                  alt={stats.lastCompletedBook.title}
                />
                <BookInfo>
                  <BookTitle>{stats.lastCompletedBook.title}</BookTitle>
                  <BookAuthor>{stats.lastCompletedBook.authors}</BookAuthor>
                </BookInfo>
              </BookLink>
            </BookActivityCard>
          )}
        </RecentActivityGrid>
      </Section>

      
    </Container>
  );
};

// 스타일드 컴포넌트들
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  color: #2d3748;
`;

const WelcomeMessage = styled.p`
  font-size: 1.2rem;
  text-align: center;
  color: #4a5568;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: #667eea;
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2d3748;
`;

const ReviewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ReviewStatCard = styled.div`
  background: #38b2ac;
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(56, 178, 172, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(56, 178, 172, 0.2);
  }
`;

const ReviewStatCardLink = styled(Link)`
  background: #38b2ac;
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(56, 178, 172, 0.15);
  transition: all 0.3s ease;
  text-decoration: none;
  display: block;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(56, 178, 172, 0.2);
  }
`;

const ProgressSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProgressStat = styled.div`
  background: #4299e1;
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(66, 153, 225, 0.2);
  }
`;

const RecentActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const BookActivityCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const ActivityLabel = styled.div`
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const BookLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;

  &:hover {
    opacity: 0.8;
  }
`;

const BookImage = styled.img`
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const BookInfo = styled.div`
  flex: 1;
`;

const BookTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #2d3748;
`;

const BookAuthor = styled.div`
  color: #4a5568;
  font-size: 0.9rem;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;



const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 2rem;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #e53e3e;
  font-size: 1.1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: #fed7d7;
  border-radius: 12px;
  border: 1px solid #feb2b2;
`;

export default DashboardPage; 