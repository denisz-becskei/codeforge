import React, { useEffect, useState } from "react";
import { Message } from "../types/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
  isGlobalStreaming?: boolean;
  onRegenerate?: (messageId: string) => void;
}

const MessageComponent: React.FC<MessageProps> = ({ message, isStreaming = false, isGlobalStreaming = false, onRegenerate }) => {
  const [displayText, setDisplayText] = useState(message.text);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDisplayText(message.text);
  }, [message.text]);

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(displayText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Clipboard write failed:", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = displayText;
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

  return (
    <div className={`message ${message.sender}`}>
      {message.sender === "user" && (
        <div className="message-actions">
          <button onClick={handleCopy} className="copy-button" title="Copy message">
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
      )}
      <div className="message-content">
        <MarkdownRenderer>{displayText}</MarkdownRenderer>
        {isStreaming && message.sender === "bot" && <span className="streaming-indicator">▊</span>}
        <span className={`timestamp-${message.sender}`}>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      {message.sender === "bot" && (
        <div className="message-actions">
          <button onClick={handleCopy} className="copy-button" title="Copy message">
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
          <button onClick={() => onRegenerate?.(message.id)} className="regenerate-button" title="Regenerate message" disabled={isGlobalStreaming}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
