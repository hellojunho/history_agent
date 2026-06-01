"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    content: string;
}

export default function MarkdownViewer({ content }: Props) {
    // 괄호 팁 박스(여백) 부분을 감지하여 아래 내용 전체를 아름다운 blockquote 카드로 묶는 전처리 함수
    const processYeobaek = (text: string): string => {
        const keyword = "(여백 - 한능검 심화 100점 대비를 위한 깊이 있는 이해 필수)";
        if (!text.includes(keyword)) return text;

        const parts = text.split(keyword);
        let result = parts[0];

        for (let i = 1; i < parts.length; i++) {
            const afterKeyword = parts[i];
            
            // 다음 구분선(---) 또는 문서의 끝까지를 팁 카드로 지정
            const dividerIndex = afterKeyword.indexOf("\n---");
            let targetContent = "";
            let remainingContent = "";

            if (dividerIndex !== -1) {
                targetContent = afterKeyword.substring(0, dividerIndex);
                remainingContent = afterKeyword.substring(dividerIndex);
            } else {
                targetContent = afterKeyword;
                remainingContent = "";
            }

            // targetContent의 모든 줄 앞에 '> ' 접두사를 붙여 blockquote로 래핑
            const wrappedContent = targetContent
                .split("\n")
                .map((line) => {
                    // 빈 줄이어도 blockquote 안에 들어오도록 처리
                    return `> ${line}`;
                })
                .join("\n");

            // 예쁜 💡 헤더 뱃지와 함께 조립
            result += `> 💡 **한능검 심화 100점 대비를 위한 깊이 있는 이해 필수!**\n>\n${wrappedContent}${remainingContent}`;
        }

        return result;
    };

    const processBoldQuotes = (text: string): string => {
        return text.replace(/\*\*'([^']+?)'\*\*/g, "'**$1**'");
    };

    const fixBoldBoundaries = (text: string): string => {
        let fixed = text;
        fixed = fixed.replace(/\*\*([^\*\s\n](?:[^\*\n]*?[^\*\s\n])?)\*\*(?=[가-힣a-zA-Z0-9])/g, '**$1** ');
        fixed = fixed.replace(/([가-힣a-zA-Z0-9])\*\*([^\*\s\n](?:[^\*\n]*?[^\*\s\n])?)\*\*/g, '$1 **$2**');
        return fixed;
    };

    const processedContent = fixBoldBoundaries(processBoldQuotes(processYeobaek(content)));

    return (
        <article className="prose prose-slate max-w-none prose-headings:my-0 prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-blockquote:my-0 prose-blockquote:border-none prose-blockquote:bg-transparent prose-blockquote:p-0 prose-table:my-0 prose-th:p-0 prose-td:p-0">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mb-6 mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="group flex items-center gap-2 mt-12 mb-5 text-xl font-bold text-slate-900 border-l-4 border-blue-500 pl-3.5 tracking-tight">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 mb-3.5 text-[15px] font-bold text-slate-800 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl w-fit flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 text-[15px] leading-[1.85] text-slate-600 tracking-tight [word-break:keep-all]">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100/50 mx-[2px] transition-all hover:bg-blue-100/70">
                            {children}
                        </strong>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="my-6 rounded-2xl border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-50/40 via-blue-50/20 to-white px-6 py-5 text-[14px] leading-[1.8] text-slate-800 shadow-sm not-italic border border-slate-100">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <div className="my-10 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    ),
                    ul: ({ children }) => (
                        <ul className="my-4 pl-1 space-y-2 list-none">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-4 pl-5 space-y-2.5 list-decimal text-slate-600 text-[15px] tracking-tight">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => {
                        // 순서 없는 리스트일 경우에만 커스텀 점 마커 부여
                        return (
                            <li className="relative pl-5 text-[15px] leading-[1.8] text-slate-600 tracking-tight [word-break:keep-all]">
                                <span className="absolute left-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                                {children}
                            </li>
                        );
                    },
                    table: ({ children }) => (
                        <div className="my-6 w-full overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm bg-white">
                            <table className="w-full border-collapse text-left text-[14px]">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-50/80 font-semibold text-slate-800 border-b border-slate-200/70">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-slate-50/40 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-bold text-slate-800 border-none">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 border-none">
                            {children}
                        </td>
                    ),
                    img: ({ src, alt }) => (
                        <span className="my-10 flex w-full flex-col items-center justify-center">
                            <span className="block overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_20px_42px_rgba(15,23,42,0.1)]">
                                <img 
                                    src={src} 
                                    alt={alt || "역사 유물"} 
                                    className="mx-auto block max-h-[360px] w-auto rounded-[22px] object-contain"
                                />
                            </span>
                            {alt && (
                                <span className="mt-4 block max-w-md px-4 text-center text-xs font-semibold leading-relaxed tracking-tight text-slate-500">
                                    {alt}
                                </span>
                            )}
                        </span>
                    )
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </article>
    );
}
