# 한국사능력검정시험 학습 플랫폼 서비스 기획 및 API·DB 명세서

본 문서는 한국사능력검정시험 대비를 위한 풀스택(Next.js) 웹 서비스의 상세 기획서입니다. 견고한 아키텍처와 상세한 API 명세, 데이터베이스 스키마를 포함하여 백엔드 중심의 체계적인 개발이 가능하도록 설계되었습니다.

---

## 1. 시스템 아키텍처 및 인프라

| 구분         | 기술 스택                                                             | 포트 (Port) | 비고                                    |
| :----------- | :-------------------------------------------------------------------- | :---------- | :-------------------------------------- |
| **Frontend**| Next.js (React)                                                       | `11000`     | 사용자 및 관리자 UI (SSR/CSR 혼합)      |
|**Backend**| Next.js (API Routes) 또는 NestJS, typeORM, Express.js, PostgreSQL 15+ | `55500`     | 메인 RDBMS, 관계형 데이터 저장          |
|**Infra**| Docker Compose                                                        | -           | FE, BE, DB 통합 컨테이너 오케스트레이션 |

---

## 2. 사용자 및 권한 관리 정책

-**인증 방식:** JWT (Access Token & Refresh Token)
-**Role 체계:**`general` (일반 사용자), `admin` (관리자)
-**관리자 생성 정책:** 최초 `admin` 계정은 DB 초기화 시 시드(Seed) 데이터 또는 직접 SQL `INSERT`를 통해 생성. 이후 관리자 콘솔에서 기존 `general` 유저에게 권한을 부여하거나 신규 관리자 생성 가능.

---

## 3. 데이터베이스 스키마 상세 및 ERD

### 3.1. Entity Relationship Diagram (ERD)

```text
+-------------------+       +-----------------------+       +-------------------+
|       users       |       |  user_exam_results    |       |      exams        |
+-------------------+       +-----------------------+       +-------------------+
| id (PK)           |<------| user_id (FK)          |   +-->| id (PK)           |
| email             |       | exam_id (FK)          |---+   | round_number      |
| password_hash     |       | score                 |       | level             |
| role              |       | submitted_at          |       | pdf_file_path     |
| created_at        |       +-----------------------+       +-------------------+
+-------------------+                                                 |
                                                                      | 1:N
+-------------------+                                                 v
|     materials     |                                       +-------------------+
+-------------------+                                       |     questions     |
| id (PK)           |                                       +-------------------+
| category          |                                       | id (PK)           |
| title             |                                       | exam_id (FK)      |
| content_url       |                                       | question_number   |
| file_path         |                                       | content_text      |
| created_at        |                                       | image_url         |
+-------------------+                                       | answer            |
                                                            | explanation       |
                                                            +-------------------+
```

### 3.2. 테이블 상세 명세 **1. users (사용자 정보)**- `id` (UUID, PK): 고유 식별자
- `email` (VARCHAR, Unique): 로그인 아이디 (이메일)
- `password_hash` (VARCHAR): 암호화된 비밀번호
- `role` (VARCHAR): 'general' 또는 'admin' (Default: 'general')
- `created_at` (TIMESTAMP): 가입 일시 **2. materials (학습 자료 - 공식, 미디어, 요약본)**- `id` (UUID, PK)
- `category` (VARCHAR): 'official', 'media', 'summary'
- `title` (VARCHAR): 자료 제목 (예: "65회 최태성 해설 강의", "조선시대 왕 계보도 요약")
- `content_url` (VARCHAR, Nullable): 외부 링크 (유튜브 URL, 우리역사넷 링크 등)
- `file_path` (VARCHAR, Nullable): 내부 스토리지에 저장된 파일 경로 (PDF, HWP 등)
- `created_at` (TIMESTAMP)**3. exams (기출문제 회차 정보)**- `id` (UUID, PK)
- `round_number` (INT): 회차 (예: 66, 67)
- `level` (VARCHAR): 등급 ('심화', '기본')
- `pdf_file_path` (VARCHAR, Nullable): 원본 문제지 PDF 다운로드 경로 **4. questions (개별 기출 문항)**- `id` (UUID, PK)
- `exam_id` (UUID, FK -> exams.id)
- `question_number` (INT): 문항 번호 (1~50)
- `content_text` (TEXT, Nullable): 문제 본문 및 사료 텍스트 (검색 및 파싱용)
- `image_url` (VARCHAR, Nullable): 문제 내 이미지/사료 캡처 경로
- `answer` (INT): 정답 번호 (1~5)
- `explanation` (TEXT, Nullable): 문항 해설 **5. user_exam_results (사용자 기출 풀이 결과)**- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id)
- `exam_id` (UUID, FK -> exams.id)
- `score` (INT): 획득 점수
- `submitted_at` (TIMESTAMP): 제출(풀이 완료) 일시

---

## 4. API 명세서 (RESTful API)

### 4.1. 인증 (Auth)**[POST] `/api/auth/login`**-** Description:**사용자 로그인 및 JWT 발급
-**Request Body:**```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
-**Response (200 OK):**```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "role": "general"
    }
  }
  ```**[POST] `/api/auth/register`**-** Description:**신규 회원 가입 (기본 role: general)
-**Request Body:**```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
-**Response (201 Created):**```json
  {
    "message": "User successfully registered.",
    "userId": "uuid-string"
  }
  ```

### 4.2. 학습 자료 (Materials)**[GET] `/api/materials`**-** Description:**카테고리별 학습 자료 목록 조회
-**Query Params:**`category` (optional, ex: `?category=summary`), `page`, `limit`
-**Response (200 OK):**```json
  {
    "data": [
      {
        "id": "uuid-string",
        "category": "summary",
        "title": "조선시대 문화재 암기 요약본",
        "fileUrl": "http://localhost:20000/uploads/materials/joseon.pdf",
        "createdAt": "2026-05-11T10:00:00Z"
      }
    ],
    "meta": { "total": 45, "page": 1 }
  }
  ```

### 4.3. 기출문제 및 풀이 (Exams & CBT)**[GET] `/api/exams`**-** Description:**기출문제 회차 목록 조회
-**Response (200 OK):**```json
  {
    "data": [
      {
        "id": "exam-uuid",
        "roundNumber": 66,
        "level": "심화",
        "pdfUrl": "/uploads/exams/66_advanced.pdf"
      }
    ]
  }
  ```**[GET] `/api/exams/{examId}/questions`**-** Description:**특정 회차의 전체 문제 목록 조회 (CBT 화면용)
-**Response (200 OK):**```json
  {
    "examId": "exam-uuid",
    "questions": [
      {
        "id": "question-uuid",
        "questionNumber": 1,
        "contentText": "가) 시대의 사회 모습으로 옳은 것은?",
        "imageUrl": "/uploads/questions/66_1.png"
      }
    ]
  }
  ```**[POST] `/api/exams/{examId}/submit`**-** Description:**CBT 문제 풀이 결과 제출 및 자동 채점
-**Request Body:**```json
  {
    "answers": [
      { "questionId": "question-uuid-1", "selectedAnswer": 3 },
      { "questionId": "question-uuid-2", "selectedAnswer": 1 }
    ]
  }
  ```
-**Response (200 OK):**```json
  {
    "score": 86,
    "passed": true,
    "results": [
      {
        "questionId": "question-uuid-1",
        "isCorrect": true,
        "correctAnswer": 3,
        "explanation": "해당 사료는 신석기 시대의 빗살무늬 토기..."
      }
    ]
  }
  ```

### 4.4. 관리자 전용 (Admin - Requires Admin JWT)**[PUT] `/api/admin/users/{userId}/role`**-** Description:**특정 사용자의 권한 변경 (general <-> admin)
-**Request Body:**```json
  { "role": "admin" }
  ```**[POST] `/api/admin/materials`**-** Description:**신규 학습 자료 등록
-**Request Format:** `multipart/form-data` (파일 업로드 포함) 또는 JSON (링크만 있는 경우)

---

## 5. Docker Compose 구성안

포트 매핑 규칙(`FE: 11000`, `BE: 20000`, `DB: 55500`)을 엄격히 준수한 구성입니다.

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "11000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:20000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
    ports:
      - "20000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/hanneunggeom
      - JWT_SECRET=your_super_secret_key
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "55500:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=hanneunggeom
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```
