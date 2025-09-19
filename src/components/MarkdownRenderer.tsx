'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code(props: any) {
            const { inline, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && match ? (
              <div className="relative group">
                <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {language}
                </div>
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={language}
                  PreTag="div"
                  className="rounded-lg !mt-2 !mb-4"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 dark:bg-zinc-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono"
              >
                {children}
              </code>
            );
          },
          
          // Headings
          h1(props) {
            return (
              <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-6 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-2">
                {props.children}
              </h1>
            );
          },
          h2(props) {
            return (
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mt-5 mb-3">
                {props.children}
              </h2>
            );
          },
          h3(props) {
            return (
              <h3 className="text-md font-semibold text-gray-900 dark:text-zinc-100 mt-4 mb-2">
                {props.children}
              </h3>
            );
          },
          
          // Paragraphs
          p(props) {
            return (
              <p className="text-sm leading-relaxed text-gray-800 dark:text-zinc-200 mb-3 last:mb-0">
                {props.children}
              </p>
            );
          },
          
          // Lists
          ul(props) {
            return (
              <ul className="list-disc list-inside text-sm text-gray-800 dark:text-zinc-200 mb-3 space-y-1 ml-2">
                {props.children}
              </ul>
            );
          },
          ol(props) {
            return (
              <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-zinc-200 mb-3 space-y-1 ml-2">
                {props.children}
              </ol>
            );
          },
          li(props) {
            return (
              <li className="text-sm leading-relaxed">
                {props.children}
              </li>
            );
          },
          
          // Strong/Bold
          strong(props) {
            return (
              <strong className="font-semibold text-gray-900 dark:text-zinc-100">
                {props.children}
              </strong>
            );
          },
          
          // Emphasis/Italic
          em(props) {
            return (
              <em className="italic text-gray-800 dark:text-zinc-200">
                {props.children}
              </em>
            );
          },
          
          // Links
          a(props) {
            return (
              <a
                href={props.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline transition-colors"
              >
                {props.children}
              </a>
            );
          },
          
          // Blockquotes
          blockquote(props) {
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-zinc-600 pl-4 py-2 my-4 bg-gray-50 dark:bg-zinc-800/50 rounded-r">
                {props.children}
              </blockquote>
            );
          },
          
          // Tables
          table(props) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-200 dark:border-zinc-700 rounded-lg">
                  {props.children}
                </table>
              </div>
            );
          },
          thead(props) {
            return (
              <thead className="bg-gray-50 dark:bg-zinc-800">
                {props.children}
              </thead>
            );
          },
          th(props) {
            return (
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700">
                {props.children}
              </th>
            );
          },
          td(props) {
            return (
              <td className="px-4 py-2 text-sm text-gray-800 dark:text-zinc-200 border-b border-gray-200 dark:border-zinc-700">
                {props.children}
              </td>
            );
          },
          
          // Horizontal rule
          hr() {
            return (
              <hr className="border-gray-300 dark:border-zinc-600 my-6" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
