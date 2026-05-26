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
            <body className="app-shell">
                <Header />
                <main className="relative z-10 flex-1 pb-16">
                    {children}
                </main>
            </body>
        </html>
    );
}
