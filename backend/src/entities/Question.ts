import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Exam } from "./Exam";

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Exam)
    @JoinColumn({ name: "exam_id" })
    exam!: Exam;

    @Column({ type: "uuid", name: "exam_id" })
    examId!: string;

    @Column({ type: "int", name: "question_number" })
    questionNumber!: number;

    @Column({ type: "text", name: "content_text", nullable: true })
    contentText!: string | null;

    @Column({ type: "varchar", name: "image_url", nullable: true })
    imageUrl!: string | null;

    @Column({ type: "jsonb", nullable: true })
    choices!: string[] | null;

    @Column({ type: "int" })
    answer!: number;

    @Column({ type: "text", nullable: true })
    explanation!: string | null;

    @Column({ type: "jsonb", name: "wrong_explanations", nullable: true })
    wrongExplanations!: Record<string, string> | null;

    @Column({ type: "varchar", nullable: true })
    era!: string | null;

    @Column({ type: "varchar", nullable: true })
    topic!: string | null;

    @Column({ type: "varchar", nullable: true })
    difficulty!: string | null;

    @Column({ type: "boolean", name: "frequent_concept", default: false })
    frequentConcept!: boolean;

    @Column({ type: "varchar", name: "source_url", nullable: true })
    sourceUrl!: string | null;
}
