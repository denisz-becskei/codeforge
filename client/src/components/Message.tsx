import React, { useEffect, useState } from 'react';
import { Message } from '../types/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageComponent: React.FC<MessageProps> = ({ message, isStreaming = false }) => {
  const [displayText, setDisplayText] = useState(message.text);

  useEffect(() => {
    setDisplayText(message.text);
  }, [message.text]);

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        <MarkdownRenderer>{displayText}</MarkdownRenderer>
        {isStreaming && message.sender === 'bot' && (
          <span className="streaming-indicator">▊</span>
        )}
        <span className={`timestamp-${message.sender}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageComponent;