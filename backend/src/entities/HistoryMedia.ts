import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("history_media")
export class HistoryMedia {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar" })
    era!: string;

    @Column({ type: "varchar", name: "media_type" })
    mediaType!: string;

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "integer", name: "release_year" })
    releaseYear!: number;

    @Column({ type: "varchar", name: "associated_event" })
    associatedEvent!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}
