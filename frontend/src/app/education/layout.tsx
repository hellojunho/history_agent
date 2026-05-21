import React from "react";
import EducationSidebar from "./EducationSidebar";

export default function EducationLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-6 pb-16 px-4">
            <EducationSidebar />
            <main className="flex-1 min-w-0">
                <div className="bg-white rounded-toss shadow-sm border border-toss-gray200/80 p-6 md:p-12 relative overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
