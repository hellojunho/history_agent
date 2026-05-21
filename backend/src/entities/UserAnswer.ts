import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { UserExamResult } from "./UserExamResult";
import { Question } from "./Question";

@Entity("user_answers")
export class UserAnswer {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => UserExamResult, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_exam_result_id" })
    userExamResult!: UserExamResult;

    @Column({ type: "uuid", name: "user_exam_result_id" })
    userExamResultId!: string;

    @ManyToOne(() => Question)
    @JoinColumn({ name: "question_id" })
    question!: Question;

    @Column({ type: "uuid", name: "question_id" })
    questionId!: string;

    @Column({ type: "int", name: "selected_choice", nullable: true })
    selectedChoice!: number | null;

    @Column({ type: "boolean", name: "is_correct" })
    isCorrect!: boolean;

    @CreateDateColumn({ name: "answered_at" })
    answeredAt!: Date;
}
