import React from "react";
import "./globals.css";

import Header from "@/components/Header";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    return (
        <html lang="ko">
            <body>
                <Header />
                <main className="max-w-7xl mx-auto p-4">
                    {children}
                </main>
            </body>
        </html>
    );
}
