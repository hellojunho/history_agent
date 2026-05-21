"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Material {
    id: string;
    category: string;
    title: string;
    contentUrl: string | null;
    filePath: string | null;
    createdAt: string;
}

export default function MaterialsPage(): JSX.Element {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterials = async (): Promise<void> => {
            try {
                const response = await apiRequest<{ data: Material[] }>("/api/materials");
                setMaterials(response.data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load materials");
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    if (loading) return <div className="text-center py-10">로딩 중...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">학습 자료</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50 text-blue-600 border-blue-600">전체</button>
                    <button className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50">공식</button>
                    <button className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50">미디어</button>
                    <button className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50 text-blue-600 border-blue-600">요약본</button>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full uppercase">
                            {item.category}
                        </span>
                        <h3 className="text-lg font-medium mt-2 mb-4">{item.title}</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <a 
                                href={item.filePath || item.contentUrl || "#"} 
                                className="text-sm font-semibold text-blue-600 hover:underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                자료 보기 →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
