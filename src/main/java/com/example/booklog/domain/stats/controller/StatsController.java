package com.example.booklog.domain.stats.controller;

import com.example.booklog.domain.stats.dto.UserStatsResponse;
import com.example.booklog.domain.user.service.CustomUserDetails;
import com.example.booklog.domain.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "통계 정보 API")
public class StatsController {

    private final StatsService statsService;

    /**
     * 사용자 통계 정보 조회
     */
    @GetMapping("/my")
    @Operation(summary = "내 통계 조회", description = "사용자의 독서 통계 정보를 조회합니다")
    public ResponseEntity<UserStatsResponse> getMyStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UserStatsResponse stats = statsService.getUserStats(userDetails.getUserId());
        return ResponseEntity.ok(stats);
    }
} 