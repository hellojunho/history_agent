import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Exam } from "./Exam";

@Entity("user_exam_results")
export class UserExamResult {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => Exam)
    @JoinColumn({ name: "exam_id" })
    exam!: Exam;

    @Column({ type: "uuid", name: "exam_id" })
    examId!: string;

    @Column({ type: "int", nullable: true })
    score!: number | null;

    @Column({ type: "int", name: "total_answers", default: 0 })
    totalAnswers!: number;

    @Column({ type: "int", name: "correct_answers", default: 0 })
    correctAnswers!: number;

    @Column({ type: "int", name: "time_taken_seconds", nullable: true })
    timeTakenSeconds!: number | null;

    @CreateDateColumn({ name: "submitted_at" })
    submittedAt!: Date;
}
