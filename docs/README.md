# 📚 BookLog 프로젝트 문서

BookLog 프로젝트의 모든 기술 문서와 명세서를 모아놓은 폴더입니다.

## 📖 문서 목록

### 1. 📋 [프로젝트 명세서](./project-specification.md)
- **내용**: 프로젝트 개요, 기능 명세, API 설계, 개발 계획
- **작성일**: 2025-07-22
- **상태**: 완료 ✅

**주요 내용:**
- 3일 개발 계획
- 데이터베이스 스키마 설계 (DDL 포함)
- REST API 명세 (모든 엔드포인트)
- 기술 스택 정의
- 외부 API 연동 (Google Books API)

### 2. 🏗️ [프로젝트 아키텍처](./project-architecture.md)
- **내용**: 도메인 기반 아키텍처 구조, 설계 원칙, 리팩토링 히스토리
- **작성일**: 2025-07-22
- **상태**: 완료 ✅

**주요 내용:**
- 도메인 기반 프로젝트 구조
- 아키텍처 설계 원칙
- 도메인 간 의존성 관계
- 계층형 → 도메인 기반 리팩토링 과정
- 사용된 디자인 패턴

## 🎯 문서 사용 가이드

### 새로운 개발자를 위한 읽기 순서
1. **[프로젝트 명세서](./project-specification.md)** - 프로젝트 전체 이해
2. **[프로젝트 아키텍처](./project-architecture.md)** - 코드 구조 파악

### 개발 시 참고 자료
- **API 개발**: `project-specification.md`의 API 명세 참조
- **코드 구조**: `project-architecture.md`의 도메인 구조 참조
- **데이터베이스**: `project-specification.md`의 스키마 설계 참조

## 🚀 프로젝트 현황

### ✅ 완료된 작업 (백엔드)
- [x] **도메인 설계**: User, Book, UserBook, Review 엔티티
- [x] **인증 시스템**: JWT 기반 회원가입/로그인
- [x] **책 검색**: Google Books API 연동
- [x] **서재 관리**: 독서 상태, 진행률 계산
- [x] **리뷰 시스템**: 별점, 리뷰 작성/수정/삭제
- [x] **통계 기능**: 사용자별 독서 통계
- [x] **API 문서화**: Swagger/OpenAPI 3
- [x] **아키텍처 리팩토링**: 도메인 기반 구조로 전환

### 🔄 진행 예정 (프론트엔드)
- [ ] **React 프로젝트 설정**: TypeScript, Axios, 라우팅
- [ ] **UI 컴포넌트**: 로그인, 회원가입, 책 검색, 서재, 리뷰
- [ ] **상태 관리**: 사용자 인증, 데이터 관리
- [ ] **반응형 디자인**: 모바일/데스크톱 대응

### 🐳 배포 준비
- [ ] **Docker 설정**: Dockerfile, docker-compose.yml
- [ ] **AWS 배포**: EC2, RDS 설정

## 🔗 관련 링크

- **Swagger API 문서**: http://localhost:8080/swagger-ui/index.html
- **Google Books API**: https://developers.google.com/books/docs/v1/using
- **Spring Boot 3 문서**: https://docs.spring.io/spring-boot/

---

> 📅 **마지막 업데이트**: 2025-07-22  
> 👥 **관리자**: @minjonyyy  
> 📧 **문의**: 프로젝트 관련 문의는 이슈로 등록해주세요 