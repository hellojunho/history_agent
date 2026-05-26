"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    content: string;
}

export default function MarkdownViewer({ content }: Props) {
    return (
        <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-[-0.03em] prose-p:text-[15px] prose-p:leading-8 prose-strong:text-slate-950 prose-h1:mb-4 prose-h1:text-4xl prose-h1:text-slate-950 prose-h2:mt-14 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3 prose-h2:text-2xl prose-h2:text-slate-950 prose-h3:mt-8 prose-h3:text-xl prose-h3:text-blue-800 prose-ul:pl-5 prose-li:my-2 prose-li:marker:text-blue-500 prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/70 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:text-slate-700 prose-a:text-blue-700 prose-a:font-bold prose-table:block prose-table:overflow-x-auto prose-table:rounded-2xl prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-td:border-t prose-td:border-slate-200 prose-td:px-4 prose-td:py-3 prose-img:rounded-xl">
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
                {content}
            </ReactMarkdown>
        </article>
    );
}
