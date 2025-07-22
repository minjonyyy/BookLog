package com.example.booklog.domain.review.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdateRequest {

    @Min(value = 1, message = "평점은 1 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5 이하여야 합니다")
    private Integer rating;

    @Size(max = 200, message = "한줄평은 200자 이하여야 합니다")
    private String oneLineReview;

    @Size(max = 2000, message = "상세 리뷰는 2000자 이하여야 합니다")
    private String detailedReview;
} 