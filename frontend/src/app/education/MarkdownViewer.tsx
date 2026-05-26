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

    const processedContent = processYeobaek(content);

    return (
        <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-[-0.03em] prose-p:text-[15px] prose-p:leading-8 prose-strong:text-slate-950 prose-h1:mb-4 prose-h1:text-4xl prose-h1:text-slate-950 prose-h2:mt-14 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3 prose-h2:text-2xl prose-h2:text-slate-950 prose-h3:mt-8 prose-h3:text-xl prose-h3:text-blue-800 prose-ul:pl-5 prose-li:my-2 prose-li:marker:text-blue-500 prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/60 prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:my-6 prose-blockquote:text-slate-800 prose-blockquote:not-italic prose-blockquote:shadow-sm prose-a:text-blue-700 prose-a:font-bold prose-table:block prose-table:overflow-x-auto prose-table:rounded-2xl prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-td:border-t prose-td:border-slate-200 prose-td:px-4 prose-td:py-3 prose-img:rounded-xl">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
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
