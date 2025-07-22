package com.example.booklog.domain.userbook.dto;

import com.example.booklog.domain.userbook.entity.UserBook;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookUpdateRequest {

    private UserBook.ReadingStatus status;

    @Min(value = 0, message = "현재 페이지는 0 이상이어야 합니다")
    private Integer currentPage;

    @Size(max = 1000, message = "메모는 1000자 이하여야 합니다")
    private String memo;
} 