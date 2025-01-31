import React from "react";
import { Conversation } from "../types/types";
import { ChatAPI } from "../services/api";

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, onDeleteConversation, selectedConversationId }) => {
  const handleConversationClick = async (conversationId: string) => {
    try {
      if (conversationId === "new") {
        onSelectConversation({ id: conversationId, title: "New conversation", messages: [] });
        return;
      }
      const response = await ChatAPI.getConversation(conversationId);
      const conversation = await response.data;
      onSelectConversation(conversation);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await ChatAPI.deleteConversation(conversationId);
      onDeleteConversation(conversationId);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <div className="conversation-list">
      <img src="/codeforge-logo.png" alt="CodeForge Logo" className="logo" />
      <h3>Conversations</h3>
      <div className="conversation-item" onClick={() => handleConversationClick("new")}>
        <div className="conversation-info">
          <div className="conversation-title">
            <b>+</b> New conversation
          </div>
          <div className="conversation-preview">Start a new conversation</div>
        </div>
      </div>
      <hr />
      {conversations.map((conversation) => (
        <div key={conversation.id} className={`conversation-item ${selectedConversationId === conversation.id ? "active" : ""}`} onClick={() => handleConversationClick(conversation.id!)}>
          <div className="conversation-info">
            <div className="conversation-title">{conversation.title}</div>
            <div className="conversation-preview">{conversation.messages[0]?.text || "New conversation"}</div>
          </div>
          <button className="delete-button" onClick={(e) => handleDelete(e, conversation.id!)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
