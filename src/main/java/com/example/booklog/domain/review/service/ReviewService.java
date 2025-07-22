package com.example.booklog.domain.review.service;

import com.example.booklog.domain.book.entity.Book;
import com.example.booklog.domain.review.entity.Review;
import com.example.booklog.domain.user.entity.User;
import com.example.booklog.common.exception.CustomException;
import com.example.booklog.common.exception.ErrorCode;
import com.example.booklog.domain.review.repository.ReviewRepository;
import com.example.booklog.domain.user.service.UserService;
import com.example.booklog.domain.book.service.BookService;import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final BookService bookService;

    /**
     * 리뷰 작성
     */
    @Transactional
    public Review createReview(Long userId, Long bookId, Integer rating, 
                             String oneLineReview, String detailedReview) {
        
        User user = userService.findById(userId);
        Book book = bookService.findById(bookId);

        // 중복 리뷰 체크
        if (reviewRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new CustomException(ErrorCode.DUPLICATE_REVIEW);
        }

        // 평점 유효성 검사
        validateRating(rating);

        // 리뷰 생성
        Review review = Review.builder()
                .user(user)
                .book(book)
                .rating(rating)
                .oneLineReview(oneLineReview)
                .detailedReview(detailedReview)
                .build();

        return reviewRepository.save(review);
    }

    /**
     * 특정 책의 리뷰 목록 조회
     */
    public Page<Review> getReviewsByBook(Long bookId, Pageable pageable) {
        // 책 존재 여부 확인
        bookService.findById(bookId);
        
        return reviewRepository.findByBookId(bookId, pageable);
    }

    /**
     * 특정 사용자의 리뷰 목록 조회
     */
    public Page<Review> getReviewsByUser(Long userId, Pageable pageable) {
        // 사용자 존재 여부 확인
        userService.findById(userId);
        
        return reviewRepository.findByUserId(userId, pageable);
    }

    /**
     * 리뷰 수정
     */
    @Transactional
    public Review updateReview(Long userId, Long reviewId, Integer rating, 
                             String oneLineReview, String detailedReview) {
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        // 작성자 확인
        if (!review.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.REVIEW_PERMISSION_DENIED);
        }

        // 평점 유효성 검사
        if (rating != null) {
            validateRating(rating);
        }

        // 리뷰 업데이트
        review.updateReview(
                rating != null ? rating : review.getRating(),
                oneLineReview != null ? oneLineReview : review.getOneLineReview(),
                detailedReview != null ? detailedReview : review.getDetailedReview()
        );

        return review;
    }

    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        // 작성자 확인
        if (!review.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.REVIEW_PERMISSION_DENIED);
        }

        reviewRepository.delete(review);
    }

    /**
     * 리뷰 조회
     */
    public Review getReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
    }

    /**
     * 평점 유효성 검사
     */
    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new CustomException(ErrorCode.INVALID_RATING);
        }
    }
} 