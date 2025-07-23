package com.example.booklog.domain.review.controller;

import com.example.booklog.domain.review.dto.ReviewRequest;
import com.example.booklog.domain.review.dto.ReviewUpdateRequest;
import com.example.booklog.domain.review.dto.ReviewResponse;
import com.example.booklog.domain.review.entity.Review;
import com.example.booklog.domain.user.service.CustomUserDetails;
import com.example.booklog.domain.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "리뷰 관리 API")
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰 작성
     */
    @PostMapping
    @Operation(summary = "리뷰 작성", description = "책에 대한 리뷰를 작성합니다")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {

        Review review = reviewService.createReview(
                userDetails.getUserId(),
                request.getGoogleBooksId(),
                request.getRating(),
                request.getOneLineReview(),
                request.getDetailedReview()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReviewResponse.from(review));
    }

    /**
     * 특정 책의 리뷰 목록 조회
     */
    @GetMapping("/book/{googleBooksId}")
    @Operation(summary = "책 리뷰 목록 조회", description = "특정 책의 리뷰 목록을 조회합니다")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByBook(
            @PathVariable String googleBooksId,
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 기준") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "정렬 방향") @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<Review> reviews = reviewService.getReviewsByGoogleBooksId(googleBooksId, pageable);
        Page<ReviewResponse> response = reviews.map(ReviewResponse::from);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 내 리뷰 목록 조회
     */
    @GetMapping("/my")
    @Operation(summary = "내 리뷰 목록 조회", description = "사용자가 작성한 리뷰 목록을 조회합니다")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 기준") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "정렬 방향") @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<Review> reviews = reviewService.getReviewsByUser(userDetails.getUserId(), pageable);
        Page<ReviewResponse> response = reviews.map(ReviewResponse::from);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 상세 조회
     */
    @GetMapping("/{reviewId}")
    @Operation(summary = "리뷰 상세 조회", description = "특정 리뷰의 상세 정보를 조회합니다")
    public ResponseEntity<ReviewResponse> getReview(@PathVariable Long reviewId) {
        Review review = reviewService.getReview(reviewId);
        return ResponseEntity.ok(ReviewResponse.from(review));
    }

    /**
     * 리뷰 수정
     */
    @PutMapping("/{reviewId}")
    @Operation(summary = "리뷰 수정", description = "작성한 리뷰를 수정합니다")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request) {

        Review review = reviewService.updateReview(
                userDetails.getUserId(),
                reviewId,
                request.getRating(),
                request.getOneLineReview(),
                request.getDetailedReview()
        );

        return ResponseEntity.ok(ReviewResponse.from(review));
    }

    /**
     * 리뷰 삭제
     */
    @DeleteMapping("/{reviewId}")
    @Operation(summary = "리뷰 삭제", description = "작성한 리뷰를 삭제합니다")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reviewId) {

        reviewService.deleteReview(userDetails.getUserId(), reviewId);
        return ResponseEntity.noContent().build();
    }
} 