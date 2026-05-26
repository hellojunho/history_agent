-- DDL: history_media 테이블 생성 (기존 테이블이 있을 시 드롭 후 재생성)
DROP TABLE IF EXISTS history_media CASCADE;

CREATE TABLE history_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    era VARCHAR(255) NOT NULL,
    media_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    release_year INTEGER NOT NULL,
    associated_event VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- DML: 정예 역사적 사실 기반 미디어 데이터 삽입
INSERT INTO history_media (era, media_type, title, release_year, associated_event) VALUES
-- 1. 삼국 시대 및 가야
('threeKingdoms', '드라마', '주몽', 2006, '고조선 왕검성 함락 및 멸망 (우거왕)'),
('threeKingdoms', '드라마', '근초고왕', 2010, '고구려 평양성 전투 (고국원왕 전사) (고국원왕 ~ 근초고왕)'),
('threeKingdoms', '드라마', '우씨왕후', 2024, '을파소 등용과 진대법 실시 및 우씨왕후의 취수혼 (고국천왕 ~ 산상왕)'),
('threeKingdoms', '드라마', '연개소문', 2006, '을지문덕의 살수대첩 (영양왕)'),
('threeKingdoms', '영화', '안시성', 2018, '양만춘의 안시성 전투 (당태종 격퇴) (보장왕)'),
('threeKingdoms', '영화', '황산벌', 2003, '계백의 황산벌 전투 (백제 멸망) (의자왕 ~ 무열왕)'),

-- 2. 통일신라 및 발해
('unifiedSilla', '드라마', '삼국기', 1992, '매소성 및 기벌포 전투 (나당전쟁 최종 승리) (문무왕)'),
('unifiedSilla', '드라마', '대조영', 2006, '대조영의 발해 건국 (동모산 건국) (대조영)'),
('unifiedSilla', '드라마', '해신', 2004, '해상왕 장보고의 청해진 설치 (흥덕왕)'),

-- 3. 고려 시대
('goryeo', '드라마', '태조 왕건', 2000, '고려 건국 및 후삼국 통일 (태조 왕건)'),
('goryeo', '드라마', '고려 거란 전쟁', 2023, '서희의 강동 6주 획득 (거란 1차 침입) (성종)'),
('goryeo', '드라마', '고려 거란 전쟁', 2023, '강감찬의 귀주대첩 (거란 3차 침입) (현종)'),
('goryeo', '드라마', '무인시대', 2003, '무신정변 발발 (의종)'),

-- 4. 조선 전기
('earlyJoseon', '드라마', '원경', 2025, '태종 이방원의 왕권 강화와 제2차 왕자의 난 (태종)'),
('earlyJoseon', '영화', '왕과 사는 남자', 2026, '계유정난 (수양대군의 쿠데타) (단종)'),
('earlyJoseon', '영화', '명량', 2014, '정유재란과 명량 대첩 (선조)'),
('earlyJoseon', '영화', '노량: 죽음의 바다', 2023, '노량 해전과 이순신의 순국 (임진왜란 종결) (선조)'),

-- 5. 조선 후기
('lateJoseon', '영화', '광해, 왕이 된 남자', 2012, '인조반정 (광해군 폐위) (광해군 ~ 인조)'),
('lateJoseon', '영화', '남한산성', 2017, '병자호란과 남한산성 47일간의 결전 (인조)'),
('lateJoseon', '드라마', '연인', 2023, '삼전도의 굴욕 (치욕적 항복) (인조)'),

-- 6. 근대 개항기
('portOpening', '드라마', '미스터 션샤인', 2018, '신미양요와 어재연의 광성보 결사 항전 (고종)'),
('portOpening', '드라마', '미스터 션샤인', 2018, '대한제국 선포 및 광무개혁 (고종)'),
('portOpening', '드라마', '미스터 션샤인', 2018, '을사늑약 강제 체결 및 국권 침탈 (고종)'),
('portOpening', '드라마', '녹두꽃', 2019, '동학농민운동과 우금치 전투 (고종)'),

-- 7. 일제 강점기
('japaneseColonial', '영화', '항거: 유관순 이야기', 2019, '3·1 만세 운동 및 유관순의 순국 (조선총독)'),
('japaneseColonial', '영화', '암살', 2015, '대한민국 임시정부의 수립 (조선총독)'),
('japaneseColonial', '영화', '봉오동 전투', 2019, '홍범도의 봉오동 전투 (최초 전면전 대첩) (조선총독)'),
('japaneseColonial', '영화', '하얼빈', 2024, '안중근 의사의 하얼빈 의거 (이토 사살) (고종 ~ 순종)'),

-- 8. 현대 사회
('modern', '영화', '서울의 봄', 2023, '12·12 군사 반란 (신군부의 쿠데타) (최규하 대통령)'),
('modern', '영화', '택시운전사', 2017, '5·18 광주 민주화 운동 (시민군 결성과 저항) (최규하 ~ 전두환)'),
('modern', '영화', '1987', 2017, '6월 민주 항쟁 (대통령 직선제 개헌 쟁취) (전두환 대통령)');
