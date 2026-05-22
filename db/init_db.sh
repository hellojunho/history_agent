#!/bin/bash
set -e

DB_CONTAINER="history-db-1"
INIT_SQL="db/init.sql"

# 1. 컨테이너가 실행 중인지 확인
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "❌ 에러: 데이터베이스 컨테이너(${DB_CONTAINER})가 실행 중이지 않습니다."
  echo "먼저 'make up' 등을 실행해 컨테이너를 구동해주세요."
  exit 1
fi

# 2. 현재 DB 상태와 init.sql 비교
echo "🔍 현재 데이터베이스 상태를 분석 중입니다..."

# 임시 파일 없이 bash 프로세스 치환으로 의미있는 변경 사항이 있는지 diff 수행
# 메타데이터, 주석, 빈 줄, 그리고 \restrict 등의 임시 지시어 제거
clean_sql() {
  cat "$1" | grep -v '^--' | grep -v '^$' | grep -v 'PostgreSQL database dump' | grep -v 'Dumped by' | grep -v 'Dumped from' | grep -v 'restrict' | grep -v 'SET '
}

# 현재 DB에서 실시간 덤프를 생성
docker exec -i "${DB_CONTAINER}" pg_dump -U user -d hanneunggeom --clean --if-exists --no-owner --no-privileges > db/temp_current.sql

# 두 파일의 알맹이 비교
if diff -B <(clean_sql "db/init.sql") <(clean_sql "db/temp_current.sql") > /dev/null 2>&1; then
  # 변경 사항 없음
  echo "✅ 데이터베이스가 초기 상태(init.sql과 동일)와 일치합니다."
else
  # 변경 사항 있음
  echo "⚠️ 경고: 현재 데이터베이스 상태가 init.sql(초기 상태)과 다릅니다! (새로운 데이터 추가 또는 변경 감지)"
  echo "정말로 데이터베이스를 초기 상태로 리셋하시겠습니까?"
  read -p "진행하시겠습니까? (y/n): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "❌ 초기화가 중단되었습니다. 기존 데이터베이스 상태를 유지합니다."
    rm -f db/temp_current.sql
    exit 0
  fi
fi

rm -f db/temp_current.sql

# 3. init.sql 실행하여 초기화 진행
echo "🚀 데이터베이스 초기화를 진행합니다..."
docker exec -i "${DB_CONTAINER}" psql -U user -d hanneunggeom -f - < db/init.sql
echo "🎉 데이터베이스가 성공적으로 초기화되었습니다!"
