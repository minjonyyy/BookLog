package com.example.booklog.domain.userbook.service;

import com.example.booklog.domain.book.dto.BookSearchResponse;
import com.example.booklog.domain.book.entity.Book;
import com.example.booklog.domain.user.entity.User;
import com.example.booklog.domain.userbook.entity.UserBook;
import com.example.booklog.common.exception.CustomException;
import com.example.booklog.common.exception.ErrorCode;
import com.example.booklog.domain.userbook.repository.UserBookRepository;
import com.example.booklog.domain.book.service.BookService;
import com.example.booklog.domain.user.service.UserService;
import com.example.booklog.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserBookService {

    private final UserBookRepository userBookRepository;
    private final BookService bookService;
    private final UserService userService;
    private final ReviewRepository reviewRepository;

    /**
     * 사용자의 서재에 책 추가
     */
    @Transactional
    public UserBook addBookToLibrary(Long userId, String googleBooksId, UserBook.ReadingStatus status, 
                                   Integer currentPage, String memo, BookSearchResponse.BookSummary bookSummary) {
        
        User user = userService.findById(userId);
        Book book = bookService.findOrCreateBook(bookSummary);

        // 중복 체크
        if (userBookRepository.existsByUserIdAndBookId(userId, book.getId())) {
            throw new CustomException(ErrorCode.DUPLICATE_USER_BOOK);
        }

        // UserBook 생성
        UserBook userBook = UserBook.builder()
                .user(user)
                .book(book)
                .status(status)
                .currentPage(currentPage != null ? currentPage : 0)
                .memo(memo)
                .build();

        // 상태에 따른 추가 처리
        userBook.updateStatus(status);

        return userBookRepository.save(userBook);
    }

    /**
     * 사용자의 독서 기록 조회 (상태별 필터링)
     */
    public Page<UserBook> getUserBooks(Long userId, UserBook.ReadingStatus status, Pageable pageable) {
        if (status != null) {
            return userBookRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        return userBookRepository.findByUserId(userId, pageable);
    }

    /**
     * 독서 상태 업데이트
     */
    @Transactional
    public UserBook updateUserBook(Long userId, Long userBookId, UserBook.ReadingStatus status, 
                                 Integer currentPage, String memo) {
        
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_BOOK_NOT_FOUND));

        // 소유자 확인
        if (!userBook.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        // 현재 페이지 유효성 검사
        if (currentPage != null) {
            validateCurrentPage(currentPage, userBook.getBook().getPageCount());
            userBook.updateCurrentPage(currentPage);
        }

        // 상태 업데이트
        if (status != null) {
            userBook.updateStatus(status);
        }

        // 메모 업데이트
        if (memo != null) {
            userBook.updateMemo(memo);
        }

        return userBook;
    }

    /**
     * 서재에서 책 제거
     */
    @Transactional
    public void removeBookFromLibrary(Long userId, Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_BOOK_NOT_FOUND));

        // 소유자 확인
        if (!userBook.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        // 연관된 리뷰가 있는지 확인하고 삭제
        boolean hasReview = reviewRepository.existsByUserIdAndBookId(userId, userBook.getBook().getId());
        if (hasReview) {
            log.info("사용자 {}의 책 {} 관련 리뷰를 삭제합니다.", userId, userBook.getBook().getId());
            reviewRepository.deleteByUserIdAndBookId(userId, userBook.getBook().getId());
        }

        // UserBook 삭제
        userBookRepository.delete(userBook);
        log.info("사용자 {}의 서재에서 책 {}을(를) 제거했습니다.", userId, userBook.getBook().getTitle());
    }

    /**
     * 사용자의 특정 책 독서 기록 조회
     */
    public UserBook getUserBook(Long userId, Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_BOOK_NOT_FOUND));

        // 소유자 확인
        if (!userBook.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        return userBook;
    }

    /**
     * 현재 페이지 유효성 검사
     */
    private void validateCurrentPage(Integer currentPage, Integer totalPages) {
        if (currentPage < 0) {
            throw new CustomException(ErrorCode.INVALID_PAGE_NUMBER, "현재 페이지는 0보다 작을 수 없습니다.");
        }

        if (totalPages != null && currentPage > totalPages) {
            throw new CustomException(ErrorCode.INVALID_PAGE_NUMBER, 
                    String.format("현재 페이지(%d)는 전체 페이지(%d)를 초과할 수 없습니다.", currentPage, totalPages));
        }
    }
} 