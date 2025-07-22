package com.example.booklog.domain.auth.service;

import com.example.booklog.domain.auth.dto.LoginRequest;
import com.example.booklog.domain.auth.dto.RegisterRequest;
import com.example.booklog.domain.auth.dto.AuthResponse;
import com.example.booklog.domain.user.entity.User;
import com.example.booklog.common.exception.CustomException;
import com.example.booklog.common.exception.ErrorCode;
import com.example.booklog.common.util.JwtUtil;
import com.example.booklog.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * 사용자 회원가입
     */
    public AuthResponse register(RegisterRequest request) {
        // 이메일 중복 체크
        userService.validateDuplicateEmail(request.getEmail());

        // 사용자명 중복 체크
        userService.validateDuplicateUsername(request.getUsername());

        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userService.saveUser(user);

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getUsername()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .message("회원가입이 완료되었습니다")
                .build();
    }

    /**
     * 사용자 로그인
     */
    public AuthResponse login(LoginRequest request) {
        try {
            // 인증 수행
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // 사용자 정보 조회
            User user = userService.findByEmail(request.getEmail());

            // JWT 토큰 생성
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getUsername()
            );

            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .message("로그인이 완료되었습니다")
                    .build();
                    
        } catch (BadCredentialsException e) {
            log.warn("Login failed for email: {}", request.getEmail());
            throw new CustomException(ErrorCode.INVALID_LOGIN_CREDENTIALS);
        } catch (Exception e) {
            log.error("Unexpected error during login for email: {}", request.getEmail(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
} 