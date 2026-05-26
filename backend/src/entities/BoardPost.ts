import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("board_posts")
export class BoardPost {
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

    @OneToMany(() => BoardComment, (comment) => comment.post)
    comments!: BoardComment[];

    @OneToMany(() => BoardLike, (like) => like.post)
    likes!: BoardLike[];

    @Column({ type: "text", name: "image_url", nullable: true })
    imageUrl!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}

@Entity("board_comments")
export class BoardComment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "uuid", name: "post_id" })
    postId!: string;

    @ManyToOne(() => BoardPost, (post) => post.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "post_id" })
    post!: BoardPost;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}

@Entity("board_likes")
export class BoardLike {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid", name: "post_id" })
    postId!: string;

    @ManyToOne(() => BoardPost, (post) => post.likes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "post_id" })
    post!: BoardPost;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
