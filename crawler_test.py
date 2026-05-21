import requests

session = requests.Session()
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
    "Referer": "https://www.historyexam.go.kr/pst/list.do?bbs=dat"
}
session.headers.update(headers)

res = session.post("https://www.historyexam.go.kr/pst/view.do?bbs=dat", data={"pst_sno": "1000030110", "bbs": "dat"})
print("Status Code:", res.status_code)
if "접근권한 없음" in res.text:
    print("Access Denied!")
else:
    print("Success! Finding PDF links...")
    import re
    # Look for fileDownload.do inside
    matches = re.findall(r'fileDownload.do\?[^"]+', res.text)
    print("Matches:", matches)
