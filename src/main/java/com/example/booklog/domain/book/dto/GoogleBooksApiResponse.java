package com.example.booklog.domain.book.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleBooksApiResponse {

    private String kind;
    private Integer totalItems;
    private List<GoogleBookItem> items;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GoogleBookItem {
        private String id;
        private VolumeInfo volumeInfo;

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class VolumeInfo {
            private String title;
            private List<String> authors;
            private String publisher;
            private String publishedDate;
            private String description;
            private Integer pageCount;
            private List<String> categories;
            private Double averageRating;
            private Integer ratingsCount;
            private ImageLinks imageLinks;
            private List<IndustryIdentifier> industryIdentifiers;

            @Getter
            @NoArgsConstructor
            @AllArgsConstructor
            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class ImageLinks {
                private String smallThumbnail;
                private String thumbnail;
            }

            @Getter
            @NoArgsConstructor
            @AllArgsConstructor
            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class IndustryIdentifier {
                private String type;
                private String identifier;
            }
        }
    }
} 