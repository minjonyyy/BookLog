package com.example.booklog.domain.userbook.dto;

import com.example.booklog.domain.userbook.entity.UserBook.ReadingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "내 서재에 책 추가 요청")
public class UserBookRequest {

    @NotBlank(message = "Google Books ID는 필수입니다.")
    @Schema(description = "Google Books ID", example = "YmjiEAAAQBAJ")
    private String googleBooksId;

    @NotNull(message = "읽기 상태는 필수입니다.")
    @Schema(description = "읽기 상태 (WANT_TO_READ, READING, COMPLETED)", example = "WANT_TO_READ")
    private ReadingStatus status;

    @NotBlank(message = "책 제목은 필수입니다.")
    @Schema(description = "책 제목", example = "Do it! Node.js 프로그래밍 입문")
    private String title;

    @NotBlank(message = "저자는 필수입니다.")
    @Schema(description = "저자", example = "고경희")
    private String authors;

    @Schema(description = "출판사", example = "이지스퍼블리싱")
    private String publisher;

    @Schema(description = "출판일", example = "2020-07-01")
    private String publishedDate;

    @Schema(description = "설명", example = "Node.js 프로그래밍을 처음 시작하는 분들을 위한 책입니다.")
    private String description;

    @Schema(description = "페이지 수", example = "500")
    private Integer pageCount;

    @Schema(description = "썸네일 URL")
    private String thumbnailUrl;

    @Schema(description = "ISBN", example = "9791163031451")
    private String isbn;
} 