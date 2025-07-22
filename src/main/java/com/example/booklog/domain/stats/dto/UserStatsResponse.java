package com.example.booklog.domain.stats.dto;

import com.example.booklog.domain.userbook.dto.UserBookResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {

    // 기본 통계
    private Long totalBooks;        // 전체 등록한 책 수
    private Long readingBooks;      // 읽는 중인 책 수
    private Long completedBooks;    // 완독한 책 수  
    private Long wantToReadBooks;   // 읽을 예정인 책 수
    
    // 리뷰 통계
    private Long totalReviews;      // 작성한 리뷰 수
    private Double averageRating;   // 평균 평점
    
    // 읽기 진행 통계
    private Integer totalPagesRead; // 총 읽은 페이지 수
    private Double readingProgress; // 전체 읽기 진행률 (%)
    
    // 최근 활동
    private UserBookResponse.BookInfo lastCompletedBook;  // 최근 완독한 책
    private UserBookResponse.BookInfo currentlyReading;   // 현재 읽고 있는 책
} 