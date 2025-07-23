package com.example.booklog.domain.userbook.entity;

import jakarta.persistence.*;
import com.example.booklog.domain.user.entity.User;
import com.example.booklog.domain.book.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_books", 
        uniqueConstraints = @UniqueConstraint(name = "unique_user_book", columnNames = {"user_id", "book_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingStatus status;

    @Column(name = "current_page")
    @Builder.Default
    private Integer currentPage = 0;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ReadingStatus {
        WANT_TO_READ("읽고 싶어요"),
        READING("읽는 중"),
        COMPLETED("다 읽음");

        private final String description;

        ReadingStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 비즈니스 메서드
    public void updateStatus(ReadingStatus status) {
        this.status = status;
        
        if (status == ReadingStatus.READING && this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        } else if (status == ReadingStatus.COMPLETED) {
            this.completedAt = LocalDateTime.now();
            // 완료시 현재 페이지를 전체 페이지로 설정
            if (this.book.getPageCount() != null) {
                this.currentPage = this.book.getPageCount();
            }
        }
    }

    public void updateCurrentPage(Integer currentPage) {
        if (currentPage < 0) {
            throw new IllegalArgumentException("현재 페이지는 0보다 작을 수 없습니다.");
        }
        
        if (this.book.getPageCount() != null && currentPage > this.book.getPageCount()) {
            throw new IllegalArgumentException("현재 페이지는 전체 페이지를 초과할 수 없습니다.");
        }
        
        this.currentPage = currentPage;
        
        // 전체 페이지를 다 읽었으면 자동으로 완료 상태로 변경
        if (this.book.getPageCount() != null && currentPage.equals(this.book.getPageCount())) {
            updateStatus(ReadingStatus.COMPLETED);
        }
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }

    // 진행률 계산 (백분율)
    public double getProgress() {
        if (this.book.getPageCount() == null || this.book.getPageCount() == 0) {
            return 0.0;
        }
        return Math.round((double) this.currentPage / this.book.getPageCount() * 100 * 100.0) / 100.0;
    }

    // 연관관계 편의 메서드
    public void setUser(User user) {
        this.user = user;
        user.getUserBooks().add(this);
    }

    public void setBook(Book book) {
        this.book = book;
        book.getUserBooks().add(this);
    }
} 