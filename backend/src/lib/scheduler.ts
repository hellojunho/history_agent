import { initializeDatabase } from "@/data-source";
import { ExamNotification } from "@/entities/ExamNotification";


// 날짜 포맷팅 유틸 (YYYY-MM-DD)
function formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

// 7일 전 날짜 계산
function getD7Date(date: Date): string {
    const target = new Date(date);
    target.setDate(target.getDate() - 7);
    return formatDate(target);
}

export async function runNotificationCheck() {
    console.log("⏰ [Notification Scheduler] Running periodic exam alert check...");
    try {
        const dataSource = await initializeDatabase();
        const notifRepo = dataSource.getRepository(ExamNotification);
        
        // 조인하여 발송 안 된 알림 정보 조회
        const subscriptions = await notifRepo.find({
            where: [
                { sentStart: false },
                { sentD7: false },
                { sentDday: false }
            ],
            relations: ["user", "schedule"]
        });

        if (subscriptions.length === 0) {
            console.log("⏰ [Notification Scheduler] No pending notification alerts found.");
            return;
        }

        const todayStr = formatDate(new Date());

        for (const sub of subscriptions) {
            // 회원정보와 시험일정 정보가 완비되어 있는지 검사
            if (!sub.user || !sub.schedule || sub.user.deletedAt) continue;

            const user = sub.user;
            const schedule = sub.schedule;

            const startStr = formatDate(schedule.registerStart);
            const endStr = formatDate(schedule.registerEnd);
            const d7Str = getD7Date(schedule.registerEnd);

            let isUpdated = false;

            // 1. 접수 시작 당일 알림
            if (todayStr === startStr && !sub.sentStart) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공!
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] 제${schedule.round}회 한국사능력검정시험 원서 접수 개시!
내 용: 
  안녕하세요, 학습자님!
  신청하신 제${schedule.round}회 시험의 원서 접수가 오늘(${todayStr})부터 시작됩니다.
  아래의 공식 홈페이지에서 원서를 성공적으로 접수해보세요!
  
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentStart = true;
                isUpdated = true;
            }

            // 2. 접수 마감 D-7 알림
            if (todayStr === d7Str && !sub.sentD7) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (마감 D-7)
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] 제${schedule.round}회 원서 접수 마감 7일 전 안내!
내 용: 
  안녕하세요, 학습자님!
  신청하신 제${schedule.round}회 시험의 원서 접수 마감이 7일 앞으로 다가왔습니다.
  아직 접수를 마치지 않으셨다면, 늦지 않게 접수를 진행하시기 바랍니다.
  
  ▶ 접수 마감일: ${endStr}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentD7 = true;
                isUpdated = true;
            }

            // 3. 접수 마감 당일 알림 (D-Day)
            if (todayStr === endStr && !sub.sentDday) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (마감 D-Day)
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] ★오늘 마감★ 제${schedule.round}회 원서 접수 마감 당일 안내!
내 용: 
  안녕하세요, 학습자님!
  오늘(${todayStr})은 제${schedule.round}회 시험의 원서 접수가 최종 마감되는 날입니다.
  접수 마감 시간 전에 반드시 등록을 마치시기 바랍니다! (마감 시각 확인 요망)
  
  ▶ 접수 마감 당일: ${todayStr}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentDday = true;
                isUpdated = true;
            }

            // 상태가 업데이트되었다면 DB 저장
            if (isUpdated) {
                await notifRepo.save(sub);
            }
        }
    } catch (error) {
        console.error("❌ [Notification Scheduler] Error in background scheduler:", error);
    }
}

// 스케줄러 자동 실행 초기화 유틸
let isSchedulerStarted = false;
export function startNotificationScheduler() {
    if (isSchedulerStarted) return;
    isSchedulerStarted = true;

    console.log("🚀 [Notification Scheduler] Initializing backgrounds alert scheduler loop...");
    
    // 1. 서버 시작 후 5초 뒤 1회 실행 (즉시 피드백 확보)
    setTimeout(() => {
        runNotificationCheck();
    }, 5000);

    // 2. 이후 매 10분마다 주기적 체크 실행
    setInterval(() => {
        runNotificationCheck();
    }, 10 * 60 * 1000);
}
