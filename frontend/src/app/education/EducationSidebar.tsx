"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { ERA_LIST } from "./eraList";

export default function EducationSidebar() {
    const pathname = usePathname();

    return (
        <aside className="md:w-60 flex-shrink-0">
            <div className="bg-white rounded-toss border border-toss-gray200/80 p-5 sticky top-28 shadow-sm">
                <h2 className="text-base font-extrabold mb-4 pb-3 border-b border-toss-gray100 flex items-center gap-2 text-toss-gray900">
                    <BookOpen className="w-4.5 h-4.5 text-toss-blue" />
                    시대별 교육자료
                </h2>
                <nav className="space-y-1">
                    {ERA_LIST.map((era) => {
                        const href = `/education/${era.id}`;
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={era.id}
                                href={href}
                                className={`block w-full text-left px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold ${
                                    isActive
                                        ? "bg-toss-blue/10 text-toss-blue"
                                        : "text-toss-gray600 hover:bg-toss-gray100/60 hover:text-toss-gray900"
                                }`}
                            >
                                {era.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
