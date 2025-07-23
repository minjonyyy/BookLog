package com.example.booklog.domain.review.repository;

import com.example.booklog.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Optional<Review> findByUserIdAndBookId(Long userId, Long bookId);
    
    Page<Review> findByBookId(Long bookId, Pageable pageable);
    
    Page<Review> findByUserId(Long userId, Pageable pageable);
    
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    Page<Review> findByBook_GoogleBooksId(String googleBooksId, Pageable pageable);
    boolean existsByUserIdAndBook_GoogleBooksId(Long userId, String googleBooksId);
    
    // 통계용 쿼리들
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.id = :userId")
    Long countByUserId(Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.user.id = :userId")
    Double averageRatingByUserId(Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId")
    Double averageRatingByBookId(Long bookId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.id = :bookId")
    Long countByBookId(Long bookId);
    
    // UserBook 삭제 시 관련 리뷰 삭제를 위한 메서드들
    @Modifying
    @Query("DELETE FROM Review r WHERE r.user.id = :userId AND r.book.id = :bookId")
    void deleteByUserIdAndBookId(Long userId, Long bookId);
} 