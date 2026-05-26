import React from "react";
import EducationSidebar from "./EducationSidebar";

export default function EducationLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-container grid gap-6 pb-16 pt-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:pt-6">
            <EducationSidebar />
            <main className="min-w-0">
                <div className="glass-panel animated-border overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
