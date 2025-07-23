package com.example.booklog.domain.book.controller;

import com.example.booklog.domain.book.dto.BookSearchResponse;
import com.example.booklog.domain.book.dto.BookDetailResponse;
import com.example.booklog.domain.book.service.GoogleBooksService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "책 검색 및 조회 API")
public class BookController {

    private final GoogleBooksService googleBooksService;

    @GetMapping("/search")
    @Operation(summary = "책 검색", description = "Google Books API를 통해 책을 검색합니다")
    public ResponseEntity<BookSearchResponse> searchBooks(
            @Parameter(description = "검색어 (제목, 저자)", required = true)
            @RequestParam String query,
            
            @Parameter(description = "페이지 번호 (0부터 시작)")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "페이지 크기")
            @RequestParam(defaultValue = "10") int size) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        BookSearchResponse response = googleBooksService.searchBooks(query.trim(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{googleBooksId}")
    @Operation(summary = "책 상세 정보 조회", description = "Google Books ID를 사용하여 특정 책의 상세 정보를 조회합니다.")
    public ResponseEntity<BookDetailResponse> getBookDetail(
            @Parameter(description = "Google Books API의 책 ID", required = true)
            @PathVariable String googleBooksId) {
        
        BookDetailResponse response = googleBooksService.getBookDetail(googleBooksId);
        return ResponseEntity.ok(response);
    }
} 