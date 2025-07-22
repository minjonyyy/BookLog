package com.example.booklog.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "사용자명은 필수입니다")
    @Size(min = 2, max = 50, message = "사용자명은 2자 이상 50자 이하여야 합니다")
    @Schema(description = "사용자명", example = "user")
    private String username;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이어야 합니다")
    @Schema(description = "사용자 이메일", example = "user@example.com")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[!@#$%^&]).{8,}$"
            , message = "대문자, 숫자, 특수문자(!,@,#,$,%,^,&)를 최소 1개 이상 포함한 8자리 이상으로 입력해주세요.")
    @Size(min = 6, max = 100, message = "비밀번호는 6자 이상 100자 이하여야 합니다")
    @Schema(description = "비밀번호", example = "Password1!")
    private String password;
} 