import { NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./auth";

export function requireAdmin(request: Request): JWTPayload | NextResponse {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "admin") {
        return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    return payload;
}
