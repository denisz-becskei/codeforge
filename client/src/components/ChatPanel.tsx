import React, { useState } from 'react';
import { Conversation } from '../types/types';
import MessageComponent from './Message';

interface ChatPanelProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ conversation, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages">
        {conversation?.messages.map(message => (
          <MessageComponent key={message.id} message={message} />
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatPanel;