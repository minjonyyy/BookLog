package com.example.booklog.domain.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "리뷰 작성 요청")
public class ReviewRequest {

    @NotBlank(message = "책 ID는 필수입니다.")
    @Schema(description = "Google Books ID", example = "YmjiEAAAQBAJ")
    private String googleBooksId;

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    @Schema(description = "평점 (1-5)", example = "5")
    private Integer rating;

    @NotBlank(message = "한 줄 리뷰는 필수입니다.")
    @Schema(description = "한 줄 리뷰", example = "정말 좋은 책이에요!")
    private String oneLineReview;

    @Schema(description = "상세 리뷰 (선택)", example = "이 책의 장점은...")
    private String detailedReview;
} 