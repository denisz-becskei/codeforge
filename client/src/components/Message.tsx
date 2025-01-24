import React from 'react';
import { Message } from '../types/types';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        <p>{message.text}</p>
        <span className="timestamp">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageComponent;