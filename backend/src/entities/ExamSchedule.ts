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
}
