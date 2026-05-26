import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export type UserRole = "general" | "admin";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar", name: "password_hash" })
    passwordHash!: string;

    @Column({ type: "varchar", default: "general" })
    role!: UserRole;

    @Column({ type: "varchar", nullable: true })
    nickname!: string | null;

    @Column({ type: "varchar", nullable: true, name: "profile_image" })
    profileImage!: string | null;

    @Column({ type: "boolean", default: true, name: "is_activate" })
    isActivate!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
}
