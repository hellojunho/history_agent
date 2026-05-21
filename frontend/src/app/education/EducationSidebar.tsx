"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { ERA_LIST } from "./eraList";

export default function EducationSidebar() {
    const pathname = usePathname();

    return (
        <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-blue-600 p-5 sticky top-24">
                <h2 className="text-lg font-bold mb-4 border-b pb-3 flex items-center gap-2 text-gray-800">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    시대별 교육자료
                </h2>
                <nav className="space-y-1.5">
                    {ERA_LIST.map((era) => {
                        const href = `/education/${era.id}`;
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={era.id}
                                href={href}
                                className={`block w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700 shadow-inner"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
