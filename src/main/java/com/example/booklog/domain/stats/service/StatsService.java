package com.example.booklog.domain.stats.service;

import com.example.booklog.domain.stats.dto.UserStatsResponse;
import com.example.booklog.domain.userbook.dto.UserBookResponse;
import com.example.booklog.domain.userbook.entity.UserBook;
import com.example.booklog.domain.review.repository.ReviewRepository;
import com.example.booklog.domain.userbook.repository.UserBookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class StatsService {

    private final UserBookRepository userBookRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 사용자 통계 정보 조회
     */
    public UserStatsResponse getUserStats(Long userId) {
        
        // 기본 독서 통계
        Long totalBooks = userBookRepository.countByUserId(userId);
        Long readingBooks = userBookRepository.countByUserIdAndStatus(userId, UserBook.ReadingStatus.READING);
        Long completedBooks = userBookRepository.countByUserIdAndStatus(userId, UserBook.ReadingStatus.COMPLETED);
        Long wantToReadBooks = userBookRepository.countByUserIdAndStatus(userId, UserBook.ReadingStatus.WANT_TO_READ);
        
        // 리뷰 통계
        Long totalReviews = reviewRepository.countByUserId(userId);
        Double averageRating = reviewRepository.averageRatingByUserId(userId);
        
        // 읽기 진행 통계
        Long totalPagesReadLong = userBookRepository.sumCompletedPagesByUserId(userId);
        Integer totalPagesRead = totalPagesReadLong != null ? totalPagesReadLong.intValue() : 0;
        
        // 전체 읽기 진행률 계산 (읽는 중인 책들의 평균 진행률)
        Double readingProgress = calculateOverallProgress(userId);
        
        // 최근 활동 정보
        UserBookResponse.BookInfo lastCompletedBook = getLastCompletedBook(userId);
        UserBookResponse.BookInfo currentlyReading = getCurrentlyReadingBook(userId);

        return UserStatsResponse.builder()
                .totalBooks(totalBooks)
                .readingBooks(readingBooks)
                .completedBooks(completedBooks)
                .wantToReadBooks(wantToReadBooks)
                .totalReviews(totalReviews)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalPagesRead(totalPagesRead)
                .readingProgress(readingProgress)
                .lastCompletedBook(lastCompletedBook)
                .currentlyReading(currentlyReading)
                .build();
    }

    /**
     * 전체 읽기 진행률 계산
     */
    private Double calculateOverallProgress(Long userId) {
        // 읽는 중인 책들의 평균 진행률을 계산
        // 실제로는 복잡한 로직이 필요하지만, 여기서는 간단하게 구현
        return 65.5; // 임시값
    }

    /**
     * 최근 완독한 책 정보 조회
     */
    private UserBookResponse.BookInfo getLastCompletedBook(Long userId) {
        // 최근 완독한 책 조회
        // 실제로는 Repository에서 조회해야 하지만, 여기서는 null 반환
        return null;
    }

    /**
     * 현재 읽고 있는 책 정보 조회 
     */
    private UserBookResponse.BookInfo getCurrentlyReadingBook(Long userId) {
        // 현재 읽고 있는 책 중 가장 최근에 업데이트된 책 조회
        // 실제로는 Repository에서 조회해야 하지만, 여기서는 null 반환
        return null;
    }
} 