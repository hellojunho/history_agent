import os
import json
import re
import pdfplumber

DOWNLOAD_DIR = "download"

def extract_text_by_columns(page):
    """컬럼을 물리적으로 나누어 텍스트가 섞이는 것을 원천 차단"""
    width = page.width
    height = page.height
    
    # 좌우 컬럼을 명확히 분리 (중앙 여백 10px 확보)
    left_bbox = (0, 0, width / 2 - 5, height)
    right_bbox = (width / 2 + 5, 0, width, height)
    
    # 텍스트 추출 시 y좌표 기준으로 정렬되도록 설정
    left_text = page.within_bbox(left_bbox).extract_text(x_tolerance=2, y_tolerance=2) or ""
    right_text = page.within_bbox(right_bbox).extract_text(x_tolerance=2, y_tolerance=2) or ""
    
    return left_text + "\n" + right_text

def clean_line(line):
    if not line: return ""
    # 헤더/푸터 및 불필요한 시험 정보 제거
    line = re.sub(r'제\d+회 한국사능력검정시험.*$', '', line)
    line = re.sub(r'능력검정시험 문제지.*$', '', line)
    line = re.sub(r'검정시험\s*\(심화\).*$', '', line)
    line = re.sub(r'^\d+\s+\d+$', '', line)
    line = re.sub(r'^\d+$', '', line)
    return line.strip()

def parse_answers_from_pdf(pdf_path):
    answers = {}
    print(f"📄 정답지 '{pdf_path}' 파싱을 시작합니다...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            all_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text: all_text += text + "\n"
            
            # 숫자 뒤에 ①~⑤ 가 오는 패턴
            matches = re.finditer(r'(?<!\d)(\d{1,2})\s*([①②③④⑤])', all_text)
            for m in matches:
                q_num = int(m.group(1))
                ans_char = m.group(2)
                if 1 <= q_num <= 50:
                    answers[q_num] = "①②③④⑤".index(ans_char) + 1
    except Exception as e:
        print(f"⚠️ 정답지 파싱 중 오류 발생: {e}")
    return answers

def create_question_obj(num, text_lines, raw_options, answers_dict):
    options = ["", "", "", "", ""]
    
    # 문제 텍스트 정제 (의미 없는 빈 줄 제거)
    q_text_lines = [l for l in text_lines if l.strip()]
    
    if raw_options:
        full_options_text = " ".join(raw_options)
        # ①~⑤ 기준으로 분할
        parts = re.split(r'([①②③④⑤])', full_options_text)
        
        # 첫 번째 기호(①) 앞에 텍스트가 있다면 이는 지문의 마지막 부분
        if len(parts) > 0 and parts[0].strip():
            q_text_lines.append(parts[0].strip())
            
        parsed_opts = []
        for i in range(1, len(parts), 2):
            if i + 1 < len(parts):
                content = parts[i+1].strip()
                content = re.sub(r'\s+', ' ', content)
                # 하단 잡음 제거
                content = re.sub(r'제\d+회 한국사.*$', '', content).strip()
                if content:
                    parsed_opts.append(content)
        
        for i in range(5):
            if i < len(parsed_opts):
                options[i] = parsed_opts[i]
            else:
                options[i] = "이미지 보기 (텍스트 없음)" if not options[i] else options[i]

    correct_ans = answers_dict.get(num, 1)
    
    return {
        "questionNumber": num,
        "questionText": " ".join(q_text_lines).strip(),
        "imageUrls": [],
        "score": 2,  
        "options": options,
        "correctOption": correct_ans,
        "explanation": "공식 PDF 자료에는 해설이 제공되지 않습니다."
    }

def process_round_dir(round_dir_name):
    round_path = os.path.join(DOWNLOAD_DIR, round_dir_name)
    q_dir = os.path.join(round_path, "question")
    a_dir = os.path.join(round_path, "answer")
    if not os.path.isdir(q_dir): return
    
    q_files = [f for f in os.listdir(q_dir) if f.lower().endswith('.pdf')]
    a_files = [f for f in os.listdir(a_dir) if f.lower().endswith('.pdf')] if os.path.isdir(a_dir) else []
    if not q_files: return
    
    q_pdf_path = os.path.join(q_dir, q_files[0])
    a_pdf_path = os.path.join(a_dir, a_files[0]) if a_files else None
    
    exam_round = int(round_dir_name) if round_dir_name.isdigit() else 99
    exam_type = "기본" if "기본" in q_pdf_path else "심화"
    
    print(f"\n--- [제{exam_round}회 {exam_type}] 파싱 시작 ---")
    answers_dict = parse_answers_from_pdf(a_pdf_path) if a_pdf_path else {}
    
    all_text = ""
    with pdfplumber.open(q_pdf_path) as pdf:
        for page in pdf.pages:
            all_text += extract_text_by_columns(page)
            
    questions = []
    lines = all_text.split('\n')
    current_q_num = 0
    current_q_text = []
    current_options = []
    in_options = False
    
    for line in lines:
        cleaned = clean_line(line)
        if not cleaned: continue
        
        # 문제 번호 탐지: "숫자. "로 시작하는 경우만 새로운 문제로 인식
        q_match = re.match(r'^(\d+)\.\s+(.+)', cleaned)
        if q_match:
            # 새로운 문제를 만났을 때, 번호가 현재 번호보다 크거나 1인 경우만 교체 (잘못된 매칭 방지)
            new_num = int(q_match.group(1))
            if new_num == 1 or new_num > current_q_num:
                if current_q_num > 0:
                    questions.append(create_question_obj(current_q_num, current_q_text, current_options, answers_dict))
                
                current_q_num = new_num
                current_q_text = [q_match.group(2)]
                current_options = []
                in_options = False
                continue
            
        if current_q_num > 0:
            # 보기 기호가 있으면 보기 수집 모드로 전환
            if any(m in cleaned for m in "①②③④⑤"):
                in_options = True
            
            if in_options:
                current_options.append(cleaned)
            else:
                current_q_text.append(cleaned)

    # 마지막 문제 처리
    if current_q_num > 0:
        questions.append(create_question_obj(current_q_num, current_q_text, current_options, answers_dict))

    parsed_data = {
        "title": f"제{exam_round}회 한국사능력검정시험 {exam_type}",
        "examType": exam_type, "round": exam_round, "passingScore": 60, "questions": questions
    }
    
    out_path = os.path.join(DOWNLOAD_DIR, f"parsed_exam_{exam_round}_{exam_type}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, ensure_ascii=False, indent=2)
    print(f"🎉 제{exam_round}회 완료! ({len(questions)}문제) -> {out_path}")

if __name__ == "__main__":
    if not os.path.exists(DOWNLOAD_DIR): os.makedirs(DOWNLOAD_DIR)
    round_dirs = sorted([d for d in os.listdir(DOWNLOAD_DIR) if os.path.isdir(os.path.join(DOWNLOAD_DIR, d))])
    for r_dir in round_dirs: process_round_dir(r_dir)
