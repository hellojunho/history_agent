import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("inquiries")
export class Inquiry {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => InquiryComment, (comment) => comment.inquiry)
    comments!: InquiryComment[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}

@Entity("inquiry_comments")
export class InquiryComment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "uuid", name: "inquiry_id" })
    inquiryId!: string;

    @ManyToOne(() => Inquiry, (inquiry) => inquiry.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "inquiry_id" })
    inquiry!: Inquiry;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "uuid", name: "parent_id", nullable: true })
    parentId!: string | null;

    @ManyToOne(() => InquiryComment, (comment) => comment.replies, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "parent_id" })
    parent!: InquiryComment | null;

    @OneToMany(() => InquiryComment, (comment) => comment.parent)
    replies!: InquiryComment[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}
