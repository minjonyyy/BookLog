package com.example.booklog.domain.book.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class GoogleBooksApiResponse {

    private String kind;
    private Integer totalItems;
    private List<GoogleBookItem> items;

    @Getter
    @NoArgsConstructor
    public static class GoogleBookItem {
        private String id;
        private VolumeInfo volumeInfo;

        @Getter
        @NoArgsConstructor
        public static class VolumeInfo {
            private String title;
            private List<String> authors;
            private String publisher;
            private String publishedDate;
            private String description;
            private Integer pageCount;
            private List<String> categories;
            private ImageLinks imageLinks;
            private List<IndustryIdentifier> industryIdentifiers;

            @Getter
            @NoArgsConstructor
            public static class ImageLinks {
                private String smallThumbnail;
                private String thumbnail;
            }

            @Getter
            @NoArgsConstructor
            public static class IndustryIdentifier {
                private String type;
                private String identifier;
            }
        }
    }
} 