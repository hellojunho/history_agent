import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type MaterialCategory = "official" | "media" | "summary";

@Entity("materials")
export class Material {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar" })
    category!: MaterialCategory;

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "varchar", name: "content_url", nullable: true })
    contentUrl!: string | null;

    @Column({ type: "varchar", name: "file_path", nullable: true })
    filePath!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
