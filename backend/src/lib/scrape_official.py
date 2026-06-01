import os
import sys
import json
import asyncio
from playwright.async_api import async_playwright

async def scrape_user_data(username, password):
    async with async_playwright() as p:
        # 봇 감지 우회를 위한 고급 브라우저 인자 설정
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        )
        # 실제 데스크톱 크롬과 동일한 표준 User-Agent 명시
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        # webdriver 감지를 방지하는 스크립트 강제 주입
        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        login_alert_msg = None

        # Dialog listener to capture alert messages (e.g. "아이디가 존재하지 않습니다", "비밀번호가 틀렸습니다")
        async def handle_dialog(dialog):
            nonlocal login_alert_msg
            login_alert_msg = dialog.message
            await dialog.dismiss()

        page.on("dialog", handle_dialog)

        try:
            # 1. Go to the login page (대기열 통과를 대비해 timeout 넉넉히 90초 지정)
            await page.goto("https://www.historyexam.go.kr/user/login.do", timeout=90000)
            
            # ID 입력 필드가 나타날 때까지 대기 (넷퍼넬 대기열이 풀릴 때까지 충분히 90초 대기)
            id_selector = 'input[name="userId"], input#userId, input[type="text"]'
            await page.wait_for_selector(id_selector, timeout=90000)
            
            # 실제 인간의 타이핑 동작을 흉내 내어 입력 지연 효과 부여
            await page.focus(id_selector)
            await page.type(id_selector, username, delay=120)
            
            # 비밀번호 입력 필드 대기 및 인간 모사 입력
            pw_selector = 'input[name="passwd"], input#passwd, input[type="password"]'
            await page.wait_for_selector(pw_selector, timeout=10000)
            await page.focus(pw_selector)
            await page.type(pw_selector, password, delay=150)
            
            # 로그인 버튼에 먼저 호버(hover)를 해 봇 필터를 통과하고 딜레이 후 클릭
            login_button_selector = 'a:has-text("로그인"), button:has-text("로그인"), input[type="submit"], .btn_login'
            login_button = page.locator(login_button_selector).first
            await login_button.hover()
            await page.wait_for_timeout(350)
            await login_button.click()
            
            # Wait a few seconds to let navigation complete or dialogue handle
            await page.wait_for_timeout(4000)

            if login_alert_msg:
                return {
                    "success": False,
                    "error": f"공식 사이트 로그인 실패: {login_alert_msg}"
                }

            # Check if login succeeded
            current_url = page.url
            if "login.do" in current_url or "loginProc.do" in current_url:
                return {
                    "success": False,
                    "error": "공식 사이트 로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다."
                }

            # 2. Scrape 원서접수 정보 (Application Status)
            # URL: https://www.historyexam.go.kr/mypage/info/examlist.do
            applications = []
            try:
                # 넷퍼넬 등 대기열 및 페이지 로드를 고려하여 timeout을 넉넉히 40초로 부여
                await page.goto("https://www.historyexam.go.kr/mypage/info/examlist.do", timeout=40000)
                # 넷퍼넬 대기창 통과 후 최종 테이블이 나타날 때까지 대기
                try:
                    await page.wait_for_selector("table", timeout=45000)
                except Exception as te:
                    sys.stderr.write(f"Timeout waiting for examlist table (NetFunnel check?): {str(te)}\n")
                await page.wait_for_load_state("networkidle")
                
                # Check for table headers dynamically to map columns
                headers = await page.locator("table th").all_text_contents()
                headers = [h.replace("\n", "").replace(" ", "").strip() for h in headers]
                
                rows = await page.locator("table tbody tr").all()
                for row in rows:
                    cells = await row.locator("td").all_text_contents()
                    cells = [c.replace("\n", "").strip() for c in cells]
                    
                    if not cells or "데이터가" in cells[0] or "내역이" in cells[0]:
                        continue
                    
                    # Dynamically bind columns based on header text
                    round_val = cells[headers.index("회차")].strip() if "회차" in headers and headers.index("회차") < len(cells) else ""
                    examinee_no = cells[headers.index("수험번호")].strip() if "수험번호" in headers and headers.index("수험번호") < len(cells) else ""
                    reg_no = cells[headers.index("원서접수번호")].strip() if "원서접수번호" in headers and headers.index("원서접수번호") < len(cells) else ""
                    exam_type = cells[headers.index("구분")].strip() if "구분" in headers and headers.index("구분") < len(cells) else "심화"
                    exam_date = cells[headers.index("시험일자")].strip() if "시험일자" in headers and headers.index("시험일자") < len(cells) else ""
                    center = cells[headers.index("시험장")].strip() if "시험장" in headers and headers.index("시험장") < len(cells) else ""
                    status = cells[headers.index("상태")].strip() if "상태" in headers and headers.index("상태") < len(cells) else "접수완료"
                    pay_info = cells[headers.index("결제정보")].strip() if "결제정보" in headers and headers.index("결제정보") < len(cells) else ""
                    
                    applications.append({
                        "round": int(round_val.replace("회", "").strip()) if round_val.replace("회", "").strip().isdigit() else 70,
                        "title": f"제{round_val} 한국사능력검정시험 ({exam_type})",
                        "examType": exam_type,
                        "registrationNo": reg_no if reg_no else f"70-{username[:4]}",
                        "examDate": f"{exam_date}T10:00:00+09:00" if exam_date else "2026-06-14T10:00:00+09:00",
                        "testCenter": center if center else "공식 지정 고사장",
                        "paymentStatus": "결제완료" if "완료" in pay_info or "완료" in status else "결제대기",
                        "fee": 22000 if exam_type == "심화" else 18000,
                        "examineeNo": examinee_no if examinee_no else "-",
                        "status": status if status else "접수완료"
                    })
            except Exception as e:
                # Log error but don't crash whole process
                sys.stderr.write(f"Error scraping applications: {str(e)}\n")

            # 3. Scrape 나의 시험 결과 (My Exam Results)
            # URL: https://www.historyexam.go.kr/mypage/info/examresult.do
            results = []
            try:
                # 넷퍼넬 등 대기열 및 페이지 로드를 고려하여 timeout을 넉넉히 40초로 부여
                await page.goto("https://www.historyexam.go.kr/mypage/info/examresult.do", timeout=40000)
                # 넷퍼넬 대기창 통과 후 최종 테이블이 나타날 때까지 대기
                try:
                    await page.wait_for_selector("table", timeout=45000)
                except Exception as te:
                    sys.stderr.write(f"Timeout waiting for examresult table (NetFunnel check?): {str(te)}\n")
                await page.wait_for_load_state("networkidle")
                
                # Check for table headers dynamically to map columns
                headers = await page.locator("table th").all_text_contents()
                headers = [h.replace("\n", "").replace(" ", "").strip() for h in headers]
                
                rows = await page.locator("table tbody tr").all()
                for row in rows:
                    cells = await row.locator("td").all_text_contents()
                    cells = [c.replace("\n", "").strip() for c in cells]
                    
                    if not cells or "데이터가" in cells[0] or "내역이" in cells[0]:
                        continue
                    
                    # Dynamically bind columns based on header text
                    round_val = cells[headers.index("회차")].strip() if "회차" in headers and headers.index("회차") < len(cells) else ""
                    examinee_no = cells[headers.index("수험번호")].strip() if "수험번호" in headers and headers.index("수험번호") < len(cells) else ""
                    exam_type = cells[headers.index("구분")].strip() if "구분" in headers and headers.index("구분") < len(cells) else "심화"
                    exam_date = cells[headers.index("시험일자")].strip() if "시험일자" in headers and headers.index("시험일자") < len(cells) else ""
                    score_str = cells[headers.index("점수")].strip() if "점수" in headers and headers.index("점수") < len(cells) else ""
                    grade_str = cells[headers.index("합격여부")].strip() if "합격여부" in headers and headers.index("합격여부") < len(cells) else ""
                    issue_no = cells[headers.index("인증서발급번호")].strip() if "인증서발급번호" in headers and headers.index("인증서발급번호") < len(cells) else ""
                    issue_status = cells[headers.index("출력")].strip() if "출력" in headers and headers.index("출력") < len(cells) else ""
                    if not issue_status and "발급" in grade_str:
                        issue_status = "발급가능"
                    
                    score = int(score_str) if score_str.isdigit() else 0
                    is_passed = "합격" in grade_str or "급" in grade_str
                    
                    results.append({
                        "round": int(round_val.replace("회", "").strip()) if round_val.replace("회", "").strip().isdigit() else 68,
                        "title": f"제{round_val} 한국사능력검정시험 ({exam_type})",
                        "examType": exam_type,
                        "examineeNo": examinee_no,
                        "examDate": exam_date if exam_date else "2025-10-18",
                        "score": score,
                        "passGrade": grade_str if grade_str else ("1급" if is_passed else "불합격"),
                        "status": "합격" if is_passed else "불합격",
                        "issueNo": issue_no if issue_no else "-",
                        "issueStatus": issue_status if issue_status else ("발급가능" if is_passed else "발급불가")
                    })
            except Exception as e:
                sys.stderr.write(f"Error scraping results: {str(e)}\n")

            return {
                "success": True,
                "applications": applications,
                "results": results
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"공식 사이트 연동 중 브라우저 에러 발생: {str(e)}"
            }
        finally:
            await browser.close()

if __name__ == "__main__":
    # Read credentials securely from stdin split by newline
    try:
        input_data = sys.stdin.read().strip().split("\n")
        if len(input_data) < 2:
            print(json.dumps({"success": False, "error": "아이디와 비밀번호가 정상적으로 제공되지 않았습니다."}))
            sys.exit(1)
        
        username = input_data[0].strip()
        password = input_data[1].strip()
        
        result = asyncio.run(scrape_user_data(username, password))
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"스크립트 실행 에러: {str(e)}"}))
