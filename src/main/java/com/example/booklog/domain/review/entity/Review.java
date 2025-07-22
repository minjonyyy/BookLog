package com.example.booklog.domain.review.entity;

import jakarta.persistence.*;
import com.example.booklog.domain.user.entity.User;
import com.example.booklog.domain.book.entity.Book;import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
       uniqueConstraints = @UniqueConstraint(name = "unique_user_book_review", columnNames = {"user_id", "book_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "one_line_review", length = 200)
    private String oneLineReview;

    @Column(name = "detailed_review", columnDefinition = "TEXT")
    private String detailedReview;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 비즈니스 메서드
    public void updateReview(Integer rating, String oneLineReview, String detailedReview) {
        validateRating(rating);
        this.rating = rating;
        this.oneLineReview = oneLineReview;
        this.detailedReview = detailedReview;
    }

    public void updateRating(Integer rating) {
        validateRating(rating);
        this.rating = rating;
    }

    public void updateOneLineReview(String oneLineReview) {
        this.oneLineReview = oneLineReview;
    }

    public void updateDetailedReview(String detailedReview) {
        this.detailedReview = detailedReview;
    }

    // 평점 유효성 검사
    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이의 값이어야 합니다.");
        }
    }

    // 연관관계 편의 메서드
    public void setUser(User user) {
        this.user = user;
        user.getReviews().add(this);
    }

    public void setBook(Book book) {
        this.book = book;
        book.getReviews().add(this);
    }

    // 생성 시 평점 검증
    @PrePersist
    @PreUpdate
    private void validateBeforeSave() {
        validateRating(this.rating);
    }
} 