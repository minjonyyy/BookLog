package com.example.booklog.domain.userbook.dto;

import com.example.booklog.domain.userbook.entity.UserBook;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookRequest {

    @NotBlank(message = "Google Books ID는 필수입니다")
    private String googleBooksId;

    @NotNull(message = "독서 상태는 필수입니다")
    private UserBook.ReadingStatus status;

    @Min(value = 0, message = "현재 페이지는 0 이상이어야 합니다")
    private Integer currentPage;

    @Size(max = 1000, message = "메모는 1000자 이하여야 합니다")
    private String memo;

    // BookSearchResponse.BookSummary 정보 (책 정보가 DB에 없을 경우 생성용)
    private String title;
    private String[] authors;
    private String publisher;
    private String publishedDate;
    private String description;
    private Integer pageCount;
    private String thumbnailUrl;
    private String isbn;
} 