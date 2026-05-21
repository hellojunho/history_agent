.PHONY: build up down restart logs ps clean

# Docker Compose 빌드 및 실행
build:
	docker-compose build

# 전체 서비스 실행 (백그라운드)
up:
	docker-compose up -d

# 전체 서비스 중지 및 컨테이너 삭제
down:
	docker-compose down

# 재시작
restart:
	docker-compose restart

# 로그 확인
logs:
	docker-compose logs -f

# 서비스 상태 확인
ps:
	docker-compose ps

# 미사용 이미지 및 볼륨 삭제
clean:
	docker-compose down -v --rmi all --remove-orphans

start:
	make down && make build && make up
parse:
	@echo "1. PDF 파서를 실행합니다..."
	@source venv/bin/activate && python3 parse_pdf.py
	@echo "2. 백엔드 DB에 파싱된 데이터를 등록합니다..."
	@node backend/import_from_download.js

parse-playwright:
	@echo "1. 고정밀 PDF 파서를 실행합니다 (Playwright 방식)..."
	@source venv/bin/activate && python3 parse_playwright.py
	@echo "2. 백엔드 DB에 파싱된 데이터를 등록합니다..."
	@node backend/import_from_download.js

delete-exam-%:
	@echo "제$*회 시험 데이터를 삭제합니다..."
	@node backend/delete_exam.js $*

start-admin:
	make start
	@echo "서비스 가동을 기다리는 중입니다..."
	@sleep 3
	@echo "관리자 자동 로그인 브라우저를 오픈합니다..."
	@open "http://localhost:11000/auth/login?autoLogin=admin"

