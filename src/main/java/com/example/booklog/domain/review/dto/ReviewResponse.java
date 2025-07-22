package com.example.booklog.domain.review.dto;

import com.example.booklog.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    
    // 사용자 정보
    private UserInfo user;
    
    // 책 정보
    private BookInfo book;
    
    // 리뷰 내용
    private Integer rating;
    private String oneLineReview;
    private String detailedReview;
    
    // 날짜 정보
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookInfo {
        private Long id;
        private String googleBooksId;
        private String title;
        private String authors;
        private String publisher;
        private LocalDate publishedDate;
        private String description;
        private Integer pageCount;
        private String thumbnailUrl;
        private String isbn;
        private Double averageRating;
        private Integer reviewCount;
    }

    // Entity에서 Response로 변환하는 정적 메서드
    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .user(UserInfo.builder()
                        .id(review.getUser().getId())
                        .username(review.getUser().getUsername())
                        .email(review.getUser().getEmail())
                        .build())
                .book(BookInfo.builder()
                        .id(review.getBook().getId())
                        .googleBooksId(review.getBook().getGoogleBooksId())
                        .title(review.getBook().getTitle())
                        .authors(review.getBook().getAuthors())
                        .publisher(review.getBook().getPublisher())
                        .publishedDate(review.getBook().getPublishedDate())
                        .description(review.getBook().getDescription())
                        .pageCount(review.getBook().getPageCount())
                        .thumbnailUrl(review.getBook().getThumbnailUrl())
                        .isbn(review.getBook().getIsbn())
                        .averageRating(review.getBook().getAverageRating())
                        .reviewCount(review.getBook().getReviewCount())
                        .build())
                .rating(review.getRating())
                .oneLineReview(review.getOneLineReview())
                .detailedReview(review.getDetailedReview())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
} 