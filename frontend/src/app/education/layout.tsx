import React from "react";
import EducationSidebar from "./EducationSidebar";

export default function EducationLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-4 pb-12">
            <EducationSidebar />
            <main className="flex-1">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-10 relative overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
