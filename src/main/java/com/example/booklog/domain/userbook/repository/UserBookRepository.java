package com.example.booklog.domain.userbook.repository;

import com.example.booklog.domain.userbook.entity.UserBook;
import com.example.booklog.domain.userbook.entity.UserBook.ReadingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    
    Optional<UserBook> findByUserIdAndBookId(Long userId, Long bookId);
    
    Page<UserBook> findByUserId(Long userId, Pageable pageable);
    
    Page<UserBook> findByUserIdAndStatus(Long userId, ReadingStatus status, Pageable pageable);
    
    List<UserBook> findByUserIdAndStatus(Long userId, ReadingStatus status);
    
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    // 통계용 쿼리들
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.user.id = :userId")
    Long countByUserId(Long userId);
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.user.id = :userId AND ub.status = :status")
    Long countByUserIdAndStatus(Long userId, ReadingStatus status);
    
    @Query("SELECT SUM(ub.currentPage) FROM UserBook ub WHERE ub.user.id = :userId AND ub.status = 'COMPLETED'")
    Long sumCompletedPagesByUserId(Long userId);
    
    // 최근 완독한 책 조회 (완독일 기준 내림차순)
    List<UserBook> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, ReadingStatus status);
    
    // 현재 읽는 중인 책 조회 (업데이트일 기준 내림차순)  
    List<UserBook> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, ReadingStatus status);
} 