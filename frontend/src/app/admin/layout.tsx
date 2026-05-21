"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요합니다.");
            router.replace("/");
            return;
        }

        try {
            const payloadStr = token.split(".")[1];
            if (payloadStr) {
                const payload = JSON.parse(atob(payloadStr));
                if (payload.role !== "admin") {
                    alert("관리자 권한이 필요합니다.");
                    router.replace("/");
                    return;
                }
                setIsAuthorized(true);
            } else {
                throw new Error("Invalid token format");
            }
        } catch (e) {
            console.error(e);
            alert("유효하지 않은 인증 정보입니다.");
            router.replace("/");
        }
    }, [router]);

    if (!isAuthorized) {
        return <div className="p-8 text-center">권한 확인 중...</div>;
    }

    return (
        <div className="admin-container">
            {children}
        </div>
    );
}
