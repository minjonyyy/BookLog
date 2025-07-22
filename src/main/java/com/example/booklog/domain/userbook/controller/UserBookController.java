package com.example.booklog.domain.userbook.controller;

import com.example.booklog.domain.userbook.dto.UserBookRequest;
import com.example.booklog.domain.userbook.dto.UserBookUpdateRequest;
import com.example.booklog.domain.book.dto.BookSearchResponse;
import com.example.booklog.domain.userbook.dto.UserBookResponse;
import com.example.booklog.domain.userbook.entity.UserBook;
import com.example.booklog.domain.user.service.CustomUserDetails;
import com.example.booklog.domain.userbook.service.UserBookService;
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

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/user-books")
@RequiredArgsConstructor
@Tag(name = "UserBook", description = "독서 상태 관리 API")
public class UserBookController {

    private final UserBookService userBookService;

    /**
     * 내 서재에 책 추가
     */
    @PostMapping
    @Operation(summary = "서재에 책 추가", description = "사용자의 서재에 책을 추가합니다")
    public ResponseEntity<UserBookResponse> addBookToLibrary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserBookRequest request) {

        // BookSearchResponse.BookSummary 생성 (책 정보가 DB에 없을 경우 생성용)
        BookSearchResponse.BookSummary bookSummary = BookSearchResponse.BookSummary.builder()
                .googleBooksId(request.getGoogleBooksId())
                .title(request.getTitle())
                .authors(request.getAuthors() != null ? java.util.Arrays.asList(request.getAuthors()) : null)
                .publisher(request.getPublisher())
                .publishedDate(parsePublishedDate(request.getPublishedDate()))
                .description(request.getDescription())
                .pageCount(request.getPageCount())
                .thumbnailUrl(request.getThumbnailUrl())
                .isbn(request.getIsbn())
                .build();

        UserBook userBook = userBookService.addBookToLibrary(
                userDetails.getUserId(),
                request.getGoogleBooksId(),
                request.getStatus(),
                request.getCurrentPage(),
                request.getMemo(),
                bookSummary
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserBookResponse.from(userBook));
    }

    /**
     * 내 서재 책 목록 조회
     */
    @GetMapping
    @Operation(summary = "내 서재 조회", description = "사용자의 서재 목록을 조회합니다")
    public ResponseEntity<Page<UserBookResponse>> getUserBooks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "독서 상태 필터") @RequestParam(required = false) UserBook.ReadingStatus status,
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 기준") @RequestParam(defaultValue = "updatedAt") String sort,
            @Parameter(description = "정렬 방향") @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<UserBook> userBooks = userBookService.getUserBooks(
                userDetails.getUserId(), status, pageable);

        Page<UserBookResponse> response = userBooks.map(UserBookResponse::from);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 서재 책 상세 조회
     */
    @GetMapping("/{userBookId}")
    @Operation(summary = "서재 책 상세 조회", description = "서재의 특정 책 상세 정보를 조회합니다")
    public ResponseEntity<UserBookResponse> getUserBook(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userBookId) {

        UserBook userBook = userBookService.getUserBook(userDetails.getUserId(), userBookId);
        return ResponseEntity.ok(UserBookResponse.from(userBook));
    }

    /**
     * 독서 상태 및 진행률 업데이트
     */
    @PutMapping("/{userBookId}")
    @Operation(summary = "독서 상태 업데이트", description = "독서 상태, 현재 페이지, 메모를 업데이트합니다")
    public ResponseEntity<UserBookResponse> updateUserBook(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userBookId,
            @Valid @RequestBody UserBookUpdateRequest request) {

        UserBook userBook = userBookService.updateUserBook(
                userDetails.getUserId(),
                userBookId,
                request.getStatus(),
                request.getCurrentPage(),
                request.getMemo()
        );

        return ResponseEntity.ok(UserBookResponse.from(userBook));
    }

    /**
     * 서재에서 책 제거
     */
    @DeleteMapping("/{userBookId}")
    @Operation(summary = "서재에서 책 제거", description = "서재에서 책을 제거합니다")
    public ResponseEntity<Void> removeBookFromLibrary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userBookId) {

        userBookService.removeBookFromLibrary(userDetails.getUserId(), userBookId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 출간일 파싱 (String -> LocalDate)
     */
    private LocalDate parsePublishedDate(String publishedDate) {
        if (publishedDate == null || publishedDate.trim().isEmpty()) {
            return null;
        }

        try {
            // YYYY-MM-DD 형식
            if (publishedDate.matches("\\d{4}-\\d{2}-\\d{2}")) {
                return LocalDate.parse(publishedDate);
            }
            // YYYY-MM 형식
            else if (publishedDate.matches("\\d{4}-\\d{2}")) {
                return LocalDate.parse(publishedDate + "-01");
            }
            // YYYY 형식
            else if (publishedDate.matches("\\d{4}")) {
                return LocalDate.parse(publishedDate + "-01-01");
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
} 