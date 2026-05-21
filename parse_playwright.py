import os
import json
import re
import pdfplumber
import fitz  # PyMuPDF
from PIL import Image

DOWNLOAD_DIR = "download"
UPLOAD_DIR = "backend/public/uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def extract_text_with_context(page):
    """
    단어의 좌표 정보를 분석하여 행 단위로 그룹화합니다.
    """
    words = page.extract_words(x_tolerance=2, y_tolerance=2)
    if not words: return []
    
    width = page.width
    # 컬럼 분할 (중앙 여백 10px 확보)
    left_words = [w for w in words if w['x1'] <= width / 2 - 5]
    right_words = [w for w in words if w['x0'] >= width / 2 + 5]
    
    def words_to_lines(word_list):
        if not word_list: return []
        word_list.sort(key=lambda x: (x['top'], x['x0']))
        
        lines = []
        curr_line_words = [word_list[0]]
        curr_top = word_list[0]['top']
        
        for i in range(1, len(word_list)):
            w = word_list[i]
            if abs(w['top'] - curr_top) < 3:
                curr_line_words.append(w)
            else:
                lines.append(curr_line_words)
                curr_line_words = [w]
                curr_top = w['top']
        lines.append(curr_line_words)
        return lines

    return words_to_lines(left_words) + words_to_lines(right_words)

def clean_content(text):
    if not text: return ""
    # 헤더/푸터 및 페이지 번호 제거
    text = re.sub(r'제\d+회 한국사능력검정시험.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'능력검정시험 문제지.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'검정시험\s*\(심화\).*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\s+\d+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    return text.strip()

def capture_option_image(pdf_path, page_num, q_num, opt_num, bbox, round_num, next_top=None):
    """
    텍스트가 없는 보기 영역을 이미지로 정밀하게 캡처하여 download/{round_num}/image/ 에 저장합니다.
    """
    try:
        doc = fitz.open(pdf_path)
        page = doc[page_num]
        width = page.rect.width
        
        # 고화질 캡처를 위한 배율 설정
        zoom = 3.0 
        mat = fitz.Matrix(zoom, zoom)
        
        # 좌우 컬럼 경계 설정 (옆 단 침범 방지)
        if bbox[0] < width / 2:
            max_x = width / 2 - 5
        else:
            max_x = width - 10
            
        # 세로 하단 경계 설정 (다음 보기 침범 방지)
        if next_top is not None:
            bottom_limit = next_top - 3
        else:
            # 다음 보기가 없다면 현재 보기 높이 기준으로 약 45px 제한 (다음 문제 침범 방지)
            bottom_limit = bbox[3] + 45
            
        capture_rect = fitz.Rect(bbox[0], bbox[1] - 3, max_x, bottom_limit)
        
        pix = page.get_pixmap(matrix=mat, clip=capture_rect)
        
        # download/{round_num}/image/ 디렉토리 생성
        image_dir = os.path.join(DOWNLOAD_DIR, str(round_num), "image")
        if not os.path.exists(image_dir):
            os.makedirs(image_dir, exist_ok=True)
            
        filename = f"{round_num}_Q{q_num}_opt{opt_num}.png"
        filepath = os.path.join(image_dir, filename)
        pix.save(filepath)
        doc.close()
        return f"download/{round_num}/image/{filename}"
    except Exception as e:
        print(f"⚠️ 이미지 캡처 실패: {e}")
        return "이미지 추출 실패"

def parse_answers_from_pdf(pdf_path):
    answers = {}
    try:
        with pdfplumber.open(pdf_path) as pdf:
            all_text = ""
            for page in pdf.pages:
                all_text += page.extract_text() + "\n"
            matches = re.finditer(r'(?<!\d)(\d{1,2})\s*([①②③④⑤])', all_text)
            for m in matches:
                q_num = int(m.group(1))
                ans_char = m.group(2)
                if 1 <= q_num <= 50:
                    answers[q_num] = "①②③④⑤".index(ans_char) + 1
    except Exception as e:
        print(f"⚠️ 정답지 파싱 중 오류 발생: {e}")
    return answers

def create_question_obj(num, text_lines, raw_option_data, answers_dict, pdf_path, page_idx, round_num):
    options = ["", "", "", "", ""]
    q_text = " ".join(text_lines).strip()
    
    marker_map = {"①": 0, "②": 1, "③": 2, "④": 3, "⑤": 4}
    
    # 보기 마커 순서대로 정렬하여 다음 보기 기호의 top 좌표 계산
    sorted_options = sorted(raw_option_data, key=lambda x: marker_map.get(x[0], 99))
    
    for i, (marker, text, bbox) in enumerate(sorted_options):
        idx = marker_map.get(marker)
        if idx is not None:
            clean_text = clean_content(text)
            if clean_text and len(clean_text) > 1: # 의미 있는 텍스트가 있는 경우
                options[idx] = clean_text
            else:
                # 다음 보기 기호의 top 좌표 구하기 (세로로 더 아래에 있는 경우)
                next_top = None
                for next_marker, _, next_bbox in sorted_options[i+1:]:
                    if next_bbox[1] > bbox[1]:
                        next_top = next_bbox[1]
                        break
                        
                img_url = capture_option_image(pdf_path, page_idx, num, idx + 1, bbox, round_num, next_top)
                options[idx] = img_url

    return {
        "questionNumber": num,
        "questionText": q_text,
        "imageUrls": [],
        "score": 2,
        "options": options,
        "correctOption": answers_dict.get(num, 1),
        "explanation": "공식 해설 없음"
    }

def process_pdf(round_dir):
    round_path = os.path.join(DOWNLOAD_DIR, round_dir)
    q_dir = os.path.join(round_path, "question")
    a_dir = os.path.join(round_path, "answer")
    
    if not os.path.exists(q_dir): return
    q_files = [f for f in os.listdir(q_dir) if f.lower().endswith('.pdf')]
    a_files = [f for f in os.listdir(a_dir) if f.lower().endswith('.pdf')] if os.path.exists(a_dir) else []
    
    if not q_files: return
    
    q_pdf_path = os.path.join(q_dir, q_files[0])
    exam_type = "심화" if "심화" in q_pdf_path else "기본"
    ans_dict = parse_answers_from_pdf(os.path.join(a_dir, a_files[0])) if a_files else {}
    
    questions = []
    
    with pdfplumber.open(q_pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            lines_words = extract_text_with_context(page)
            
            curr_num = 0
            curr_q_text = []
            curr_opts_data = [] # (marker, text, bbox)
            in_opts = False
            
            for line_words in lines_words:
                line_text = " ".join([w['text'] for w in line_words])
                cleaned = clean_content(line_text)
                if not cleaned: continue
                
                # 라인 좌표 확보
                line_bbox = (
                    min(w['x0'] for w in line_words),
                    min(w['top'] for w in line_words),
                    max(w['x1'] for w in line_words),
                    max(w['bottom'] for w in line_words)
                )
                
                q_match = re.match(r'^(\d+)\.\s+(.+)', cleaned)
                if q_match:
                    new_num = int(q_match.group(1))
                    if new_num == 1 or new_num > curr_num:
                        if curr_num > 0:
                            questions.append(create_question_obj(curr_num, curr_q_text, curr_opts_data, ans_dict, q_pdf_path, page_idx, round_dir))
                        curr_num = new_num
                        curr_q_text = [q_match.group(2)]
                        curr_opts_data = []
                        in_opts = False
                        continue
                
                if curr_num > 0:
                    # 보기 기호 분리
                    markers = re.findall(r'[①②③④⑤]', cleaned)
                    if markers:
                        in_opts = True
                        parts = re.split(r'([①②③④⑤])', cleaned)
                        
                        # 기호 앞의 텍스트가 질문의 마지막 문장인 경우
                        if parts[0].strip():
                            curr_q_text.append(parts[0].strip())
                        
                        for i in range(1, len(parts), 2):
                            m = parts[i]
                            t = parts[i+1].strip() if i+1 < len(parts) else ""
                            curr_opts_data.append((m, t, line_bbox))
                    else:
                        if in_opts:
                            # 보기가 여러 줄인 경우 마지막 보기에 추가
                            if curr_opts_data:
                                last_m, last_t, last_b = curr_opts_data[-1]
                                curr_opts_data[-1] = (last_m, last_t + " " + cleaned, last_b)
                        else:
                            # 질문 텍스트 누적
                            curr_q_text.append(cleaned)
                            
            if curr_num > 0:
                questions.append(create_question_obj(curr_num, curr_q_text, curr_opts_data, ans_dict, q_pdf_path, page_idx, round_dir))
        
    parsed_data = {
        "title": f"제{round_dir}회 한국사능력검정시험 {exam_type}",
        "examType": exam_type,
        "round": int(round_dir),
        "passingScore": 60,
        "questions": questions
    }
    
    out_path = os.path.join(DOWNLOAD_DIR, f"parsed_exam_{round_dir}_{exam_type}_playwright.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, ensure_ascii=False, indent=2)
    print(f"✅ {round_dir}회 {exam_type} 파싱 완료: {out_path}")

if __name__ == "__main__":
    for d in sorted(os.listdir(DOWNLOAD_DIR)):
        if os.path.isdir(os.path.join(DOWNLOAD_DIR, d)) and d.isdigit():
            process_pdf(d)
