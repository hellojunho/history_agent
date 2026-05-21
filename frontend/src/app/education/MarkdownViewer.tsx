"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    content: string;
}

export default function MarkdownViewer({ content }: Props) {
    return (
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-h3:text-blue-800 prose-a:text-blue-600 prose-table:w-full prose-th:bg-gray-100 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </article>
    );
}
