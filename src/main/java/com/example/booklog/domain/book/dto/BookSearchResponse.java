package com.example.booklog.domain.book.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchResponse {

    private List<BookSummary> content;
    private Integer totalElements;
    private Integer totalPages;
    private Integer page;
    private Integer size;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookSummary {
        private String googleBooksId;
        private String title;
        private List<String> authors;
        private String publisher;
        private LocalDate publishedDate;
        private String description;
        private Integer pageCount;
        private String thumbnailUrl;
        private String isbn;
    }
} 