import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("cartoon_cuts")
export class CartoonCut {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "episode_id" })
    episodeId!: number;

    @Column({ type: "integer", name: "cut_order" })
    cutOrder!: number; // 컷 순서 (1, 2, 3...)

    @Column({ type: "varchar", name: "image_url" })
    imageUrl!: string; // 이미지 URL

    @Column({ type: "text", nullable: true })
    narration!: string; // 나레이션/설명

    @Column({ type: "text", nullable: true })
    dialogue!: string; // 말풍선/대사 (JSON string)

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
