import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("exam_schedules")
export class ExamSchedule {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "integer" })
    round!: number; // 예: 73

    @Column({ type: "integer" })
    year!: number; // 예: 2026

    @Column({ type: "timestamp" })
    examDate!: Date; // 시험일

    @Column({ type: "timestamp" })
    registerStart!: Date; // 접수 시작일

    @Column({ type: "timestamp" })
    registerEnd!: Date; // 접수 마감일

    @Column({ type: "timestamp" })
    resultDate!: Date; // 합격자 발표일

    @Column({ type: "varchar", default: "https://www.historyexam.go.kr/" })
    applyUrl!: string; // 원서 접수 URL

    @Column({ type: "varchar", length: 1000, default: "서울,경기,인천,강원,충북,충남,대전,세종,전북,전남,광주,경북,경남,부산,대구,울산,제주" })
    regions!: string; // 접수 가능 지역 (콤마로 구분된 리스트)
}
