# 📘 BookLog - 나만의 책 기록 & 리뷰 공유 서비스

## 🎯 프로젝트 개요

BookLog는 사용자가 읽은 책을 기록하고, 독서 진행률을 관리하며, 다른 사용자들과 리뷰를 공유할 수 있는 웹 서비스입니다.

## 🛠️ 기술 스택

### 백엔드
- **Java 17**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **Spring WebClient** (Google Books API 연동)
- **Spring Security** (인증/인가)
- **Spring Validation**

### 데이터베이스
- **MySQL 8.0**

### 프론트엔드
- **React 18**
- **TypeScript**
- **Axios** (API 통신)

### 배포 & 인프라
- **Docker**
- **AWS (EC2, RDS)**

### 문서화
- **Swagger/OpenAPI 3**

### 외부 API
- **Google Books API**

## 🗄️ 데이터베이스 설계

### 📋 테이블 구조

#### 1. users (사용자)
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. books (책 정보)
```sql
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    google_books_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    authors TEXT,
    publisher VARCHAR(200),
    published_date DATE,
    description TEXT,
    page_count INT,
    thumbnail_url VARCHAR(500),
    isbn VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. user_books (사용자-책 관계)
```sql
CREATE TABLE user_books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    status ENUM('READING', 'COMPLETED', 'WANT_TO_READ') NOT NULL,
    current_page INT DEFAULT 0,
    memo TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id)
);
```

#### 4. reviews (리뷰)
```sql
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    one_line_review VARCHAR(200),
    detailed_review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book_review (user_id, book_id)
);
```

## 🚀 API 명세서

### 📌 Base URL
```
http://localhost:8080/api/v1
```

### 🔐 인증
- JWT 기반 인증
- Authorization Header: `Bearer {token}`

---

### 👤 사용자 관리

#### POST /auth/register
**사용자 회원가입**

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

#### POST /auth/login
**사용자 로그인**

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_string",
  "userId": 1,
  "username": "string"
}
```

---

### 📚 책 검색

#### GET /books/search
**Google Books API를 통한 책 검색**

**Query Parameters:**
- `query` (required): 검색어 (제목, 저자)
- `page` (optional, default=0): 페이지 번호
- `size` (optional, default=10): 페이지 크기

**Response (200):**
```json
{
  "content": [
    {
      "googleBooksId": "string",
      "title": "string",
      "authors": ["string"],
      "publisher": "string",
      "publishedDate": "2023-01-01",
      "description": "string",
      "pageCount": 300,
      "thumbnailUrl": "string",
      "isbn": "string"
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "page": 0,
  "size": 10
}
```

#### GET /books/{googleBooksId}
**특정 책 상세 정보 조회**

**Response (200):**
```json
{
  "id": 1,
  "googleBooksId": "string",
  "title": "string",
  "authors": ["string"],
  "publisher": "string",
  "publishedDate": "2023-01-01",
  "description": "string",
  "pageCount": 300,
  "thumbnailUrl": "string",
  "isbn": "string",
  "averageRating": 4.2,
  "reviewCount": 15
}
```

---

### 📖 독서 상태 관리

#### POST /user-books
**책을 내 서재에 추가**

**Request Body:**
```json
{
  "googleBooksId": "string",
  "status": "READING",
  "currentPage": 0,
  "memo": "string"
}
```

**Response (201):**
```json
{
  "id": 1,
  "book": {
    "id": 1,
    "title": "string",
    "authors": ["string"],
    "pageCount": 300,
    "thumbnailUrl": "string"
  },
  "status": "READING",
  "currentPage": 0,
  "progress": 0.0,
  "memo": "string",
  "startedAt": "2023-01-01T00:00:00Z",
  "completedAt": null
}
```

#### GET /user-books
**내 서재 목록 조회**

**Query Parameters:**
- `status` (optional): READING, COMPLETED, WANT_TO_READ
- `page` (optional, default=0): 페이지 번호
- `size` (optional, default=10): 페이지 크기

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "book": {
        "id": 1,
        "title": "string",
        "authors": ["string"],
        "pageCount": 300,
        "thumbnailUrl": "string"
      },
      "status": "READING",
      "currentPage": 150,
      "progress": 50.0,
      "memo": "string",
      "startedAt": "2023-01-01T00:00:00Z",
      "completedAt": null
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

#### PUT /user-books/{id}
**독서 상태 업데이트**

**Request Body:**
```json
{
  "status": "COMPLETED",
  "currentPage": 300,
  "memo": "정말 좋은 책이었다!"
}
```

**Response (200):**
```json
{
  "id": 1,
  "book": {
    "id": 1,
    "title": "string",
    "authors": ["string"],
    "pageCount": 300,
    "thumbnailUrl": "string"
  },
  "status": "COMPLETED",
  "currentPage": 300,
  "progress": 100.0,
  "memo": "정말 좋은 책이었다!",
  "startedAt": "2023-01-01T00:00:00Z",
  "completedAt": "2023-01-15T00:00:00Z"
}
```

#### DELETE /user-books/{id}
**서재에서 책 제거**

**Response (204):** No Content

---

### ⭐ 리뷰 관리

#### POST /reviews
**리뷰 작성**

**Request Body:**
```json
{
  "bookId": 1,
  "rating": 5,
  "oneLineReview": "정말 재미있는 책!",
  "detailedReview": "이 책은 정말로 감동적이었습니다..."
}
```

**Response (201):**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "string"
  },
  "book": {
    "id": 1,
    "title": "string",
    "authors": ["string"],
    "thumbnailUrl": "string"
  },
  "rating": 5,
  "oneLineReview": "정말 재미있는 책!",
  "detailedReview": "이 책은 정말로 감동적이었습니다...",
  "createdAt": "2023-01-15T00:00:00Z"
}
```

#### GET /reviews/book/{bookId}
**특정 책의 리뷰 목록 조회**

**Query Parameters:**
- `page` (optional, default=0): 페이지 번호
- `size` (optional, default=10): 페이지 크기
- `sort` (optional, default=latest): latest, rating_desc, rating_asc

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "string"
      },
      "rating": 5,
      "oneLineReview": "정말 재미있는 책!",
      "detailedReview": "이 책은 정말로 감동적이었습니다...",
      "createdAt": "2023-01-15T00:00:00Z"
    }
  ],
  "totalElements": 20,
  "totalPages": 2,
  "page": 0,
  "size": 10
}
```

#### GET /reviews/user/{userId}
**특정 사용자의 리뷰 목록 조회**

**Query Parameters:**
- `page` (optional, default=0): 페이지 번호
- `size` (optional, default=10): 페이지 크기

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "book": {
        "id": 1,
        "title": "string",
        "authors": ["string"],
        "thumbnailUrl": "string"
      },
      "rating": 5,
      "oneLineReview": "정말 재미있는 책!",
      "detailedReview": "이 책은 정말로 감동적이었습니다...",
      "createdAt": "2023-01-15T00:00:00Z"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

#### PUT /reviews/{id}
**리뷰 수정**

**Request Body:**
```json
{
  "rating": 4,
  "oneLineReview": "괜찮은 책",
  "detailedReview": "다시 읽어보니 조금 아쉬운 부분이..."
}
```

**Response (200):**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "string"
  },
  "book": {
    "id": 1,
    "title": "string",
    "authors": ["string"],
    "thumbnailUrl": "string"
  },
  "rating": 4,
  "oneLineReview": "괜찮은 책",
  "detailedReview": "다시 읽어보니 조금 아쉬운 부분이...",
  "createdAt": "2023-01-15T00:00:00Z",
  "updatedAt": "2023-01-20T00:00:00Z"
}
```

#### DELETE /reviews/{id}
**리뷰 삭제**

**Response (204):** No Content

---

## 📊 통계 API

#### GET /stats/dashboard
**사용자 대시보드 통계**

**Response (200):**
```json
{
  "totalBooks": 25,
  "readingBooks": 3,
  "completedBooks": 20,
  "wantToReadBooks": 2,
  "totalReviews": 18,
  "averageRating": 4.2,
  "totalPagesRead": 5000,
  "readingStreak": 7
}
```

---

## 🗂️ 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "timestamp": "2023-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "상세 에러 메시지",
  "path": "/api/v1/books"
}
```

### 공통 에러 코드
- `400 Bad Request`: 잘못된 요청 데이터
- `401 Unauthorized`: 인증되지 않은 사용자
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `409 Conflict`: 데이터 충돌 (중복 등록 등)
- `500 Internal Server Error`: 서버 내부 오류

---

## 📅 3일간 개발 계획

### 🗓️ Day 1 (첫째 날) - 백엔드 기초 구조
**목표: 프로젝트 기본 설정 및 핵심 도메인 구현**

#### 오전 (4시간)
- [x] 프로젝트 설정 및 dependency 추가
  - Spring Boot, JPA, MySQL, Security, Validation
  - Swagger, WebClient 설정
- [x] 데이터베이스 설계 및 Entity 구현
  - User, Book, UserBook, Review Entity
  - Repository 인터페이스 생성
- [x] MySQL 연결 설정 및 테스트

#### 오후 (4시간)
- [x] 사용자 인증 시스템 구현
  - JWT 기반 인증/인가
  - UserController (회원가입, 로그인)
  - Spring Security 설정
- [x] Google Books API 연동 서비스 구현
  - WebClient 설정
  - BookSearchService 구현
  - 외부 API 응답 DTO 매핑

### 🗓️ Day 2 (둘째 날) - 핵심 기능 구현
**목표: 책 관리 및 리뷰 시스템 완성**

#### 오전 (4시간)
- [x] 책 검색 및 상세 조회 API
  - BookController 구현
  - 검색 결과 페이징 처리
  - 책 정보 저장 로직
- [x] 독서 상태 관리 API
  - UserBookController 구현
  - 독서 진행률 계산 로직
  - 상태 변경 및 메모 기능

#### 오후 (4시간)
- [x] 리뷰 시스템 구현
  - ReviewController 구현
  - 리뷰 CRUD 기능
  - 정렬 및 페이징 기능
- [x] 통계 API 구현
  - 사용자 대시보드 데이터
- [x] API 문서화 (Swagger)

### 🗓️ Day 3 (셋째 날) - 프론트엔드 및 배포
**목표: React 프론트엔드 구현 및 서비스 배포**

#### 오전 (4시간)
- [x] React 프로젝트 설정
  - TypeScript, Axios 설정
  - 라우팅 구조 설계
- [x] 주요 컴포넌트 구현
  - 로그인/회원가입 페이지
  - 책 검색 및 결과 표시
  - 내 서재 페이지

#### 오후 (4시간)
- [x] 리뷰 기능 UI 구현
  - 리뷰 작성/수정 폼
  - 리뷰 목록 표시
  - 평점 표시 컴포넌트
- [x] 대시보드 구현
- [x] Docker 설정 및 배포 준비
  - Dockerfile 작성
  - docker-compose.yml 구성
- [x] AWS 배포 (시간 허용시)

---

## 🎯 성공 기준

### 기본 요구사항 (Must Have)
- [x] 사용자 회원가입/로그인
- [x] Google Books API를 통한 책 검색
- [x] 독서 상태 관리 (읽는 중/완료/예정)
- [x] 독서 진행률 계산
- [x] 리뷰 작성 및 조회
- [x] 리뷰 정렬 (최신순/평점순)

### 추가 기능 (Nice to Have)
- [ ] 독서 통계 대시보드
- [ ] 독서 목표 설정
- [ ] 책 추천 기능
- [ ] 소셜 기능 (팔로우/언팔로우)
- [ ] 독서 기록 공유

---

## 🔧 개발 환경 설정

### 로컬 개발 환경
```bash
# MySQL 설치 및 실행 (Docker)
docker run -d --name booklog-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=booklog \
  -p 3306:3306 \
  mysql:8.0

# 애플리케이션 실행
./gradlew bootRun
```

### 환경 변수 설정
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/booklog
spring.datasource.username=root
spring.datasource.password=root

# Google Books API
google.books.api.key=YOUR_API_KEY
google.books.api.url=https://www.googleapis.com/books/v1

# JWT 설정
jwt.secret=your-secret-key
jwt.expiration=86400000
```

---

## 📝 참고사항

1. **Google Books API 제한사항**
   - 일일 1,000회 무료 요청
   - 키 없이도 제한적 사용 가능

2. **보안 고려사항**
   - 패스워드 암호화 (BCrypt)
   - JWT 토큰 보안
   - SQL Injection 방지

3. **성능 최적화**
   - JPA 지연 로딩 활용
   - 페이징 처리
   - 인덱스 설정

4. **테스트 전략**
   - 단위 테스트 (Service 레이어)
   - 통합 테스트 (Repository 레이어)
   - API 테스트 (Controller 레이어) 