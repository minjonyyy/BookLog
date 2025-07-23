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

import java.util.List;

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
        // 읽는 중인 책들의 진행률을 계산
        List<UserBook> readingBooks = userBookRepository.findByUserIdAndStatus(userId, UserBook.ReadingStatus.READING);
        
        if (readingBooks.isEmpty()) {
            return 0.0;
        }
        
        double totalProgress = 0.0;
        int validBooks = 0;
        
        for (UserBook userBook : readingBooks) {
            if (userBook.getBook().getPageCount() != null && userBook.getBook().getPageCount() > 0) {
                double progress = (double) userBook.getCurrentPage() / userBook.getBook().getPageCount() * 100;
                totalProgress += progress;
                validBooks++;
            }
        }
        
        return validBooks > 0 ? totalProgress / validBooks : 0.0;
    }

    /**
     * 최근 완독한 책 정보 조회
     */
    private UserBookResponse.BookInfo getLastCompletedBook(Long userId) {
        // 최근 완독한 책 조회 (completedAt 기준으로 정렬)
        List<UserBook> completedBooks = userBookRepository.findByUserIdAndStatusOrderByCompletedAtDesc(
            userId, UserBook.ReadingStatus.COMPLETED
        );
        
        if (completedBooks.isEmpty()) {
            return null;
        }
        
        UserBook lastCompleted = completedBooks.get(0);
        return UserBookResponse.BookInfo.builder()
                .id(lastCompleted.getBook().getId())
                .googleBooksId(lastCompleted.getBook().getGoogleBooksId())
                .title(lastCompleted.getBook().getTitle())
                .authors(lastCompleted.getBook().getAuthors())
                .thumbnailUrl(lastCompleted.getBook().getThumbnailUrl())
                .pageCount(lastCompleted.getBook().getPageCount())
                .build();
    }

    /**
     * 현재 읽고 있는 책 정보 조회 
     */
    private UserBookResponse.BookInfo getCurrentlyReadingBook(Long userId) {
        // 현재 읽고 있는 책 중 가장 최근에 업데이트된 책 조회
        List<UserBook> readingBooks = userBookRepository.findByUserIdAndStatusOrderByUpdatedAtDesc(
            userId, UserBook.ReadingStatus.READING
        );
        
        if (readingBooks.isEmpty()) {
            return null;
        }
        
        UserBook currentReading = readingBooks.get(0);
        return UserBookResponse.BookInfo.builder()
                .id(currentReading.getBook().getId())
                .googleBooksId(currentReading.getBook().getGoogleBooksId())
                .title(currentReading.getBook().getTitle())
                .authors(currentReading.getBook().getAuthors())
                .thumbnailUrl(currentReading.getBook().getThumbnailUrl())
                .pageCount(currentReading.getBook().getPageCount())
                .build();
    }
} 