import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Material } from "./entities/Material";
import { Exam } from "./entities/Exam";
import { Question } from "./entities/Question";
import { UserExamResult } from "./entities/UserExamResult";
import { UserAnswer } from "./entities/UserAnswer";

import { UserLoginLog } from "./entities/UserLoginLog";
import { ExamSchedule } from "./entities/ExamSchedule";
import { ExamNotification } from "./entities/ExamNotification";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USER || "user",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "hanneunggeom",
    synchronize: true, // 개발 환경에서만 true
    logging: false,
    entities: [User, Material, Exam, Question, UserExamResult, UserAnswer, UserLoginLog, ExamSchedule, ExamNotification],
    migrations: [],
    subscribers: [],
});

import { startNotificationScheduler } from "./lib/scheduler";

export const initializeDatabase = async (): Promise<DataSource> => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        startNotificationScheduler();
    }
    return AppDataSource;
};
