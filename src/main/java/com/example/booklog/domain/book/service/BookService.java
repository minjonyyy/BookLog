package com.example.booklog.domain.book.service;

import com.example.booklog.domain.book.dto.BookSearchResponse;
import com.example.booklog.domain.book.entity.Book;
import com.example.booklog.common.exception.CustomException;
import com.example.booklog.common.exception.ErrorCode;
import com.example.booklog.domain.book.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class BookService {

    private final BookRepository bookRepository;

    /**
     * Google Books ID로 책 조회 (없으면 생성)
     */
    @Transactional
    public Book findOrCreateBook(BookSearchResponse.BookSummary bookSummary) {
        Optional<Book> existingBook = bookRepository.findByGoogleBooksId(bookSummary.getGoogleBooksId());
        
        if (existingBook.isPresent()) {
            return existingBook.get();
        }

        // 새 책 생성
        Book newBook = Book.builder()
                .googleBooksId(bookSummary.getGoogleBooksId())
                .title(bookSummary.getTitle())
                .authors(bookSummary.getAuthors() != null ? String.join(", ", bookSummary.getAuthors()) : null)
                .publisher(bookSummary.getPublisher())
                .publishedDate(bookSummary.getPublishedDate())
                .description(bookSummary.getDescription())
                .pageCount(bookSummary.getPageCount())
                .thumbnailUrl(bookSummary.getThumbnailUrl())
                .isbn(bookSummary.getIsbn())
                .build();

        return bookRepository.save(newBook);
    }

    /**
     * Google Books ID로 책 조회
     */
    public Book findByGoogleBooksId(String googleBooksId) {
        return bookRepository.findByGoogleBooksId(googleBooksId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOK_NOT_FOUND));
    }

    /**
     * ID로 책 조회
     */
    public Book findById(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOK_NOT_FOUND));
    }

    /**
     * 책 정보 업데이트
     */
    @Transactional
    public Book updateBookInfo(String googleBooksId, BookSearchResponse.BookSummary bookSummary) {
        Book book = findByGoogleBooksId(googleBooksId);
        
        book.updateBookInfo(
                bookSummary.getTitle(),
                bookSummary.getAuthors() != null ? String.join(", ", bookSummary.getAuthors()) : null,
                bookSummary.getPublisher(),
                bookSummary.getPublishedDate(),
                bookSummary.getDescription(),
                bookSummary.getPageCount(),
                bookSummary.getThumbnailUrl(),
                bookSummary.getIsbn()
        );

        return book;
    }
} 