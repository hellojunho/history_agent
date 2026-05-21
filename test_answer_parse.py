import pdfplumber
import re

def parse_answers_from_pdf(pdf_path):
    answers = {}
    print(f"📄 정답지 '{pdf_path}' 파싱을 시작합니다...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # 1. 표(Table) 기반 추출 시도 (한국사 답지는 보통 표 형태)
            for page in pdf.pages:
                tables = page.extract_tables()
                print(f"Page {pdf.pages.index(page)}: Found {len(tables)} tables")
                for table in tables:
                    for row in table:
                        # Filter out None and strip
                        row = [str(cell).strip().replace('\n', '') for cell in row if cell]
                        print(f"Row: {row}")
                        # 문항번호 / 정답 쌍 찾기 (보통 연달아 있음)
                        for i in range(len(row)):
                            if row[i].isdigit() and 1 <= int(row[i]) <= 50:
                                q_num = int(row[i])
                                # 다음 열이 정답 기호(①~⑤)나 숫자(1~5)인지 확인
                                if i + 1 < len(row):
                                    ans_str = row[i+1]
                                    if ans_str in "①②③④⑤":
                                        answers[q_num] = "①②③④⑤".index(ans_str) + 1
                                    elif ans_str.isdigit() and 1 <= int(ans_str) <= 5:
                                        answers[q_num] = int(ans_str)

            # 2. 표에서 못 찾았다면, 텍스트 정규식으로 다시 시도 (백업 가동)
            if len(answers) < 20: 
                print("Falling back to regex...")
                all_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text: all_text += text + "\n"
                print(f"All text: {all_text[:500]}...")
                matches = re.finditer(r'(?<!\d)(\d{1,2})\s*([①②③④⑤1-5])', all_text)
                for m in matches:
                    q_num = int(m.group(1))
                    ans_str = m.group(2)
                    if 1 <= q_num <= 50:
                        if ans_str in "①②③④⑤": answers[q_num] = "①②③④⑤".index(ans_str) + 1
                        else: answers[q_num] = int(ans_str)

    except Exception as e:
        print(f"⚠️ 정답지 파싱 중 오류 발생: {e}")
    return answers

if __name__ == "__main__":
    ans_pdf = "download/77/answer/77회 한국사_답지(심화).pdf"
    results = parse_answers_from_pdf(ans_pdf)
    print(f"Results: {results}")
    print(f"Count: {len(results)}")
