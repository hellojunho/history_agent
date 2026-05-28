import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { ExamSchedule } from "./ExamSchedule";

@Entity("exam_notifications")
export class ExamNotification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @Column({ type: "integer", name: "schedule_id" })
    scheduleId!: number;

    @Column({ type: "boolean", default: false, name: "sent_start_d7" })
    sentStartD7!: boolean; // 접수 시작 7일 전 알림 발송 여부

    @Column({ type: "boolean", default: false, name: "sent_start_d1" })
    sentStartD1!: boolean; // 접수 시작 1일 전 알림 발송 여부

    @Column({ type: "boolean", default: false, name: "sent_start_dday" })
    sentStartDday!: boolean; // 접수 시작 당일 알림 발송 여부

    @Column({ type: "boolean", default: false, name: "sent_end_d7" })
    sentEndD7!: boolean; // 접수 마감 7일 전 알림 발송 여부

    @Column({ type: "boolean", default: false, name: "sent_end_d1" })
    sentEndD1!: boolean; // 접수 마감 1일 전 알림 발송 여부

    @Column({ type: "boolean", default: false, name: "sent_end_dday" })
    sentEndDday!: boolean; // 접수 마감 당일 알림 발송 여부

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => ExamSchedule, { onDelete: "CASCADE" })
    @JoinColumn({ name: "schedule_id" })
    schedule!: ExamSchedule;
}
