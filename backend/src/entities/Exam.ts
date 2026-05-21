import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("exams")
export class Exam {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "int", nullable: true })
    year!: number;

    @Column({ type: "int", name: "round_number" })
    roundNumber!: number;

    @Column({ type: "varchar" })
    level!: string; // '심화', '기본', '고급', '중급', '초급'

    @Column({ type: "varchar", nullable: true })
    title!: string;

    @Column({ type: "date", name: "exam_date", nullable: true })
    examDate!: Date;

    @Column({ type: "int", name: "total_questions", default: 50 })
    totalQuestions!: number;

    @Column({ type: "varchar", name: "source_url", nullable: true })
    sourceUrl!: string | null;

    @Column({ type: "varchar", default: 'draft' })
    status!: string; // 'draft', 'published'

    @Column({ type: "varchar", name: "pdf_file_path", nullable: true })
    pdfFilePath!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
