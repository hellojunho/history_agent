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

// N일 전 날짜 계산
function getOffsetDate(date: Date, offsetDays: number): string {
    const target = new Date(date);
    target.setDate(target.getDate() - offsetDays);
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
                { sentStartD7: false },
                { sentStartD1: false },
                { sentStartDday: false },
                { sentEndD7: false },
                { sentEndD1: false },
                { sentEndDday: false }
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

            const startD7 = getOffsetDate(schedule.registerStart, 7);
            const startD1 = getOffsetDate(schedule.registerStart, 1);
            const startDday = formatDate(schedule.registerStart);
            const endD7 = getOffsetDate(schedule.registerEnd, 7);
            const endD1 = getOffsetDate(schedule.registerEnd, 1);
            const endDday = formatDate(schedule.registerEnd);

            let isUpdated = false;

            // 1. 접수 시작 7일 전 알림
            if (todayStr === startD7 && !sub.sentStartD7) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (접수 시작 D-7)
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] 제${schedule.round}회 원서 접수 개시 7일 전 안내!
내 용: 
  안녕하세요, 학습자님!
  신청하신 제${schedule.round}회 시험의 원서 접수 시작일이 7일 앞으로 다가왔습니다.
  미리 접수 준비 및 사진 등록을 마치시길 바랍니다!
  
  ▶ 접수 시작일: ${startDday}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentStartD7 = true;
                isUpdated = true;
            }

            // 2. 접수 시작 1일 전 알림
            if (todayStr === startD1 && !sub.sentStartD1) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (접수 시작 D-1)
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] 제${schedule.round}회 원서 접수 개시 1일 전 안내!
내 용: 
  안녕하세요, 학습자님!
  내일(${startDday})은 신청하신 제${schedule.round}회 시험의 원서 접수가 시작되는 날입니다.
  접수 시작 시간에 늦지 않게 대기하여 접수를 완료해보세요!
  
  ▶ 접수 시작일: ${startDday}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentStartD1 = true;
                isUpdated = true;
            }

            // 3. 접수 시작 당일 알림
            if (todayStr === startDday && !sub.sentStartDday) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (접수 시작 당일)
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
                sub.sentStartDday = true;
                isUpdated = true;
            }

            // 4. 접수 마감 7일 전 알림
            if (todayStr === endD7 && !sub.sentEndD7) {
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
  
  ▶ 접수 마감일: ${endDday}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentEndD7 = true;
                isUpdated = true;
            }

            // 5. 접수 마감 1일 전 알림
            if (todayStr === endD1 && !sub.sentEndD1) {
                console.log(`
========================================================================
✉️ [EMAIL NOTIFICATION] 알림 메일 발송 성공! (마감 D-1)
------------------------------------------------------------------------
수신인: ${user.email}
제 목: [한능검 알림] 제${schedule.round}회 원서 접수 마감 1일 전 안내!
내 용: 
  안녕하세요, 학습자님!
  내일(${endDday})은 신청하신 제${schedule.round}회 시험의 원서 접수가 마감되는 날입니다.
  잊지 마시고 접수를 꼭 마쳐주시기 바랍니다.
  
  ▶ 접수 마감일: ${endDday}
  ▶ 접수처 이동: https://www.historyexam.go.kr
========================================================================
`);
                sub.sentEndD1 = true;
                isUpdated = true;
            }

            // 6. 접수 마감 당일 알림 (D-Day)
            if (todayStr === endDday && !sub.sentEndDday) {
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
                sub.sentEndDday = true;
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
