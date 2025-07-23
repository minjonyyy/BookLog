package com.example.booklog.domain.book.service;

import com.example.booklog.domain.book.dto.GoogleBooksApiResponse;
import com.example.booklog.domain.book.dto.BookSearchResponse;
import com.example.booklog.domain.book.dto.BookDetailResponse;
import com.example.booklog.common.exception.CustomException;
import com.example.booklog.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBooksService {

    private final WebClient webClient;

    @Value("${google.books.api.url}")
    private String googleBooksApiUrl;

    @Value("${google.books.api.key:}")
    private String apiKey;

    /**
     * Google Books API를 통한 책 검색
     */
    public BookSearchResponse searchBooks(String query, int page, int size) {
        try {
            int startIndex = page * size;
            
            String url = googleBooksApiUrl + "/volumes";
            
            Mono<GoogleBooksApiResponse> responseMono = webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder
                                .path(url.replace(googleBooksApiUrl, ""))
                                .queryParam("q", query)
                                .queryParam("startIndex", startIndex)
                                .queryParam("maxResults", size);
                        
                        if (apiKey != null && !apiKey.isEmpty()) {
                            uriBuilder.queryParam("key", apiKey);
                        }
                        
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .bodyToMono(GoogleBooksApiResponse.class);

            GoogleBooksApiResponse response = responseMono.block();
            
            if (response == null || response.getItems() == null) {
                return BookSearchResponse.builder()
                        .content(new ArrayList<>())
                        .totalElements(0)
                        .totalPages(0)
                        .page(page)
                        .size(size)
                        .build();
            }

            List<BookSearchResponse.BookSummary> books = response.getItems().stream()
                    .map(this::convertToBookSummary)
                    .collect(Collectors.toList());

            int totalElements = response.getTotalItems() != null ? response.getTotalItems() : 0;
            int totalPages = (int) Math.ceil((double) totalElements / size);

            return BookSearchResponse.builder()
                    .content(books)
                    .totalElements(totalElements)
                    .totalPages(totalPages)
                    .page(page)
                    .size(size)
                    .build();

        } catch (Exception e) {
            log.error("Error searching books from Google Books API: ", e);
            throw new CustomException(ErrorCode.GOOGLE_BOOKS_API_ERROR, e.getMessage());
        }
    }

    /**
     * Google Books API를 통한 책 상세 정보 조회
     */
    public BookDetailResponse getBookDetail(String googleBooksId) {
        try {
            String url = googleBooksApiUrl + "/volumes/" + googleBooksId;

            Mono<GoogleBooksApiResponse.GoogleBookItem> responseMono = webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path(url.replace(googleBooksApiUrl, ""));
                        if (apiKey != null && !apiKey.isEmpty()) {
                            uriBuilder.queryParam("key", apiKey);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .bodyToMono(GoogleBooksApiResponse.GoogleBookItem.class);

            GoogleBooksApiResponse.GoogleBookItem response = responseMono.block();

            if (response == null) {
                throw new CustomException(ErrorCode.BOOK_NOT_FOUND);
            }

            return convertToBookDetailResponse(response);

        } catch (Exception e) {
            log.error("Error fetching book detail from Google Books API for id {}: ", googleBooksId, e);
            throw new CustomException(ErrorCode.GOOGLE_BOOKS_API_ERROR, e.getMessage());
        }
    }
    
    /**
     * GoogleBookItem을 BookDetailResponse로 변환
     */
    private BookDetailResponse convertToBookDetailResponse(GoogleBooksApiResponse.GoogleBookItem item) {
        GoogleBooksApiResponse.GoogleBookItem.VolumeInfo volumeInfo = item.getVolumeInfo();

        if (volumeInfo == null) {
            // 필수 정보가 없는 경우에 대한 최소한의 응답
            return BookDetailResponse.builder()
                    .googleBooksId(item.getId())
                    .title("제목 정보 없음")
                    .authors(List.of("저자 정보 없음"))
                    .build();
        }

        return BookDetailResponse.builder()
                .googleBooksId(item.getId())
                .title(volumeInfo.getTitle())
                .authors(volumeInfo.getAuthors())
                .publisher(volumeInfo.getPublisher())
                .publishedDate(parsePublishedDate(volumeInfo.getPublishedDate()))
                .description(volumeInfo.getDescription())
                .pageCount(volumeInfo.getPageCount())
                .thumbnailUrl(getThumbnailUrl(volumeInfo.getImageLinks()))
                .isbn(getISBN(volumeInfo.getIndustryIdentifiers()))
                .categories(volumeInfo.getCategories())
                .averageRating(volumeInfo.getAverageRating())
                .ratingsCount(volumeInfo.getRatingsCount())
                .build();
    }

    /**
     * Google Books API 응답을 BookSummary로 변환
     */
    private BookSearchResponse.BookSummary convertToBookSummary(GoogleBooksApiResponse.GoogleBookItem item) {
        GoogleBooksApiResponse.GoogleBookItem.VolumeInfo volumeInfo = item.getVolumeInfo();
        
        if (volumeInfo == null) {
            return BookSearchResponse.BookSummary.builder()
                    .googleBooksId(item.getId())
                    .title("제목 없음")
                    .authors(List.of("작가 미상"))
                    .build();
        }

        return BookSearchResponse.BookSummary.builder()
                .googleBooksId(item.getId())
                .title(volumeInfo.getTitle() != null ? volumeInfo.getTitle() : "제목 없음")
                .authors(volumeInfo.getAuthors() != null ? volumeInfo.getAuthors() : List.of("작가 미상"))
                .publisher(volumeInfo.getPublisher())
                .publishedDate(parsePublishedDate(volumeInfo.getPublishedDate()))
                .description(volumeInfo.getDescription())
                .pageCount(volumeInfo.getPageCount())
                .thumbnailUrl(getThumbnailUrl(volumeInfo.getImageLinks()))
                .isbn(getISBN(volumeInfo.getIndustryIdentifiers()))
                .build();
    }

    /**
     * 출간일 파싱 (다양한 형식 지원)
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
        } catch (DateTimeParseException e) {
            log.warn("Cannot parse published date: {}", publishedDate);
        }
        
        return null;
    }

    /**
     * 썸네일 URL 추출
     */
    private String getThumbnailUrl(GoogleBooksApiResponse.GoogleBookItem.VolumeInfo.ImageLinks imageLinks) {
        if (imageLinks == null) {
            return null;
        }
        
        // thumbnail을 우선적으로 사용, 없으면 smallThumbnail 사용
        if (imageLinks.getThumbnail() != null) {
            return imageLinks.getThumbnail().replace("http://", "https://");
        } else if (imageLinks.getSmallThumbnail() != null) {
            return imageLinks.getSmallThumbnail().replace("http://", "https://");
        }
        
        return null;
    }

    /**
     * ISBN 추출 (ISBN_13을 우선적으로, 없으면 ISBN_10 사용)
     */
    private String getISBN(List<GoogleBooksApiResponse.GoogleBookItem.VolumeInfo.IndustryIdentifier> identifiers) {
        if (identifiers == null || identifiers.isEmpty()) {
            return null;
        }

        // ISBN_13을 우선적으로 찾기
        for (GoogleBooksApiResponse.GoogleBookItem.VolumeInfo.IndustryIdentifier identifier : identifiers) {
            if ("ISBN_13".equals(identifier.getType())) {
                return identifier.getIdentifier();
            }
        }

        // ISBN_10 찾기
        for (GoogleBooksApiResponse.GoogleBookItem.VolumeInfo.IndustryIdentifier identifier : identifiers) {
            if ("ISBN_10".equals(identifier.getType())) {
                return identifier.getIdentifier();
            }
        }

        return null;
    }
} 