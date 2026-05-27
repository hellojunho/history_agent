# GEMINI.md

## Project Context

- 프로젝트 목적과 핵심 비즈니스 로직을 우선 이해한다.
- 현재 동작을 유지하는 것이 새로운 개선보다 중요하다.
- 요청되지 않은 기능 추가 금지.
- architecture 변경은 명시적 요청이 있을 때만 수행한다.

---

## Working Style

작업 순서:

1. 문제 이해
2. 관련 파일 탐색
3. 구현 계획 제시
4. 승인 후 수정
5. 검증 수행
6. 변경 요약 보고

계획은 5줄 이하로 간결하게 작성한다.

---

## Token / Credit Efficiency

- 필요한 파일만 읽는다.
- 전체 repository scan 금지.
- 관련 없는 디렉토리 탐색 금지.
- 먼저 search/grep으로 위치를 찾는다.
- 코드 전체 출력 금지.
- 변경 사항은 diff 중심으로 설명한다.
- 긴 reasoning 출력 금지.
- 동일 파일 반복 분석 금지.
- 여러 문제를 동시에 해결하지 않는다.
- 코드 컨벤션을 반드시 지킨다.

---

## Implementation Rules

- 최소 수정 원칙을 따른다.
- 기존 코드 스타일을 유지한다.
- 기존 API contract 변경 금지.
- 추측 기반 수정 금지.
- 존재 여부를 확인하지 않은 함수/파일 사용 금지.
- mock으로 문제를 숨기지 않는다.
- TODO 남기고 완료 처리 금지.

---

## Safety Rules

승인 없이 다음 작업 금지:

- migration 실행
- production deploy
- schema 변경
- force push
- rm 명령
- secret/env 수정
- dependency 대규모 업데이트

또한:

- API key 출력 금지
- secret logging 금지
- 허가 없는 외부 API 호출 금지

---

## Validation

수정 후 반드시 실행:

1. lint
2. type-check
3. unit test
4. build

실패 시:

- 동일 시도 반복 금지
- 원인 분석 후 보고
- 우회 해결 금지

---

## Dependency Rules

- 새로운 dependency 추가 전 이유 설명 필수
- 가능하면 기존 dependency 활용
- lockfile 불필요 변경 금지

---

## Git Rules

- 작은 단위 수정 유지
- 자동 commit 금지
- force push 금지
- branch 생성 금지
- commit message 규칙 준수

---

## Response Format

응답 형식:

1. 현재 문제 이해
2. 수정 계획
3. 변경 내용
4. 검증 결과
5. 남은 이슈

불필요한 장문 설명은 피한다.
