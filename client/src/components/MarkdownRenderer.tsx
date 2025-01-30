import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type MarkdownRendererProps = {
  children: string;
};

export function MarkdownRenderer({ children: markdown }: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false);

  const CodeBlock = ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');
    
    const handleCopy = () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeContent)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => console.error('Clipboard write failed:', err));
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = codeContent;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";  
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Fallback: Copying failed", err);
        }
        document.body.removeChild(textArea);
      }
    };

    return !match ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <div className="code-block-container">
        <div className="code-header">
          <span className="language-tag">{match[1]}</span>
          <button className="copy-button" onClick={handleCopy}>
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
              </svg>
            )}
          </button>
        </div>
        <SyntaxHighlighter style={dracula} PreTag="div" language={match[1]} {...props}>
          {codeContent}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Function to escape HTML tags
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;');
  };

  // Pre-process the markdown to escape HTML tags outside of code blocks
  const processMarkdown = (text: string) => {
    // Split the text by code blocks (both fenced and inline)
    const parts = text.split(/(`{1,3}[^`]*`{1,3})/g);
    return parts
      .map((part, index) => {
        // If it's a code block (odd indices due to capture groups), leave it unchanged
        if (index % 2 === 1) return part;
        // If it's not a code block, escape HTML tags
        return escapeHtml(part);
      })
      .join('');
  };

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock
      }}
    >
      {processMarkdown(markdown)}
    </Markdown>
  );
}