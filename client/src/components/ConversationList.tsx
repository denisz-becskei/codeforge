import React from 'react';
import { Conversation } from '../types/types';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
}) => {
  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      <div className="conversations">
        {conversations.map(conversation => (
          <div
            key={conversation.id}
            className="conversation-item"
            onClick={() => onSelectConversation(conversation)}
          >
            {conversation.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;