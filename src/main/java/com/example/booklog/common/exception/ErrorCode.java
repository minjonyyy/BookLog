package com.example.booklog.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // 공통 에러
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "COMMON_001", "잘못된 입력값입니다"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "COMMON_002", "잘못된 타입입니다"),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON_003", "엔티티를 찾을 수 없습니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_004", "서버 오류가 발생했습니다"),
    
    // 인증 관련 에러
    INVALID_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_001", "유효하지 않은 JWT 토큰입니다"),
    EXPIRED_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_002", "만료된 JWT 토큰입니다"),
    INVALID_LOGIN_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AUTH_003", "이메일 또는 비밀번호가 올바르지 않습니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH_004", "접근 권한이 없습니다"),
    
    // 사용자 관련 에러
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "사용자를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "USER_002", "이미 존재하는 이메일입니다"),
    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "USER_003", "이미 존재하는 사용자명입니다"),
    
    // 책 관련 에러
    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "BOOK_001", "책을 찾을 수 없습니다"),
    GOOGLE_BOOKS_API_ERROR(HttpStatus.BAD_GATEWAY, "BOOK_002", "Google Books API 오류가 발생했습니다"),
    
    // 독서 기록 관련 에러
    USER_BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_BOOK_001", "독서 기록을 찾을 수 없습니다"),
    DUPLICATE_USER_BOOK(HttpStatus.CONFLICT, "USER_BOOK_002", "이미 등록된 책입니다"),
    INVALID_PAGE_NUMBER(HttpStatus.BAD_REQUEST, "USER_BOOK_003", "잘못된 페이지 번호입니다"),
    
    // 리뷰 관련 에러
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "REVIEW_001", "리뷰를 찾을 수 없습니다"),
    DUPLICATE_REVIEW(HttpStatus.CONFLICT, "REVIEW_002", "이미 작성한 리뷰가 있습니다"),
    INVALID_RATING(HttpStatus.BAD_REQUEST, "REVIEW_003", "평점은 1~5 사이의 값이어야 합니다"),
    REVIEW_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "REVIEW_004", "리뷰 수정/삭제 권한이 없습니다");
    
    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
} 