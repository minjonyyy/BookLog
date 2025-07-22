package com.example.booklog.domain.userbook.dto;

import com.example.booklog.domain.userbook.entity.UserBook;
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
public class UserBookResponse {

    private Long id;
    private Long userId;
    private String username;
    
    // 책 정보
    private BookInfo book;
    
    // 독서 상태 정보
    private UserBook.ReadingStatus status;
    private Integer currentPage;
    private String memo;
    private Double progress; // 진행률 (%)
    
    // 날짜 정보
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
    public static UserBookResponse from(UserBook userBook) {
        return UserBookResponse.builder()
                .id(userBook.getId())
                .userId(userBook.getUser().getId())
                .username(userBook.getUser().getUsername())
                .book(BookInfo.builder()
                        .id(userBook.getBook().getId())
                        .googleBooksId(userBook.getBook().getGoogleBooksId())
                        .title(userBook.getBook().getTitle())
                        .authors(userBook.getBook().getAuthors())
                        .publisher(userBook.getBook().getPublisher())
                        .publishedDate(userBook.getBook().getPublishedDate())
                        .description(userBook.getBook().getDescription())
                        .pageCount(userBook.getBook().getPageCount())
                        .thumbnailUrl(userBook.getBook().getThumbnailUrl())
                        .isbn(userBook.getBook().getIsbn())
                        .averageRating(userBook.getBook().getAverageRating())
                        .reviewCount(userBook.getBook().getReviewCount())
                        .build())
                .status(userBook.getStatus())
                .currentPage(userBook.getCurrentPage())
                .memo(userBook.getMemo())
                .progress(userBook.getProgress())
                .startedAt(userBook.getStartedAt())
                .completedAt(userBook.getCompletedAt())
                .createdAt(userBook.getCreatedAt())
                .updatedAt(userBook.getUpdatedAt())
                .build();
    }
} 