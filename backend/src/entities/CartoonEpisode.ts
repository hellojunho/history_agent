import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("cartoon_episodes")
export class CartoonEpisode {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    period!: string; // 예: "삼국시대", "고려", "조선", "근현대"

    @Column({ type: "integer", name: "period_order" })
    periodOrder!: number; // 시대 정렬 순서

    @Column({ type: "varchar" })
    title!: string; // 예: "만화로 보는 고려의 건국 과정"

    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ type: "varchar", nullable: true })
    thumbnail!: string; // 썸네일 이미지 URL

    @Column({ type: "integer" })
    order!: number; // 시대 내 사건 정렬 순서

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
