package com.example.booklog.domain.book.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class BookDetailResponse {
    private String googleBooksId;
    private String title;
    private List<String> authors;
    private String publisher;
    private LocalDate publishedDate;
    private String description;
    private Integer pageCount;
    private String thumbnailUrl;
    private String isbn;
    private List<String> categories;
    private Double averageRating;
    private Integer ratingsCount;
} 