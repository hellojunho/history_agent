import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@/entities/User";

const JWT_SECRET: string = process.env.JWT_SECRET || "your_super_secret_key";
const SALT_ROUNDS: number = 10;

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const signToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
};
