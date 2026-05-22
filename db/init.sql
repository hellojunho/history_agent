--
-- PostgreSQL database dump
--

\restrict ILRpgu5VVsnX9eVxkbciBem7sadOQk7f7k5TNuT0lFlVolIdtfO3XdXyxsNuVGu

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS "FK_f912d2c24bc84f66e0a40b1c169";
ALTER TABLE IF EXISTS ONLY public.user_login_logs DROP CONSTRAINT IF EXISTS "FK_f8379df7d627c940c12d301485a";
ALTER TABLE IF EXISTS ONLY public.inquiry_comments DROP CONSTRAINT IF EXISTS "FK_ba1590c307c6d3e0383134862fc";
ALTER TABLE IF EXISTS ONLY public.exam_notifications DROP CONSTRAINT IF EXISTS "FK_b9c78251480de0f8c5eae0b32b8";
ALTER TABLE IF EXISTS ONLY public.user_answers DROP CONSTRAINT IF EXISTS "FK_adae59e684b873b084be36c5a7a";
ALTER TABLE IF EXISTS ONLY public.inquiries DROP CONSTRAINT IF EXISTS "FK_a896a1864d60d5707403e0a0810";
ALTER TABLE IF EXISTS ONLY public.exam_notifications DROP CONSTRAINT IF EXISTS "FK_7ee8fe5350963ffc7e0f784d859";
ALTER TABLE IF EXISTS ONLY public.user_exam_results DROP CONSTRAINT IF EXISTS "FK_7befdd74dea5f03e3558d14b583";
ALTER TABLE IF EXISTS ONLY public.inquiry_comments DROP CONSTRAINT IF EXISTS "FK_5a7b60fbb0cf638e989e93d9de2";
ALTER TABLE IF EXISTS ONLY public.user_exam_results DROP CONSTRAINT IF EXISTS "FK_528b4e3aed2f5047619596e1144";
ALTER TABLE IF EXISTS ONLY public.user_answers DROP CONSTRAINT IF EXISTS "FK_128e024ae06b982fcdb5ddf3fe3";
ALTER TABLE IF EXISTS ONLY public.inquiry_comments DROP CONSTRAINT IF EXISTS "FK_1101428b5a2a75117f738e06d6c";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE IF EXISTS ONLY public.inquiries DROP CONSTRAINT IF EXISTS "PK_ceacaa439988b25eb9459e694d9";
ALTER TABLE IF EXISTS ONLY public.inquiry_comments DROP CONSTRAINT IF EXISTS "PK_cd93fd2bde44f21d8a3f735731f";
ALTER TABLE IF EXISTS ONLY public.user_login_logs DROP CONSTRAINT IF EXISTS "PK_bcad8136a91a5fdba07ea1284f7";
ALTER TABLE IF EXISTS ONLY public.exam_schedules DROP CONSTRAINT IF EXISTS "PK_b82964d842a1e15774841dbc30f";
ALTER TABLE IF EXISTS ONLY public.exams DROP CONSTRAINT IF EXISTS "PK_b43159ee3efa440952794b4f53e";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS ONLY public.exam_notifications DROP CONSTRAINT IF EXISTS "PK_35fe8a15e6a6df11ed61ff4fdf6";
ALTER TABLE IF EXISTS ONLY public.user_exam_results DROP CONSTRAINT IF EXISTS "PK_33bc5aca7904a36ea590d7d3355";
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS "PK_2fd1a93ecb222a28bef28663fa0";
ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS "PK_08a6d4b0f49ff300bf3a0ca60ac";
ALTER TABLE IF EXISTS ONLY public.user_answers DROP CONSTRAINT IF EXISTS "PK_08977c1a2a5f1b8b472dbd87d04";
ALTER TABLE IF EXISTS public.exam_schedules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.exam_notifications ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_login_logs;
DROP TABLE IF EXISTS public.user_exam_results;
DROP TABLE IF EXISTS public.user_answers;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.materials;
DROP TABLE IF EXISTS public.inquiry_comments;
DROP TABLE IF EXISTS public.inquiries;
DROP TABLE IF EXISTS public.exams;
DROP SEQUENCE IF EXISTS public.exam_schedules_id_seq;
DROP TABLE IF EXISTS public.exam_schedules;
DROP SEQUENCE IF EXISTS public.exam_notifications_id_seq;
DROP TABLE IF EXISTS public.exam_notifications;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exam_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_notifications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    schedule_id integer NOT NULL,
    sent_start boolean DEFAULT false NOT NULL,
    sent_d7 boolean DEFAULT false NOT NULL,
    sent_dday boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: exam_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_notifications_id_seq OWNED BY public.exam_notifications.id;


--
-- Name: exam_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_schedules (
    id integer NOT NULL,
    round integer NOT NULL,
    year integer NOT NULL,
    "examDate" timestamp without time zone NOT NULL,
    "registerStart" timestamp without time zone NOT NULL,
    "registerEnd" timestamp without time zone NOT NULL,
    "resultDate" timestamp without time zone NOT NULL,
    "applyUrl" character varying DEFAULT 'https://www.historyexam.go.kr/'::character varying NOT NULL
);


--
-- Name: exam_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_schedules_id_seq OWNED BY public.exam_schedules.id;


--
-- Name: exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    round_number integer NOT NULL,
    level character varying NOT NULL,
    pdf_file_path character varying,
    year integer,
    title character varying,
    exam_date date,
    total_questions integer DEFAULT 50 NOT NULL,
    source_url character varying,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: inquiry_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    inquiry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category character varying NOT NULL,
    title character varying NOT NULL,
    content_url character varying,
    file_path character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    exam_id uuid NOT NULL,
    question_number integer NOT NULL,
    content_text text,
    image_url character varying,
    answer integer NOT NULL,
    explanation text,
    choices jsonb,
    wrong_explanations jsonb,
    era character varying,
    topic character varying,
    difficulty character varying,
    frequent_concept boolean DEFAULT false NOT NULL,
    source_url character varying
);


--
-- Name: user_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_exam_result_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_choice integer,
    is_correct boolean NOT NULL,
    answered_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_exam_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_exam_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    score integer,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    total_answers integer DEFAULT 0 NOT NULL,
    correct_answers integer DEFAULT 0 NOT NULL,
    time_taken_seconds integer
);


--
-- Name: user_login_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_login_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    login_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    role character varying DEFAULT 'general'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: exam_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_notifications ALTER COLUMN id SET DEFAULT nextval('public.exam_notifications_id_seq'::regclass);


--
-- Name: exam_schedules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_schedules ALTER COLUMN id SET DEFAULT nextval('public.exam_schedules_id_seq'::regclass);


--
-- Data for Name: exam_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exam_notifications (id, user_id, schedule_id, sent_start, sent_d7, sent_dday, created_at) FROM stdin;
\.


--
-- Data for Name: exam_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exam_schedules (id, round, year, "examDate", "registerStart", "registerEnd", "resultDate", "applyUrl") FROM stdin;
1	73	2026	2026-03-07 10:00:00	2026-02-02 09:00:00	2026-02-09 18:00:00	2026-03-20 10:00:00	https://www.historyexam.go.kr/
2	74	2026	2026-05-09 10:00:00	2026-04-06 09:00:00	2026-04-13 18:00:00	2026-05-22 10:00:00	https://www.historyexam.go.kr/
3	75	2026	2026-08-08 10:00:00	2026-07-06 09:00:00	2026-07-13 18:00:00	2026-08-21 10:00:00	https://www.historyexam.go.kr/
4	76	2026	2026-10-17 10:00:00	2026-09-07 09:00:00	2026-09-14 18:00:00	2026-10-30 10:00:00	https://www.historyexam.go.kr/
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exams (id, round_number, level, pdf_file_path, year, title, exam_date, total_questions, source_url, status, created_at) FROM stdin;
3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	60	심화	\N	2022	2022년 제60회 한국사능력검정시험 심화	2022-08-06	5	http://www.historyexam.go.kr	published	2026-05-20 08:45:43.261621
a85b455d-32b9-40ac-a06e-578d20a4af2c	61	심화	\N	2022	2022년 제61회 한국사능력검정시험 심화	2022-10-22	3	http://www.historyexam.go.kr	published	2026-05-20 08:46:54.720019
ed346940-28ba-4328-a47e-dcda8c32ad57	77	심화	\N	2026	제77회 한국사능력검정시험 심화	2026-05-21	50	https://www.historyexam.go.kr	published	2026-05-21 07:23:00.18219
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiries (id, title, content, user_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: inquiry_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiry_comments (id, content, inquiry_id, user_id, parent_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.materials (id, category, title, content_url, file_path, created_at) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (id, exam_id, question_number, content_text, image_url, answer, explanation, choices, wrong_explanations, era, topic, difficulty, frequent_concept, source_url) FROM stdin;
ef4deae4-9409-4809-8291-992937769245	3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	1	(가) 시대의 생활 모습으로 옳은 것은?\n\n[유물 자료]\n우리 박물관에서는 갈돌과 갈판, 빗살무늬 토기 등을 처음 사용하였던 (가) 시대의 기획전을 개최합니다.	\N	2	(가)는 신석기 시대입니다. 갈돌과 갈판, 빗살무늬 토기는 신석기 시대의 대표적인 유물입니다. 신석기 시대에는 가락바퀴와 뼈바늘을 이용하여 옷이나 그물을 만들었습니다.	["주로 동굴이나 막집에 거주하며 이동 생활을 하였다.", "가락바퀴를 이용하여 실을 뽑고 옷을 만들었다.", "명도전, 반량전 등을 이용하여 중국과 교역하였다.", "철제 농기구를 사용하여 농사를 지었다.", "지배자의 무덤으로 고인돌을 축조하였다."]	{"1": "주로 동굴이나 막집에 거주. X → 🔴 핵심 구석기 시대의 특징입니다.", "3": "명도전, 반량전 등을 이용하여 교역. X → 🔴 핵심 철기 시대의 특징입니다.", "4": "철제 농기구를 사용하여 농사를 지었다. X → 🔴 핵심 철기 시대의 특징입니다. 신석기 시대에는 간석기(석제 농기구)를 사용했습니다.", "5": "지배자의 무덤으로 고인돌을 축조하였다. X → 🔴 핵심 청동기 시대의 특징입니다. 계급이 발생한 시대입니다."}	01_prehistory	사회	하	t	http://www.historyexam.go.kr
663a548c-e7e0-4575-9681-15c69b28894d	3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	2	다음 자료의 국가에 대한 설명으로 옳은 것은?\n\n그 나라의 혼인 풍속은, 여자의 일가가 큰 집 뒤에 작은 집을 짓는데 이를 '서옥'이라 부른다. 사위가 저녁에 문 밖에 와서 이름을 밝히고 들어가기를 청하면, 여자의 부모가 허락하여 서옥에 머물게 한다.	\N	5	자료에 나타난 혼인 풍속은 고구려의 '서옥제'입니다. 고구려는 귀족 회의인 제가 회의를 통해 국가의 중대사를 결정했습니다.	["신성 지역인 소도가 존재하였다.", "혼인 풍습으로 민며느리제가 있었다.", "여러 가(加)들이 별도로 사출도를 주관하였다.", "가족의 뼈를 추려 한 목곽에 안치하는 골장제가 있었다.", "제가 회의를 통해 국가의 중대사를 결정하였다."]	{"1": "신성 지역인 소도가 존재하였다. X → 🔴 핵심 삼한의 특징입니다. 제사장인 천군이 다스렸습니다.", "2": "혼인 풍습으로 민며느리제가 있었다. X → 🔴 핵심 옥저의 특징입니다.", "3": "여러 가(加)들이 별도로 사출도를 주관하였다. X → 🔴 핵심 부여의 특징입니다.", "4": "가족의 뼈를 추려 한 목곽에 안치하는 골장제가 있었다. X → 🔴 핵심 옥저의 가족 공동 무덤(골장제) 풍습입니다."}	02_three_kingdoms	정치	중	t	http://www.historyexam.go.kr
ac922a14-c4c8-40b0-928e-8f23ac0b4716	3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	3	(가) 왕의 업적으로 옳은 것은?\n\n이 비석은 (가)이/가 백제의 수도인 한성을 함락하고 개로왕을 전사시킨 후, 한강 유역을 차지한 것을 기념하여 건립한 충주 고구려비입니다.	\N	2	(가)는 장수왕입니다. 백제 한성을 함락시키고 개로왕을 전사시킨 왕은 장수왕이며, 그는 수도를 국내성에서 평양으로 옮기고 적극적인 남진 정책을 펼쳤습니다.	["낙랑을 축출하고 영토를 확장하였다.", "평양으로 도읍을 옮기고 남진 정책을 추진하였다.", "영락이라는 독자적인 연호를 사용하였다.", "전진의 순도를 통해 불교를 수용하였다.", "태학을 설립하여 인재를 양성하였다."]	{"1": "낙랑을 축출하고 영토를 확장하였다. X → 🔴 핵심 미천왕입니다.", "3": "영락이라는 독자적인 연호를 사용하였다. X → 🔴 핵심 광개토대왕입니다.", "4": "전진의 순도를 통해 불교를 수용하였다. X → 🔴 핵심 소수림왕입니다.", "5": "태학을 설립하여 인재를 양성하였다. X → 🔴 핵심 소수림왕입니다."}	02_three_kingdoms	정치	중	t	http://www.historyexam.go.kr
097dd665-6af6-44e7-b725-847fc861d342	3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	4	(가) 국가에 대한 설명으로 옳은 것은?\n\n대조영이 동모산에서 (가)을/를 건국하였다. 이 국가는 고구려 유민과 말갈족으로 구성되었으며, 해동성국이라 불리며 전성기를 누렸다.	\N	2	(가)는 발해입니다. 대조영이 건국하였고, 전성기인 선왕 때 해동성국이라 불렸습니다. 발해의 지방 행정 제도는 5경 15부 62주입니다.	["9서당 10정의 군사 조직을 갖추었다.", "지방을 5경 15부 62주로 편제하였다.", "광군을 창설하여 거란의 침입에 대비하였다.", "지방관으로 안찰사를 파견하였다.", "후당과 왜에 사신을 파견하여 교류하였다."]	{"1": "9서당 10정의 군사 조직을 갖추었다. X → 🔴 핵심 통일 신라의 군사 제도입니다.", "3": "광군을 창설하여 거란의 침입에 대비하였다. X → 🔴 핵심 고려(정종) 때의 일입니다.", "4": "지방관으로 안찰사를 파견하였다. X → 🔴 핵심 고려 시대의 지방 제도입니다. (5도에 안찰사 파견)", "5": "후당과 왜에 사신을 파견하여 교류하였다. X → 🔴 핵심 백제 웅진/사비 시기나 기타 국가들과 섞인 오답 보기입니다. 후당에 사신 파견 등을 한 것은 후백제 등도 있으나 발해의 가장 특징적인 설명은 아닙니다."}	03_unified_silla	정치	중	t	http://www.historyexam.go.kr
468f9976-046c-41ec-a604-26d3f47d7df6	3c9ccc95-d163-44ec-b42f-5fc1919bf6f8	5	(가) 기구에 대한 설명으로 옳은 것은?\n\n조선 시대에 왕의 비서 기관으로, 왕명 출납을 담당하던 (가)은/는 무엇인가? 이 기구의 책임자는 도승지라 불렸다.	\N	3	(가)는 승정원입니다. 도승지를 포함한 6승지가 판서와 대응하여 왕명 출납을 담당했습니다.	["사헌부, 사간원과 함께 3사로 불렸다.", "국왕의 직속 사법 기구로 강상 죄, 반역 죄 등을 처벌하였다.", "왕명 출납을 맡은 국왕의 비서 기관으로 승정원이라고도 하였다.", "역사서를 편찬하고 보관하는 업무를 담당하였다.", "왕실의 족보를 관리하고 종친의 범죄를 다스렸다."]	{"1": "사헌부, 사간원과 함께 3사로 불렸다. X → 🔴 핵심 홍문관입니다.", "2": "국왕의 직속 사법 기구로 처벌하였다. X → 🔴 핵심 의금부입니다.", "4": "역사서를 편찬하고 보관하는 권한. X → 🔴 핵심 춘추관입니다.", "5": "왕실 족보 관리 및 종친 범죄 규찰. X → 🔴 핵심 종부시입니다."}	05_joseon_early	정치	하	t	http://www.historyexam.go.kr
7e9fc4a3-9960-4b65-af16-0b3027b95656	a85b455d-32b9-40ac-a06e-578d20a4af2c	1	다음 자료의 상황이 나타난 시기의 경제 모습으로 옳은 것은?\n\n"지방의 여러 성에서 공물과 조세를 바치지 않아 창고가 비고 국가 재정이 궁핍해졌다. 이에 왕이 사신을 보내 독촉하니, 도처에서 도적이 벌떼처럼 일어났다. 이때 원종과 애노 등이 사벌주에서 반란을 일으켰다."	\N	5	자료는 진성 여왕 대(신라 하대) 원종과 애노의 난(889)을 보여줍니다. 신라 하대에는 진골 귀족의 왕위 쟁탈전과 수취 체제의 모순으로 농민 봉기가 빈발하였고, 지방 호족과 6두품 세력이 성장하여 새로운 사회(고려)를 모색했습니다.	["녹읍이 폐지되고 관료전이 지급되었다.", "청해진을 중심으로 한 해상 무역이 발달하였다.", "진대법을 실시하여 빈민을 구제하였다.", "농상집요가 소개되어 농업 기술이 발전하였다.", "지방 호족과 6두품 세력이 새로운 사회를 모색하였다."]	{"1": "녹읍이 폐지되고 관료전이 지급. X → 🔴 핵심 신라 중대(신문왕) 때의 일입니다.", "2": "청해진을 중심으로 해상 무역. X → 🔴 핵심 통일 신라 9세기 장보고 때의 일이나 원종·애노의 난 시기 경제/사회의 대표상은 하대 사회 붕괴 측면입니다. (가장 적절한 하대 혼란상 보기 5번이 정답)", "3": "진대법을 실시하여 빈민을 구제. X → 🔴 핵심 고구려 고국천왕 때입니다.", "4": "농상집요가 소개되어 농업 기술 발전. X → 🔴 핵심 고려 후기에 이암이 원으로부터 수입했습니다."}	03_unified_silla	경제	중	t	http://www.historyexam.go.kr
42301b56-edbd-4e78-9419-a026c81308c6	a85b455d-32b9-40ac-a06e-578d20a4af2c	2	(가) 인물에 대한 설명으로 옳은 것은?\n\n이 책은 (가)이/가 지은 『동국이상국기』의 일부이다. 이 글에서 그는 "동명왕의 일은 변화에 의한 신이(神異)한 것으로, 사람들의 눈을 속인 것이 아니다"라고 하며 고구려 계승 의식을 드러내었다.	\N	5	(가)는 이규보입니다. 『동국이상국기』에 수록된 서사시인 「동명왕편」은 구구려의 건국 영웅인 동명왕(주몽)의 업적을 칭송하며 고려의 고구려 계승 의식을 반영했습니다.	["원효와 함께 불교의 대중화에 힘썼다.", "성리학을 도입하여 신진 사대부의 사상적 기반을 마련하였다.", "단군 신화를 수록한 삼국유사를 저술하였다.", "김부식과 함께 삼국사기를 편찬하였다.", "이규보로서, 무신 정권기 문인으로 활동하며 동명왕편을 지었다."]	{"1": "원효와 함께 불교 대중화. X → 🔴 핵심 의상 등 통일신라 승려입니다.", "2": "성리학을 도입. X → 🔴 핵심 고려 후기 안향입니다.", "3": "삼국유사를 저술. X → 🔴 핵심 일연입니다.", "4": "삼국사기를 편찬. X → 🔴 핵심 김부식 본인이거나 관련 편찬자입니다."}	04_goryeo	문화	중	t	http://www.historyexam.go.kr
2d118ddf-da29-411a-bf1e-2041a90ee46c	a85b455d-32b9-40ac-a06e-578d20a4af2c	3	(가) 기구에 대한 설명으로 옳은 것은?\n\n정조 때 설치된 기구로, 왕실 도서관이자 학술 및 정책 연구 기관의 역할을 하였다. 초기에는 창덕궁 주합루에 위치하였으며, 박제가, 이덕무 등의 서얼 출신 학자들이 검서관으로 기용되기도 하였다.	\N	5	(가)는 규장각입니다. 정조는 규장각을 설치해 자신의 권력 기반을 다지는 핵심적인 정치 기구로 육성하였고 서얼 출신도 검서관으로 등용했습니다. 5번에서 규장각을 국왕의 개혁 기구로서 서술합니다.	["을묘왜변을 계기로 상설 기구화되었다.", "흥선대원군에 의해 혁파되었다.", "정조의 개혁 정치를 뒷받침하는 핵심 기구인 규장각이었다.", "홍문관, 사헌부, 사간원과 함께 3사로 불렸다.", "국왕의 친위 부대로 장용영과 함께 설치된 규장각이다."]	{"1": "을묘왜변을 계기로 상설 기구화. X → 🔴 핵심 비변사입니다.", "2": "흥선대원군에 의해 혁파. X → 🔴 핵심 비변사 및 서원에 대한 설명입니다.", "3": "승정원을 설명할 때 비서 기관이나 3번지문은 좀 혼동. 5번이 명확한 정답.", "4": "홍문관, 사헌부, 사간원 3사. X → 🔴 핵심 조선 3사(규장각 포함 안됨)입니다."}	06_joseon_late	정치	하	t	http://www.historyexam.go.kr
4781a8df-4615-4f90-b9a0-f4577ea7f98f	ed346940-28ba-4328-a47e-dcda8c32ad57	1	밑줄 그은 ‘이 시대’의 생활 모습으로 가장 적절한 것은? [1점] 여주 흔암리 유적 체험 프로그램 안내 우리 박물관에서는 사유 재산과 계급이 발생한 이 시대의 대표적 유적지인 여주 흔암리 유적을 주제로 체험 프로그램을 마련하였습니다. 다양한 행사를 통해 당시 사람들의 생활 모습을 알아보는 시간을 가져 보시기 바랍니다.   주요 프로그램 ○ 민무늬 토기 조각 맞추기 ○ 반달 돌칼로 벼 이삭 수확하기 ○ 흙 속에 섞여 있는 탄화미 찾아보기 ◯ ◯월 ◯ ◯일 ◯ ◯월 ◯ ◯일 ● 신청 기간: 2026년 ~ ● 신청 방법: △△ 박물관 홈페이지 공지 사항 참고	\N	3	공식 해설 없음	["철제 무기로 정복 활동을 벌였다.", "소를 이용한 깊이갈이가 일반화되었다.", "많은 인력을 동원하여 고인돌을 축조하였다.", "주먹도끼, 찍개 등의 뗀석기를 처음 제작하였다.", "가락바퀴와 뼈바늘을 이용하여 옷을 만들기 시작하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
42501d35-bd24-4987-be23-aed2b5f3b413	ed346940-28ba-4328-a47e-dcda8c32ad57	2	(가) 나라에 대한 설명으로 옳은 것은? [2점] 역사 신문 제△△호 ◯◯◯◯년 ◯◯월 ◯◯일 양국 간 외교 갈등, 전쟁으로 이어지다 한의 사신 섭하가 자신을 송별하던 의 비왕(裨王) (가) 장(長)을 살해하는 외교적 사건이 발생하였다. 그런데 한 무제는 오히려 섭하에게 벼슬을 내렸고 우거왕은 이에 분노하여 군대를 보내 섭하를 죽였다. 그러자 한 무제가 병력을 모아 을/를 (가) 침공하였고, 우거왕은 이에 맞서기로 결심한 것으로 보인다.	\N	5	공식 해설 없음	["민며느리제라는 혼인 풍습이 있었다.", "국가 중대사를 정사암에서 논의하였다.", "여러 가(加)들이 별도로 사출도를 주관하였다.", "지방의 여러 성에 욕살, 처려근지 등을 두었다.", "사회 질서를 유지하기 위해 범금 8조를 만들었다. 문제지"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
daddb735-2b65-4217-a3b4-51b81b4dee66	ed346940-28ba-4328-a47e-dcda8c32ad57	3	밑줄 그은 ‘이 나라’에 대한 탐구 활동으로 가장 적절한 것은? [2점] 오전 10:40 100% 인공 지능 이미지 생성기 및 편집기 텍텍스스트트를를 이이미미지지로로 이미지를 이미지로 명령어 『삼국지』위서 동이전에 기록된 이 나라의 특징을 반영하여 이미지를 만들어 줘. 주요 특징은 다음과 같아. ○ 특산물로 단궁, 과하마, 반어피가 유명하였다. ○ 10월에 제천 행사인 무천이 있었다. ○ 호랑이를 신으로 여겨 제사를 지냈다. 생 성 중	\N	2	공식 해설 없음	["진대법의 시행 목적을 파악한다.", "책화의 사회적 의미를 조사한다.", "신성 구역인 소도의 기능을 알아본다.", "화백 회의의 의사 결정 방식을 살펴본다.", "포상 8국 전쟁이 전개되는 과정을 찾아본다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
44a59a51-531d-4e7d-9d45-832e3f951df6	ed346940-28ba-4328-a47e-dcda8c32ad57	4	(가) 국가의 문화유산으로 옳은 것은? [2점] 이 전시실에서는 의 수도에서 발굴된 경주 천마총 장니 (가) 천마도와 금령총 천마무늬 말다래 등을 통해 다양한 천마의 모습을 볼 수 있습니다. 장니는 말의 안장 양쪽에 늘어뜨려 놓은 것으로 말다래 라고도 불립니다. 경주 천마총 장니 천마도	\N	4	공식 해설 없음	["/uploads/77_Q4_opt1.png", "/uploads/77_Q4_opt2.png", "/uploads/77_Q4_opt3.png", "/uploads/77_Q4_opt4.png", "/uploads/77_Q4_opt5.png"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
0def0ade-7e10-4bd2-ba94-d5a9bbd65b64	ed346940-28ba-4328-a47e-dcda8c32ad57	5	다음 대화에 나타난 왕에 대한 설명으로 옳은 것은? [2점] 내일 우리 모둠이 발표할 왕에 대해 조사한 내용을 말해줘. 백가의 난을 평정하고 왕권을 강화하였어. 중국 남조의 양에 고구려를 여러 차례 격파하고 다시 강국이 되었다는 내용의 국서를 보냈어. 1971년에 발굴된 이 왕의 무덤에서 왕과 왕비의 지석, 그리고 석수 등이 출토되었어.	\N	3	공식 해설 없음	["금마저에 미륵사를 창건하였다.", "고흥에게 서기를 편찬하게 하였다.", "지방의 22담로에 왕족을 파견하였다.", "동진에서 온 마라난타를 통해 불교를 수용하였다.", "장군 달기를 보내 고구려의 도살성을 점령하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
70315072-2f20-4715-8b09-ebad2f128ed0	ed346940-28ba-4328-a47e-dcda8c32ad57	6	(가), (나) 사이의 시기에 있었던 사실로 옳은 것은? [3점] (가) 왕이 태자 김법민을 보내 병선 100척을 거느리고 덕물도에서 소정방을 맞이하게 하였다. 소정방이 김법민에게 말하기를, “나는 7월 10일에 백제의 남쪽에 이르러 대왕의 군대와 만나서 의자(義慈)의 도성을 무찔러 깨뜨리고자 한다.”라고 하였다. (나) 사찬 시득이 수군을 거느리고 소부리주 기벌포에서 설인귀와 싸웠는데 연이어 패배하였다. 다시 나아가 크고 작게 22번 싸워 이기고, 4천여 명의 목을 베었다.	\N	2	공식 해설 없음	["을지문덕이 살수에서 대승을 거두었다.", "복신과 도침이 부여풍을 왕으로 추대하였다.", "윤충이 군사를 이끌고 대야성을 함락시켰다.", "연개소문이 정변을 일으켜 영류왕을 시해하였다.", "김춘추가 당으로 건너가 군사 연합을 성사시켰다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
59b12776-81a5-4710-9ef1-997cbdd41bee	ed346940-28ba-4328-a47e-dcda8c32ad57	7	다음 자료에 해당하는 국가에 대한 설명으로 옳은 것은? [1점] 영역은 사방 5천 리이며, 5경과 15부를 두었다. 서쪽으로는 중국과 통하고 남쪽으로는 신라와 교빙하고 북쪽으로는 거란에 맞서고 동쪽으로는 일본에 사신을 보내어, 동북의 안쪽 지역을 압도하며 거의 3백 년 동안이나 존속하였다. - 『해동역사』 -	\N	2	공식 해설 없음	["12월에 영고라는 제천 행사를 열었다.", "주자감을 설치하여 인재를 양성하였다.", "군사 조직으로 9서당 10정을 편성하였다.", "기인 제도를 실시하여 지방 세력을 견제하였다.", "왕족인 부여씨와 8성 귀족이 지배층을 이루었다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
bd4517ee-508c-40ff-bf63-5d3f6df9d93f	ed346940-28ba-4328-a47e-dcda8c32ad57	8	(가) 국가의 경제 상황으로 가장 적절한 것은? [2점] 한국사 대화형 인공 지능 사진 속 무덤에 대해 알려줘. Q A 의 왕릉으로 추정되는 천추총입니다. (가) 그렇게 보는 근거가 뭐야? Q 의 도성이었던 국내성 지역에 위치하며, 대형 계단식 (가) A 돌무지무덤이기 때문입니다. 이 무덤 주변에서 영락으로 판독되는 명문 기와 조각도 발견 되었습니다. 이 기와의 탁본이 있는데 보여드릴까요? 응. 영락 부분을 표시해서 보여줘. Q A	\N	3	공식 해설 없음	["수도에 서시와 남시를 설치하였다.", "활구라고 불리는 은병을 주조하였다.", "집집마다 부경이라는 창고가 있었다.", "관료전을 지급하고 녹읍을 폐지하였다.", "풍흉에 따라 9등급으로 전세를 거두었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
2d04f3fb-6944-4372-866d-fe5fb7a46fd8	ed346940-28ba-4328-a47e-dcda8c32ad57	9	(가) 인물에 대한 설명으로 옳은 것은? [2점] ○ 이/가 나주의 상황을 근심하여 드디어 왕건에게 가서 (가) 지키도록 명령하였다. 품계는 한찬(韓粲)으로 올리고 해군 대장군으로 삼았다. ○ 은/는 백성을 한낱 지푸라기처럼 여기고 오직 자기의 (가) 욕심만을 따랐다. 그리고 참위설을 믿어 갑자기 송악을 버리고 부양(斧壤)*으로 돌아가 궁궐을 세우니, 백성은 공사에 시달려 농사철을 빼앗겼다. *부양(斧壤): 현재 철원의 북부	\N	2	공식 해설 없음	["안승을 보덕왕으로 봉하였다.", "광평성 등의 정치 기구를 마련하였다.", "외교 담판으로 강동 6주를 확보하였다.", "김부를 경주의 사심관으로 임명하였다.", "신라를 공격하여 경애왕을 죽게 하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
dd33dd62-e80b-40ff-9700-0adfb41ab9db	ed346940-28ba-4328-a47e-dcda8c32ad57	10	다음 가상 뉴스에서 보도한 내용이 있었던 시기에 볼 수 있는 모습으로 가장 적절한 것은? [2점] 청해진이 폐지되고 주민들은 벽골군으로 옮겨진다는 소식입니다. 해상 무역의 거점이었던 청해진이 장보고의 건의로 설치된 지 20여 년만의 일입니다. 청해진, 역사 속으로 사라지다	\N	4	공식 해설 없음	["계백료서를 읽고 있는 관리", "담배를 밭에 심고 있는 농민", "조위총의 난을 진압하는 군인", "진전사에서 참선하는 선종 승려", "낙랑군과 교역할 덩이쇠를 주조하는 장인"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
5c6f134d-6688-478c-a655-96570297f885	ed346940-28ba-4328-a47e-dcda8c32ad57	11	(가) 국가에 대한 고려의 대응으로 옳은 것은? [2점] 이것은 현화사비의 탁본입니다. 이 비석의 흥미로운 점은 앞면에는 송의 연호인 천희가, 뒷면에는 의 연호인 태평이 새겨져 있다는 것입니다. (가) 고려는 귀주 대첩에서 을/를 격퇴하였지만, 오히려 조공 책봉 관계를 (가) 수용하여 다원적인 국제 질서 속에서 실리와 안정을 추구하였습니다. 天 太 禧 平 앞면 뒷면	\N	4	공식 해설 없음	["별무반을 편성하였다.", "화통도감을 설치하였다.", "진관 체제를 실시하였다.", "초조대장경을 조판하였다.", "동녕부의 반환을 요청하였다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
1f731cd7-5390-48e8-b9f1-5acfb559afe5	ed346940-28ba-4328-a47e-dcda8c32ad57	12	(가)에 들어갈 내용으로 가장 적절한 것은? [3점] [다큐멘터리 기획안] 우리 역사 속 생태·환경 이야기 기획 의도 ▣ 인간과 생태·환경의 상호 관계를 시대 순으로 조망 하여 한국사에 대한 새로운 시각을 제공한다. 구성 ▣ 1부. 혜공왕 대 재이(災異) 발생과 백좌법회 개최 2부. (가) 3부. 『승정원일기』를 통해 본 소빙기 농업 생산과 경신대기근 발생 4부. 해수구제(害獸驅除) 사업의 시행과 한반도 호랑이 사냥	\N	1	공식 해설 없음	["응방의 설치와 매 서식지의 변화", "시화호의 조성과 갯벌 생태계 파괴", "수의 침략과 요하 일대 감염병의 유행", "가죽 제품 수요 증가와 독도 강치의 멸종", "을축년 대홍수의 피해와 경성부의 대응 양상"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
72898545-c6af-4b32-b3c7-308bb197e2b8	ed346940-28ba-4328-a47e-dcda8c32ad57	13	(가) 국가의 문화유산으로 옳지 않은 것은? [1점] 제가 소개할 문화유산은 청주 명암동에서 출토된 단산오옥명 먹입니다. 의 먹은 주로 묵소(墨所)에서 생산되었으며 중국 사신 서긍도 (가) 언급했을 정도로 잘 알려져 있었습니다. (가) < 의 문화유산 소개하기 > 다인철소 유적 출토 솥단지 나전 국화 넝쿨무늬 합	\N	4	공식 해설 없음	["/uploads/77_Q13_opt1.png", "/uploads/77_Q13_opt2.png", "/uploads/77_Q13_opt3.png", "/uploads/77_Q13_opt4.png", "/uploads/77_Q13_opt5.png"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
a1d9e5af-5073-4cbf-8eea-01d37815214b	ed346940-28ba-4328-a47e-dcda8c32ad57	14	(가)에 들어갈 내용으로 가장 적절한 것은? [2점] 한국사 탐구 계획서 •탐구 주제: (가) •참고 자료 태조 왕건 청동상 청주 용두사지 철당간 준풍(峻豊)이라는 연호가 통천관을 쓰고 있다. 새겨져 있다.	\N	5	공식 해설 없음	["신해통공의 단행 배경", "명의 멸망과 소중화주의의 대두", "골품제가 일상생활에 끼친 영향", "울산항을 통한 아라비아 상인들과의 교류", "황제국 표방 사례를 통해 본 외왕내제 의식"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
f0b75ed3-e672-45f3-9700-d7ad20e6581d	ed346940-28ba-4328-a47e-dcda8c32ad57	15	밑줄 그은 ‘인물’이 활동한 시기에 볼 수 있는 모습으로 가장 적절한 것은? [3점] 초상화로 보는 한국사 이 그림은 소수 서원에 봉안되어 있는 인물의 초상화이다. 그는 충렬왕 때 원에 갔다가 주희의 저서를 들여오면서 성리학을 본격적 으로 소개하였다. 그림의 상단에는 유학 진흥에 힘쓴 공을 인정하여 충숙왕이 그의 초상화를 문묘에 모시게 하였다는 발문이 있다.	\N	1	공식 해설 없음	["제왕운기를 읽고 있는 왕", "만동묘 복구를 건의하는 유생", "동몽선습을 공부하는 서당 학동", "독서삼품과 시행을 준비하는 관리", "주자소에서 계미자를 주조하는 장인 (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
453ef7dc-f3a5-479c-b4d1-77fb5373fdd9	ed346940-28ba-4328-a47e-dcda8c32ad57	16	(가) 인물에 대한 설명으로 옳은 것은? [2점] 교외 체험 학습 보고서 △학년 △반 △△번 이름:    ⊙ 날짜: 2026년 ◯◯월 ◯◯일 ⊙ 장소: 인천광역시 강화 석릉 ⊙ 학습 내용 강화 석릉은 고려 희종의 무덤이다. 이의민을 제거하고 집권한 이/가 스스로 교정별감이 되어 전횡을 일삼자, (가) 희종은 그를 암살하려고 하였으나 도방의 방해로 실패하였다. 그 결과 희종은 이곳 강화도로 유배되었고 이후 여러 유배지를 전전하다 고종 24년에 생을 마감하였다고 한다.	\N	4	공식 해설 없음	["비담과 염종의 반란을 진압하였다.", "만권당에서 원의 학자들과 교유하였다.", "인사 행정을 담당하던 정방을 폐지하였다.", "봉사 10조를 올려 시정 개혁을 건의하였다.", "오월(吳越)에 사신을 보내고 검교태보의 직을 받았다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
950c8d17-ab24-495f-ba8d-e7c2722021e7	ed346940-28ba-4328-a47e-dcda8c32ad57	17	(가), (나) 인물에 대한 설명으로 옳은 것은? [2점] 오늘은 나는 한국 고대사 연구에 나는 삼국의 역사를 중요한 사료를 남긴 불교 중심의 설화와 기전체로 정리한 두 분의 이야기를 단군의 건국 이야기 등을 삼국사기의 편찬을 들어 보겠습니다. 담은 삼국유사를 총괄하였소. 저술하였소. (가) (나)	\N	1	공식 해설 없음	["(가) - 관군을 이끌고 묘청의 난을 진압하였다.", "(가) - 시무 28조를 올려 국가 운영 방안을 제시하였다.", "(나) - 법화 신앙을 바탕으로 백련 결사를 이끌었다.", "(나) - 화폐 발행을 위해 주전도감 설치를 건의하였다.", "(가), (나) - 심성 도야를 강조하고 유불 일치설을 주장하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
11434b92-7ce3-4784-8e04-0d163b503d64	ed346940-28ba-4328-a47e-dcda8c32ad57	18	다음 상황이 나타난 시기를 연표에서 옳게 고른 것은? [1점] 위화도에서 좌·우군도통사가 글을 올려 회군을 요청하니 최영이 말하기를, “두 도통사가 있으니 스스로 와서 아뢰는 것이 옳다. 군사를 물리자는 말을 감히 내 입으로 하지 못하겠다.”라고 하였다. …… 원의 잔당들이 사막으로 도망가서 이름뿐인 나라를 세웠는데, 최영이 배후(裴厚)를 보내어 함께 돕기로 약속하고 요동을 협공 하였다. 좌·우군도통사가 다시 사람을 보내어 최영에게 나아가 속히 회군을 허락해 달라고 요청하였으나 최영은 그럴 뜻이 없었다. - 『고려사』 - 1009 1126 1232 1273 1351 1392 (가) (나) (다) (라) (마) 강조의 이자겸의 처인성 삼별초 공민왕 고려 정변 난 전투 항쟁 진압 즉위 멸망	\N	5	공식 해설 없음	["(가)", "(나)", "(다)", "(라)", "(마)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
f1541699-6971-4fed-9220-092dc709d23c	ed346940-28ba-4328-a47e-dcda8c32ad57	19	(가) 기구에 대한 설명으로 옳은 것은? [1점] ○ 문하부 좌우 정승을 고쳐 의정부 좌우 정승으로, 문하시랑 찬성사를 의정부 찬성사로, 참찬 문하부사를 참찬 의정부사로, 정당 문학을 의정부 문학으로 하였다. …… 문하부의 이름을 혁파하고, 낭사(郎舍)를 고쳐 (으)로 하였다. (가) ○ 의 대사간 성현(成俔) 등이 상소하였다. “신 등이 삼가 (가) 생각건대 신하를 다루는 도리는 간사하고 올바른 것을 분별하여 올바른 신하는 마땅히 가까이하고, 간사한 신하는 마땅히 멀리하는 것에 있습니다.”	\N	1	공식 해설 없음	["사헌부, 홍문관과 함께 3사로 불렸다.", "국왕 직속 사법 기구로 반역죄 등을 다루었다.", "사초와 시정기를 바탕으로 실록을 편찬하였다.", "왕의 비서 기관으로 왕명의 출납을 관장하였다.", "사대교린에 관한 문서를 관장하기 위해 설치되었다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
6501724f-c0ba-4f60-9f6b-fcc49314ee1d	ed346940-28ba-4328-a47e-dcda8c32ad57	20	(가) 왕의 재위 시기에 있었던 사실로 옳은 것은? [3점] 이달의 책 대불정수능엄경(언해) 이 책은 중국 승려 계환(戒環)의 『대불정수능엄경요해』에 이/가 훈민정음으로 구결을 달고 한계희, 김수온 (가) 등이 번역하여 편찬한 것이다. 현재 활자본과 목판본이 전하는데, 그중 목판본은 이/가 만든 간경도감에서 (가) 간행한 최초의 불경 언해서이다. 이는 이후 만들어지는 언해서 편찬 체계의 본보기가 된다는 점에서 의미가 있다.	\N	5	공식 해설 없음	["조의제문을 빌미로 무오사화가 일어났다.", "세계 지도인 혼일강리역대국도지도가 제작되었다.", "예악 질서의 확립을 위한 악학궤범이 완성되었다.", "역대 문물 제도를 정리한 동국문헌비고가 편찬되었다.", "현직 관리에게만 수조권을 지급하는 직전법이 시행되었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
9186df50-a1f0-4c4b-afb8-90ede13efbe7	ed346940-28ba-4328-a47e-dcda8c32ad57	21	(가) 인물에 대한 설명으로 옳은 것은? [2점] 이곳은 안동의 병산 서원으로, 의 위패가 봉안되어 (가) 있습니다. 은/는 훈련도감 설치를 건의하고 공납의 (가) 폐단을 시정하고자 대공수미법을 제안했습니다.	\N	4	공식 해설 없음	["기대승과 사단칠정 논쟁을 전개하였다.", "소학의 보급과 현량과 실시를 주장하였다.", "기축봉사를 올려 명에 대한 의리를 내세웠다.", "임진왜란의 상황 등을 담은 징비록을 저술하였다.", "최초로 100리 척을 사용하여 동국지도를 제작하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
e33a4ebb-6490-4ece-90a4-4f4543ba70ca	ed346940-28ba-4328-a47e-dcda8c32ad57	22	다음 시나리오의 상황 이후에 전개된 사실로 옳은 것은?[ 2점] #11. 남한산성 안 임금이 항복하라는 내용이 담긴 칸[汗]의 서신을 읽은 후 대신들에게 말한다. 임금: 앞 으로 어떤 계책을 세워야 하겠는가? 김상헌: 지금 항복한다 하더라도 어떻게 그 노여움을 풀겠습니까. 끝내는 반드시 따르기 어려운 요청을 해 올 것입니다. 적의 글을 우리 군사들에게 널리 알려 사기를 높이는 것이 마땅하겠습니다. 최명길: 칸이 직접 출병한 이상 대적하기가 더욱 어려운데 , 대적할 경우 반드시 망하고 말 것입니다. 임금: 성문과 성벽을 굳게 지키면서 속히 회답해야 할 것이다.	\N	5	공식 해설 없음	["강홍립 부대가 사르후 전투에 참전하였다.", "김종서가 두만강 일대에 6진을 개척하였다.", "김시민이 진주성 전투에서 크게 승리하였다.", "이종무가 왜구의 근거지인 쓰시마섬을 정벌하였다.", "이완이 어영대장으로 임명되어 북벌을 준비하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
5787c066-be74-48a3-8fda-1622e5361c6f	ed346940-28ba-4328-a47e-dcda8c32ad57	23	밑줄 그은 ‘시기’에 볼 수 있는 모습으로 적절하지 않은 것은? [2점] 이것은 변박이 그린 초량 왜관의 전경입니다. 이 그림에는 관수가(館守家)를 중심으로 서관과 동관 구역이 나뉘어 있고, 50여 개의 건물 명칭이 표기되어 있습니다. 이를 통해 초량 왜관에서 대일 무역이 이루어지던 시기 왜관의 구성과 규모를 확인할 수 있습니다. 변박 특별전 왜관도 화면을 넘기면 다른 작품을 볼 수 있습니다.	\N	1	공식 해설 없음	["계해약조의 초안을 작성하는 관리", "까치를 소재로 민화를 그리는 화원", "세책가에서 춘향전을 빌리는 부녀자", "시사(詩社)를 조직하여 활동하는 서리", "송파장에서 산대놀이를 공연하는 광대 (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
65f93865-3ab7-4cde-baab-8311ab12c5c0	ed346940-28ba-4328-a47e-dcda8c32ad57	24	(가) 왕이 추진한 정책으로 옳은 것은? [3점] 맞습니다. 특히 이 자료에는 그들이 이 자료는 개국 공신부터 보사 기사환국과 갑술환국을 거치며 공신의 공신까지의 공신과 그 자손들을 모아 지위를 박탈당했다가 회복하는 정황이 결속을 다지는 회맹 행사를 거행한 반영되어 있어, 재위 시기의 후 그 명단 등을 담은 문서입니다. (가) 급변하는 정치적 상황을 파악하는 데 보사 공신이란 경신환국의 공신들을 도움을 줍니다. 일컫는 말이지요? 이십공신회맹축 - 보사공신녹훈후	\N	3	공식 해설 없음	["문신을 재교육하기 위한 초계문신제를 실시하였다.", "각 궁방과 중앙 관서의 공노비 6만여 명을 해방하였다.", "국왕의 호위와 수도 방어를 위해 금위영을 창설하였다.", "각지의 농법을 작물별로 정리한 농사직설을 편찬하였다.", "붕당 정치의 폐해를 경계하기 위해 탕평비를 건립하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
6243ce7c-d783-486a-8106-2a2be9535866	ed346940-28ba-4328-a47e-dcda8c32ad57	25	다음 자료에 나타난 시기의 경제 상황으로 옳은 것은? [1점] 근래 듣건대, 도고라는 방식이 새로 나와 한 사람이 물품을 독차지하면서 다른 사람은 감히 개별적으로 살 수 없게 되었다고 합니다. …… 이른바, 이익은 한 사람에게로 돌아가고 피해는 만민이 받는다는 것입니다. …… 청컨대 한성부와 평시서로 하여금 엄히 금단하게 하여 도고를 없애고 다시 각자가 매매하게 하여 전처럼 생활 할 수 있게 하소서.	\N	3	공식 해설 없음	["관리에게 전지와 시지가 지급되었다.", "솔빈부의 말이 특산품으로 수출되었다.", "관청에 물품을 조달하는 공인이 활동하였다.", "당항성, 영암이 국제 무역항으로 번성하였다.", "삼한통보, 해동통보 등의 화폐가 발행되었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
9409d61d-6173-40ac-b053-d0f47bd22d5e	ed346940-28ba-4328-a47e-dcda8c32ad57	26	(가) 인물에 대한 설명으로 옳은 것은? [2점] □□ 신문 제△△호 2025년 ◯◯월 ◯◯일 『북학의』 친필 고본(稿本), 보물로 지정 수원 화성 박물관에 소장된 고본 『북학의』가 보물로 (가) 지정되었다. 『북학의』는 이/가 청의 (가) 연경에 다녀온 후 국가 제도와 정책 등 여러 분야에 대한 개혁의 필요성과 함께 실천 방안을 제시한 책이다. 이번에 보물로 지정된 『북학의』는 저자가 원고를 직접 쓰고 엮었다는 점, 박지원의 친필 서문이 함께 남아 있다는 점에서 그 가치를 인정받았다.	\N	4	공식 해설 없음	["양명학을 연구하여 강화학파를 형성하였다.", "기기도설을 참고하여 거중기를 설계하였다.", "역대 명필을 연구하여 추사체를 창안하였다.", "규장각 검서관으로 무예도보통지 편찬에 참여하였다.", "지부복궐척화의소를 올려 왜양일체론을 주장하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
d57df2d9-5d34-45c0-a571-bb94150b10c8	ed346940-28ba-4328-a47e-dcda8c32ad57	27	(가) 지역에 대한 탐구 활동으로 가장 적절한 것은? [1점] 고구려비를 품은 의 역사를 걷다 (가) ▣ : 2026년 ◯◯ 월 ◯◯ 일 16:00 ~ 20:00 일시 ▣ 답사 경로 석석 공 층층 민 충 탑탑 칠칠 충 렬 (( 중중 임 사 리리 앙앙 평평 탑탑 탑탑 )) 지 미 원 대 탄 륵 대 금	\N	5	공식 해설 없음	["이괄이 반란을 일으킨 근거지를 알아본다.", "김정희가 세한도를 그린 유배지를 검색한다.", "정약전이 자산어보를 저술한 곳을 조사한다.", "강주룡이 고공 농성을 벌인 을밀대의 위치를 찾아본다.", "김윤후가 노비 등을 이끌고 몽골군을 격퇴한 장소를 (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
56d2ee1f-9960-41f2-abcc-191d9618f1ae	ed346940-28ba-4328-a47e-dcda8c32ad57	28	다음 자료에 나타난 상황 이후의 사실로 옳은 것은? [2점] 진주 안핵사 박규수가 상소하였는데 대략 이르기를, “난민들이 스스로 죄에 빠진 것은 반드시 이유가 있을 것입니다. …… 살을 베어 내고 뼈를 깎는 것 같은 고통은 환곡과 향곡이 으뜸입니다. 진주에서 허위로 부과한 세금에 대해서는 이미 조사 결과를 임금께 아뢰었습니다. …… 병들어 가는 것은 우리 백성들뿐입니다.”라고 하였다.	\N	3	공식 해설 없음	["홍경래 등이 봉기하여 정주성을 점령하였다.", "신돈이 중심이 되어 전민변정 사업을 운영하였다.", "삼정의 문란을 시정하고자 삼정이정청이 설치되었다.", "기금의 이자로 빈민을 구휼하는 제위보가 만들어졌다.", "황사영이 외국 군대의 출병을 요청하는 백서를 작성하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
789b3c61-32c8-4b97-8256-c6efaf696832	ed346940-28ba-4328-a47e-dcda8c32ad57	29	다음 자료에 나타난 사건의 배경으로 가장 적절한 것은?[ 2점] 적들이 성벽 아래에 당도하였다. 우리 군사들이 일제히 총을 쏘니, 그 소리가 천지를 진동하고 탄환이 빗발치듯 쏟아졌다. 적들은 우리의 매복을 전혀 예상치 못하다가, 갑자기 쏟아지는 탄환에 맞아 쓰러지는 자가 속출하였다. 적들은 더 이상 버티지 못하고 무너져 흩어졌다. 양헌수는 즉시 순무영에 승전보를 띄워 보냈다. “오늘 적병이 정족산성을 침범하였으나 우리 군사가 일제히 사격하여 물리쳤습니다. 적들은 사상자를 이끌고 도주하였습니다.”	\N	4	공식 해설 없음	["운요호가 강화도와 영종도를 공격하였다.", "오페르트가 남연군 묘 도굴을 시도하였다.", "교조 신원을 요구하는 보은 집회가 열렸다.", "병인박해로 천주교 신부와 신자들이 처형되었다.", "김홍집이 가지고 온 조선책략이 조선에 유포되었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
960a4772-cd4a-4461-af46-3397c9592cd9	ed346940-28ba-4328-a47e-dcda8c32ad57	30	밑줄 그은 ‘이 개혁’의 내용으로 옳은 것은? [3점] 이 자료는 조선 정부에서 발행한 관보 제214호 이다. 관보의 내부(內部) 고시는 이 개혁에 따라 시행된 단발령을 알리는 내용으로, 국왕이 먼저 단 발 을 행 하 였 으 니 백 성 에 게 이 를 따 르 라 고 하고 있 다 . 한 편 , 관 보 에 사 용 된 연 호 인 건 양 은 국 모 시 해 사 건 이 후 추 진 된 이 개 혁 의 일 환 으 로 태 양 력 이 도 입 되 면 서 새 로 정 한 것 이 다 .	\N	3	공식 해설 없음	["박문국을 두어 한성순보를 발행하였다.", "근대식 무기 제조 시설인 기기창을 설립하였다.", "군제를 개편하여 친위대와 진위대를 설치하였다.", "공사 노비법을 혁파하고 과부의 재가를 허용하였다.", "비변사를 혁파하여 의정부와 삼군부의 기능을 회복하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
2213053b-d625-4601-b74f-d20f5157d5af	ed346940-28ba-4328-a47e-dcda8c32ad57	31	(가) 사건에 대한 설명으로 옳은 것은? [2점] 이 사진은 퍼시벌 로웰이 찍은 묄렌도르프의 집입니다. 본래 선혜청 당상 민겸호의 집이었으나, 그가 때 피살되자 고종이 묄렌도르프에게 (가) 하사한 것입니다. 을/를 진압한 청의 추천을 받아 조선의 외교 (가) 고문으로 부임한 묄렌도르프는 이 집을 서양식으로 개축하여 사용하였습니다.	\N	2	공식 해설 없음	["김옥균 등 개화파가 주도하였다.", "제물포 조약이 체결되는 계기가 되었다.", "전개 과정에서 홍범 14조가 반포되었다.", "통리기무아문이 설치되는 배경이 되었다.", "외규장각 도서가 약탈되는 결과를 가져왔다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
e252b051-5b10-496b-864a-7c20bd99cc20	ed346940-28ba-4328-a47e-dcda8c32ad57	32	밑줄 그은 ‘이 지역’에서 전개된 민족 운동에 대한 설명으로 옳은 것은? [2점] 포와유람기는 현순이 이 지역의 호놀룰루 등에서 체류한 경험을 바탕으로 쓴 견문록입니다. 이 책에는 20세기 초 사탕수수 농장에 도착한 포와(布哇)라고 초기 한인 이민자들의 생활 모습이 잘 나타나 있으며, 불렸던 이 지역의 지리, 역사, 문화 등이 기록되어 있습니다. 포와유람기	\N	3	공식 해설 없음	["한인 자치 기구인 경학사를 조직하였다.", "한인 교육을 위해 박달 학원을 설립하였다.", "무장 투쟁을 위해 대조선 국민 군단을 결성하였다.", "유학생을 중심으로 2·8 독립 선언서를 발표하였다.", "대한 광복군 정부를 중심으로 무장 독립 투쟁을 준비하였다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
0b10926c-03cc-412d-a55f-3a0a5614c9a8	ed346940-28ba-4328-a47e-dcda8c32ad57	33	다음 자료에 나타난 조약에 대한 설명으로 옳은 것은? [1점] 한국사 교실 수행 과제: 오 늘 학습한 조약과 관련된 자료를 조사하여 사진과 설명을 올려 주세요. ○○○ □□□ △△△ 민영환 중명전 자신회 대한 제국 시기 황실 일제의 강요로 조약이 나철, 오기호 등이 조약 도서관 등으로 이용 에 찬성한 다섯 명의 체결되자 이에 항거하는 되었던 곳으로 조약이 대신들을 처단하기 뜻으로 유서를 남기고 위해 조직함. 강제로 체결된 장소임. 자결함.	\N	2	공식 해설 없음	["청의 알선으로 체결이 추진되었다.", "통감부가 설치되는 결과를 가져왔다.", "천주교 포교를 허용하는 근거가 되었다.", "스티븐스가 외교 고문으로 부임하는 계기가 되었다.", "대한 제국 군대의 해산을 규정하는 내용이 포함되어 있다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
8c75d151-2783-4b69-8fc5-88d1f7594451	ed346940-28ba-4328-a47e-dcda8c32ad57	34	(가) 단체에 대한 설명으로 옳은 것은? [2점] 특별 전시 국외 독립운동의 숨은 주역, 안태국을 기억하다 (가) 우리 기념관에서는 에서 운영한 태극 서관의 주임 등을 맡았던 안태국의 공훈을 기리는 특별전을 마련하였습니다. 그는 안창호, (가) 양기탁 등을 중심으로 비밀리에 결성된 에서 국외 독립군 기지 건설을 위해 군자금 모금과 이주민 모집 등에 힘썼습니다. 그의 활동을 알 수 있는 자료들을 준비하였으니 많은 관심 바랍니다. •기간: 2026년 월 일 ~ 월 일 •장소: △△ 기념관 특별 전시실 •전시  점 자료: 안태국 장례식 사진 등	\N	2	공식 해설 없음	["만세보를 발행하였다.", "대성 학교를 설립하였다.", "만민 공동회를 개최하였다.", "부민관 폭파 의거를 계획하였다.", "일제의 황무지 개간권 요구를 저지하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
f1fe910f-f15b-4abf-ad8c-88ffea313bc9	ed346940-28ba-4328-a47e-dcda8c32ad57	35	밑줄 그은 ‘이 학교’에 대한 설명으로 옳은 것은? [3점] 주제: 근대 교육의 도입 사민필지는 영어, 산학, 지리 등을 미국인 헐버트가 주요 과목으로 개설한 이 학교의 교사 시절 한글로 이 학교에서 사용했던 지은 세계 지리서입니다. 교과서입니다.	\N	5	공식 해설 없음	["7재라는 전문 강좌가 있었다.", "덕원부 관민이 합심하여 만들었다.", "교육입국 조서에 근거하여 세워졌다.", "주요 건물로 대성전과 명륜당을 두었다.", "좌원과 우원을 구분하여 학생을 선발하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
98332a7b-4ba2-40a0-b988-8cbd518c95e9	ed346940-28ba-4328-a47e-dcda8c32ad57	36	밑줄 그은 ‘이 단체’에 대한 설명으로 옳은 것은? [2점] 나석주 의사는 일제의 기관 파괴와 요인 이 자료는 나석주 의사가 암살 등을 목적으로 조직된 이 단체의 조선 식산 은행과 동양 척식 단원으로 활동했습니다. 그는 경제 수탈의 주식회사에 폭탄을 던진 상징인 두 기관에 폭탄을 투척하여 일제에 사건을 다룬 기사입니다. 큰 충격을 주었습니다. 기사에는 당시 이에 대해 설명해 주세요. 의거의 현장을 보여주는 사진과 사상자 명단 등이 담겨 있습니다.	\N	4	공식 해설 없음	["고종의 강제 퇴위에 반대하는 시위를 주도하였다.", "조선 총독부에 국권 반환 요구서를 제출하려 하였다.", "독립운동 자금 마련을 위해 독립 공채를 발행하였다.", "신채호가 쓴 조선 혁명 선언을 활동 지침으로 삼았다.", "신규식을 중심으로 조직되어 교민들의 단결을 도모하였다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
60a99458-145b-46c6-b2c5-62fe83f0c0c6	ed346940-28ba-4328-a47e-dcda8c32ad57	37	밑줄 그은 ‘이 정책’이 실시된 시기에 볼 수 있는 모습으로 가장 적절한 것은? [1점] 오전 11:00 80% 사진과 함께하는 역사 - 임시 토지 조사국 한국사 채널 史 조회수 150,423 이 사진은 임시 토지 조사국 청사입니다. 임시 토지 조사국은 일제가 식민 지배를 위한 경제적 기반 마련 등을 목적으로 이 정책을 추진하면서 설치한 기구입니다. 이 기구는 토지의 조사 및 측량, 지적도와 토지 대장 작성 등을 수행하였습니다.	\N	1	공식 해설 없음	["태형을 집행하는 헌병 경찰", "원수부에서 업무를 처리하는 관리", "몸뻬 착용을 홍보하는 애국반 반장", "경인선 개통식에 참석하는 일본인 거류민", "나운규가 감독한 아리랑의 첫 상영을 준비하는 단성사 직원"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
7c4e8308-c240-40fb-bc7f-4e92393e6edb	ed346940-28ba-4328-a47e-dcda8c32ad57	38	(가) 단체의 활동으로 옳은 것은? [2점] 조선인 운동은 민족 운동으로 또는 사회 운동으로 표면과 이면에서 그침 없이 계속하여 오다가, 조선 민족의 총역량을 집중 하여 민족 단일당 결성을 촉진하며 이/가 조직되었다. (가) 각도 각지에서는 지회가 속속 설치되었다. …… 은/는 (가) 민중 대회를 준비하다가 발각되어 타격을 입은 이후 해소라는 새 기록을 남기고 5년간 걸어 온 자취를 청산하는 동시에 새로운 방향으로 걸음을 전환하였다.	\N	5	공식 해설 없음	["개벽, 신여성 등의 잡지를 발행하였다.", "중추원 개편을 통해 의회 설립을 추진하였다.", "군사 조직으로 한인 국방 경위대를 창설하였다.", "순종의 인산일을 기회로 만세 운동을 계획하였다.", "광주 학생 항일 운동에 진상 조사단을 파견하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
b4c0a3ea-f7ec-4ab9-9c7d-c29be12f7e12	ed346940-28ba-4328-a47e-dcda8c32ad57	39	교사의 질문에 대한 학생의 답변으로 가장 적절한 것은?[ 2 점] 이 기사는 일제의 정책으로 인해 피해를 입은 농촌의 모습을 다루고 있습니다. 대공황 이후 일제는 공업 원료 등을 확보하기 위해 한반도 남부 지방에 면화 재배를 확대하는 정책을 추진하였습니다. 이 정책이 시행된 시기에 있었던 사실을 말해볼까요? 일제의 강압적 면화 재배 일제가 강제하여 경작한 면화 장려에 경주의 농민 수백 명이 밭이 해충으로 피해를 입자 경북 궐기함. 농가의 민심이 악화함.	\N	5	공식 해설 없음	["조선 민립 대학 기성회가 조직되었어요.", "메가타의 주도로 화폐 정리 사업이 시행되었어요.", "귀속 재산 관리를 위해 신한 공사가 운영되었어요.", "회사 설립을 허가제로 하는 회사령이 공포되었어요.", "농민의 자력갱생을 내세운 농촌 진흥 운동이 추진되었어요."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
662b02f6-e5ba-430f-9e71-61b68d72ab34	ed346940-28ba-4328-a47e-dcda8c32ad57	40	(가)에 들어갈 내용으로 옳은 것은? [3점] 공연 초대장 대중가요의 역사를 찾아서 일제 강점기는 라디오와 축음기가 보급 되면서 대중가요가 확산된 시기였습니다. 우리 오케스트라에서는 당시 발매되었던 대중가요를 관현악으로 편곡한 공연을 준비하였습니다. 식민지 시기를 살아간 우리 민족의 다양한 감정을 느낄 수 있는 자리에 여러분을 초대합니다. ◈ 공연 작품 ◈ 가수, 노래 제목 소개 이애리수, 황성옛터 고려의 옛 궁터 만월대의 텅 빈 밤과 서정 비극적인 삶으로 빚어낸 염세와 허무 (가) 고복수, 타향살이 고향을 떠나 살게 된 이들의 짙은 향수 이난영, 목포의 눈물 항구를 배경으로 그리는 이별과 눈물의 정서 ◯ ◯월 ◯ ◯일 ■ 일시: 2 026년 19:00 ■ 장소: △△ 문화 예술 회관   ■ 출연: 오케스트라	\N	2	공식 해설 없음	["김민기, 아침 이슬", "윤심덕, 사의 찬미", "현인, 굳세어라 금순아", "코리아나, 손에 손 잡고", "이해연, 단장의 미아리 고개 (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
8a011a37-c3c1-4ffd-83c1-3287a6b935d3	ed346940-28ba-4328-a47e-dcda8c32ad57	41	밑줄 그은 ‘이 부대’에 대한 설명으로 옳은 것은? [2점] 국민부는 중국의 반일 단체와 연락을 취하여 대규모 항일 행동을 계획하였지만, 각지의 일본 경관대에게 단원이 검거되고 무기를 압수당하여 세력이 꺾였다. 그러나 당시 이를 피한 양세봉, 양하산 등 주요 인물이 흩어졌던 단원을 모아 국민부 산하의 무장 단체를 재편하여 행동을 재개하였다. 총사령관 양세봉의 지휘 아래 이 부대는 대도회 등과 함께 한중 연합군을 편성하여 소양구에 이어 영릉가를 점령하였다.	\N	1	공식 해설 없음	["흥경성 전투에서 일본군을 격퇴하였다.", "일본군의 공세를 피해 자유시로 이동하였다.", "이른바 남한 대토벌 작전으로 큰 피해를 입었다.", "영국군의 요청으로 인도·미얀마 전선에 파견되었다.", "한국인 유격대를 중심으로 조국 광복회를 조직하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
230ad769-9253-4aac-9214-eb2082de0b4a	ed346940-28ba-4328-a47e-dcda8c32ad57	42	(가)에 들어갈 내용으로 옳은 것은? [3점] 어느 독립운동가의 주요 행적 ~ 는 시간 순 1 4 충칭 4 상하이 1 삼균주의에 바탕을 둔 주권이 국민에게 있음을 대한민국 임시 정부 건국 밝힌 대동단결 선언 강령 초안을 작성함. 작성에 참여함. 항저우 2 난징 3 윤봉길의 상하이 훙커우 공원 의거 이후 일제의 (가) 탄압을 피해 머무름.	\N	5	공식 해설 없음	["흥사단을 창립함.", "이토 히로부미를 사살함.", "한국독립운동지혈사를 저술함.", "한국 독립군의 총사령관으로 활약함.", "김원봉 등과 함께 민족 혁명당을 결성함."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
be53c67b-4220-4cc2-8db1-0a2a4bb2dddf	ed346940-28ba-4328-a47e-dcda8c32ad57	43	(가)에 들어갈 내용으로 가장 적절한 것은? [2점] 한국사 교양 강좌 기념일에 담긴 일제 강점기 사회ㆍ문화 우리 학회에서는 일제 강점기의 힘든 현실 속에서도 우리 민족이 기리기 시작한 기념일을 중심으로 당시의 사회와 문화를 살펴보는 강연을 마련하였습니다. 많은 관심과 참여 바랍니다. [제1강] 어 린이날 - 어린이에게서 민족의 미래를 보다 [제2강] 메 이데이 - 고등 경찰의 경계 속에 첫 노동절 행사가 열리다 [제3강] 과 학 데이 - 과학의 대중화를 촉진하다 (가) [제4강] ◯ ◯월 ◯ ◯일 ● 일시: 2026년 10:00~16:00   ● 장소: 학회 소회의실	\N	2	공식 해설 없음	["제헌절 – 첫 헌법 제정의 의미를 강조하다", "가갸날 – 우리 말과 글의 소중함을 되새기다", "향토 예비군의 날 – 범국민적인 안보의식을 조성하다", "은사의 날 – 스승을 향한 감사와 공경의 마음을 전하다", "이산가족의 날 - 이산가족 문제에 대한 관심을 제고하다"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
5615ab20-79dd-4809-9e88-11b33019eb96	ed346940-28ba-4328-a47e-dcda8c32ad57	44	밑줄 그은 ‘시기’에 볼 수 있는 모습으로 가장 적절한 것은? [1점] 이곳은 인천 부평에 위치한 일본 육군 조병창입니다. 일제가 국가 총동원법을 시행한 시기에 전쟁 무기 생산을 목적으로 설치되었습니다. 또한 학도 동원 실시 요강에 따라 학생들이 강제로 동원된 곳이기도 했습니다.	\N	4	공식 해설 없음	["원산 총파업에 동참하는 노동자", "국채 보상 운동에 성금을 내는 상인", "원각사에서 연극 은세계를 공연하는 배우", "황국 신민 서사를 암송하는 국민학교 학생", "조선 형평사 창립 대회 현장을 취재하는 기자 (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
ac138e44-ad79-4446-b4a9-1f686c5051db	ed346940-28ba-4328-a47e-dcda8c32ad57	45	다음 자료를 활용한 탐구 활동으로 가장 적절한 것은? [2점] 농민이나 지주나 간에 중대한 위기에 봉착하고 있다. 농민은 평년 수확의 절반가량을 세금 등으로 납부하게 됨으로써 자가에서 소비할 식량도 확보할 수 없는 지경으로 우선 굶어 죽을 수는 없으니 상환을 연기하든지 분배를 취소하여 달라고 호소하고 있다. 지주 측에서는 토지 자본을 산업 자본으로 활용하기는커녕 정조(正租) 1석당 5만 8천여 원이라는 엄청난 헐값으로 환산된 지가 증권마저 액면의 5할 또는 4할이라는 시세로 매각하거나, 전년도에 받아야 할 상환금을 다음 해가 되어도 다 받지 못하고 한 달에 60만 원씩 지불받기로 한 것마저 받지 못하고 있다.	\N	1	공식 해설 없음	["농지 개혁의 전개 과정을 알아본다.", "광주 대단지 사건의 결과를 파악한다.", "개발 제한 구역 설정의 목적을 찾아본다.", "산미 증식 계획의 추진 배경을 분석한다.", "지계아문이 추진한 정책의 내용을 조사한다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
1349a1a9-3cfe-4963-b323-256ce76d7078	ed346940-28ba-4328-a47e-dcda8c32ad57	46	(가) 인물에 대한 설명으로 옳은 것은? [2점] 이 자료는 미소 공동 위원회 미국 대표단 정치고문단 소속인 L. M. 버치 중위가 좌우 합작을 주도한 을/를 추모하며 남긴 연설문입니다. (가) 엔도 정무총감과의 회담에서 사회 안정에 관한 요구 사항을 관철하는 등 해방 정국을 주도하던 이/가 암살되자, 버치 중위는 존경의 (가) 의미를 담아 한국어 발음을 알파벳으로 표기한 연설문을 작성하였습니다. - 돌아 위대한 가신 - 선생님에 대하여 나는 한마디 조선말로 하겠습니다. 그는 영원히 침묵의 갔습니다. 나라로 돌아 - … 그러나 그의 친구와	\N	1	공식 해설 없음	["광복에 대비하여 조선 건국 동맹을 결성하였다.", "대한민국 임시 정부 초대 국무총리를 역임하였다.", "정읍에서 남한만의 단독 정부 수립을 주장하였다.", "헤이그에서 열린 만국 평화 회의에 특사로 파견되었다.", "민족을 역사 서술의 중심에 둔 독사신론을 발표하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
b89c5169-e77c-4a54-89b4-9f8b3856a212	ed346940-28ba-4328-a47e-dcda8c32ad57	47	(가) 정부 시기에 있었던 사실로 옳은 것은? [3점] 이것은 정부가 작성한 행정 수도 건설 계획의 일부입니다. (가) 수출 100억 달러를 처음으로 달성하는 등 경제 성장을 이룬 (가) 정부는 수도권 인구 과밀화 억제 등을 내세우며 행정 수도의 건설 계획을 발표했습니다. 당시 충남 공주시 장기면을 중심으로 연기군 일부까지 건설 대상 지역에 포함되어 있는 것을 확인할 수 있습니다.	\N	2	공식 해설 없음	["최저 임금 위원회가 설치되었다.", "포항 제철소 1기 설비가 준공되었다.", "전국 민주 노동조합 총연맹이 창립되었다.", "칠레와의 자유 무역 협정(FTA)이 체결되었다.", "경제 협력 개발 기구(OECD) 회원국이 되었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
a4e753a7-5a62-435f-9c84-5494b75ebe63	ed346940-28ba-4328-a47e-dcda8c32ad57	48	다음 대화에 나타난 사건 이후에 전개된 사실로 옳은 것은? [2점] 김영삼 김영삼이 또한 신민당사에서 신민당 총재가 뉴욕 타임스와 농성하던 YH 무역 국회의원 최초로 인터뷰한 내용이 노동자들을 강제로 진압한 제명된 사건이 문제가 되었습니다. 정부를 비판한 것도 있었네요. 이유였습니다.	\N	2	공식 해설 없음	["애치슨 라인이 발표되었다.", "부마 민주 항쟁이 일어났다.", "사사오입의 논리로 개헌안이 통과되었다.", "반민족 행위 특별 조사 위원회가 해체되었다.", "민의원, 참의원으로 구성된 양원제 국회가 탄생하였다. (심화)"]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
c5da446d-32d7-4dbc-9140-9e42c9b0c8af	ed346940-28ba-4328-a47e-dcda8c32ad57	49	밑줄 그은 ‘이 정부’ 시기에 있었던 사실로 옳은 것은? [2점] 오늘도 보도 지침이 내려왔군. 이 정부의 언론 통제는 언제까지 계속되려나. 보도 지침 ◎ 대 학생들, 주한 미상공회의소 점거. 오후 1시 8분에 경찰에 모두 연행 기사	\N	2	공식 해설 없음	["헝가리에 상주 대표부가 설치되었다.", "박종철 고문 치사 사건이 발생하였다.", "평화 통일을 주장한 조봉암이 처형되었다.", "대통령 긴급 명령으로 금융 실명제가 실시되었다.", "서울역에서 청량리역 간에 서울 지하철 1호선이 개통되었다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
568aca58-1ed1-43f2-aa05-bb031ee773f7	ed346940-28ba-4328-a47e-dcda8c32ad57	50	(가)~(마)에 해당하는 왕에 대한 설명으로 옳은 것은? [2점] 이달의 역사 용어 천도(遷都) 천도란 국가의 ‘수도’를 다른 지역으로 옮기는 것을 뜻한다. 우리 역사에서 대표적인 천도 사례는 다음과 같다. 고구려는 427년 이/가 평양으로 수도를 옮겼다. (가) 백제는 475년 한성이 함락되자 같은 해에 이/가 (나) 웅진으로 천도하였고, 538년 은/는 사비로 (다) 천도하였다. 한편, 신라는 통일 후 달구벌로 천도를 계획 하였으나 실행하지 못하였다. 발해는 중경 현덕부, 상경 용천부 등지로 여러 차례 천도하였다. 고려는 몽골이 침입하자 1232년 최우의 건의로 이/가 강화도로 천도하여 대몽 항쟁을 벌이다가 (라) 1270년 원종 때 개경으로 환도하였다. 조선은 1394년 이/가 한양으로 천도를 단행하였다. 한양은 (마) 왕자의 난 이후 개성을 수도로 삼았던 수년을 제외하고, 500여 년간 조선 왕조의 수도였다.	\N	3	공식 해설 없음	["(가) - 서안평을 공격하여 영토를 확대하였다.", "(나) - 소지 마립간과 혼인 동맹을 맺었다.", "(다) - 국호를 남부여라 칭하였다.", "(라) - 쌍성총관부를 수복하였다.", "(마) - 경국대전을 완성하였다."]	{}	\N	\N	\N	f	https://www.historyexam.go.kr
\.


--
-- Data for Name: user_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_answers (id, user_exam_result_id, question_id, selected_choice, is_correct, answered_at) FROM stdin;
\.


--
-- Data for Name: user_exam_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_exam_results (id, user_id, exam_id, score, submitted_at, total_answers, correct_answers, time_taken_seconds) FROM stdin;
\.


--
-- Data for Name: user_login_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_login_logs (id, user_id, login_at) FROM stdin;
dad060ef-463a-4d79-bad9-4cfc6120929d	ed58dc98-b840-4fe0-b0cc-12f5821ad820	2026-05-21 07:20:04.691218
c65f6fc5-0b40-4e88-9c28-e4cd6a281739	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 07:22:30.990861
ca82dc95-c9ed-4d0c-9a50-4765a48447ba	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 07:25:28.129698
ee7f7333-dbbc-4a06-aa7e-03d32cd6e888	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 07:27:51.069994
fee2db46-e629-46d4-9b1b-13f885006b7e	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:10:18.574537
dd2a6823-3bae-45de-afdf-8000fb847d1a	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:10:18.752218
8679e504-0533-4a7b-975e-c6806d30e762	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:18:19.773607
87b78559-190f-488e-8c65-ab347e23cec6	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:31:09.77887
7cc58b94-6b00-49dc-a2f5-606a5ffff649	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:31:22.894177
10787677-ce9b-4ce3-a75e-c44161bfa9e2	ad93f124-75d5-49a5-9b8f-14616c87e06e	2026-05-21 08:31:40.865418
24587f1b-d95b-471c-92f7-915e734fa2b2	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 08:35:42.713479
bb3e8937-ac98-4965-8699-da8482af0e3f	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 09:42:11.199893
86db6853-3328-4e10-9aa1-fc8936c0bb0b	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 13:39:57.739121
3072d039-8e40-4a1b-82cf-44fd44297504	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 15:48:53.076468
0c0a29e8-6f98-4f72-8455-25ad1fce3444	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:03:59.832756
3cfb7c34-f1b5-4800-85d7-626ba7a1a00f	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:06:49.390274
3b91987f-ece0-4bf7-9654-ccbeacf24d43	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:12:29.081401
316fbcf5-1e73-4ac6-8bab-cdafd39ac33a	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:23:54.452107
b88290de-1116-415e-b404-218f192c7e92	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:34:38.10102
5193c193-6103-4860-80b1-1ed78a8c252e	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-21 16:43:08.347946
378e97c3-bbd5-4529-a827-ec0b37d1c69d	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 01:40:29.485206
135aaac1-41f8-4abf-a698-9f50e34b4dd3	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 02:17:57.436059
ff7ee2bf-4b82-4e11-b49e-a8888f7012d1	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 02:24:20.211897
71e3d73f-c98b-46a5-a05e-ac2eecd0ecf0	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 03:32:03.374288
af9c6515-07ca-48f5-95c5-2d2be8a35114	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 04:29:46.288458
bf40902e-a9c1-41c9-a179-596609bfece7	0ad5aea7-db70-4666-b21e-265a090fb5e2	2026-05-22 04:31:50.201349
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, created_at, deleted_at) FROM stdin;
ed58dc98-b840-4fe0-b0cc-12f5821ad820	testuser@example.com	$2b$10$BiPHZwGn7PfuM6xtdBR64uhPYiGvA3gnpwi6o/0wKK7PjY4JWyZ2a	general	2026-05-21 07:20:00.322789	\N
0ad5aea7-db70-4666-b21e-265a090fb5e2	admin@admin.com	$2b$10$v4o415yZIC7yg9Y6UnMWR.yxHFNpwy5WjEtcDKms7FNC0U8W9ofRa	admin	2026-05-20 04:36:18.28305	\N
ad93f124-75d5-49a5-9b8f-14616c87e06e	test_withdraw@test.com	$2b$10$87B6pJNdOqE.sgGnMqXz.uSBNBtiuouEAMua6QsSmR4lnC8P37feu	general	2026-05-21 08:31:37.549608	2026-05-21 08:31:43.303748
\.


--
-- Name: exam_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exam_notifications_id_seq', 1, false);


--
-- Name: exam_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exam_schedules_id_seq', 4, true);


--
-- Name: user_answers PK_08977c1a2a5f1b8b472dbd87d04; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT "PK_08977c1a2a5f1b8b472dbd87d04" PRIMARY KEY (id);


--
-- Name: questions PK_08a6d4b0f49ff300bf3a0ca60ac; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY (id);


--
-- Name: materials PK_2fd1a93ecb222a28bef28663fa0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT "PK_2fd1a93ecb222a28bef28663fa0" PRIMARY KEY (id);


--
-- Name: user_exam_results PK_33bc5aca7904a36ea590d7d3355; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exam_results
    ADD CONSTRAINT "PK_33bc5aca7904a36ea590d7d3355" PRIMARY KEY (id);


--
-- Name: exam_notifications PK_35fe8a15e6a6df11ed61ff4fdf6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_notifications
    ADD CONSTRAINT "PK_35fe8a15e6a6df11ed61ff4fdf6" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: exams PK_b43159ee3efa440952794b4f53e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT "PK_b43159ee3efa440952794b4f53e" PRIMARY KEY (id);


--
-- Name: exam_schedules PK_b82964d842a1e15774841dbc30f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT "PK_b82964d842a1e15774841dbc30f" PRIMARY KEY (id);


--
-- Name: user_login_logs PK_bcad8136a91a5fdba07ea1284f7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_logs
    ADD CONSTRAINT "PK_bcad8136a91a5fdba07ea1284f7" PRIMARY KEY (id);


--
-- Name: inquiry_comments PK_cd93fd2bde44f21d8a3f735731f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_comments
    ADD CONSTRAINT "PK_cd93fd2bde44f21d8a3f735731f" PRIMARY KEY (id);


--
-- Name: inquiries PK_ceacaa439988b25eb9459e694d9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT "PK_ceacaa439988b25eb9459e694d9" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: inquiry_comments FK_1101428b5a2a75117f738e06d6c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_comments
    ADD CONSTRAINT "FK_1101428b5a2a75117f738e06d6c" FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id) ON DELETE CASCADE;


--
-- Name: user_answers FK_128e024ae06b982fcdb5ddf3fe3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT "FK_128e024ae06b982fcdb5ddf3fe3" FOREIGN KEY (user_exam_result_id) REFERENCES public.user_exam_results(id) ON DELETE CASCADE;


--
-- Name: user_exam_results FK_528b4e3aed2f5047619596e1144; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exam_results
    ADD CONSTRAINT "FK_528b4e3aed2f5047619596e1144" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: inquiry_comments FK_5a7b60fbb0cf638e989e93d9de2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_comments
    ADD CONSTRAINT "FK_5a7b60fbb0cf638e989e93d9de2" FOREIGN KEY (parent_id) REFERENCES public.inquiry_comments(id) ON DELETE CASCADE;


--
-- Name: user_exam_results FK_7befdd74dea5f03e3558d14b583; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exam_results
    ADD CONSTRAINT "FK_7befdd74dea5f03e3558d14b583" FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_notifications FK_7ee8fe5350963ffc7e0f784d859; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_notifications
    ADD CONSTRAINT "FK_7ee8fe5350963ffc7e0f784d859" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inquiries FK_a896a1864d60d5707403e0a0810; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT "FK_a896a1864d60d5707403e0a0810" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_answers FK_adae59e684b873b084be36c5a7a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT "FK_adae59e684b873b084be36c5a7a" FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: exam_notifications FK_b9c78251480de0f8c5eae0b32b8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_notifications
    ADD CONSTRAINT "FK_b9c78251480de0f8c5eae0b32b8" FOREIGN KEY (schedule_id) REFERENCES public.exam_schedules(id) ON DELETE CASCADE;


--
-- Name: inquiry_comments FK_ba1590c307c6d3e0383134862fc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_comments
    ADD CONSTRAINT "FK_ba1590c307c6d3e0383134862fc" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_login_logs FK_f8379df7d627c940c12d301485a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_logs
    ADD CONSTRAINT "FK_f8379df7d627c940c12d301485a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: questions FK_f912d2c24bc84f66e0a40b1c169; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ILRpgu5VVsnX9eVxkbciBem7sadOQk7f7k5TNuT0lFlVolIdtfO3XdXyxsNuVGu

