import React, { useEffect, useState } from 'react';
import { Conversation, Message } from './types/types';
import './App.css';
import ConversationList from './components/ConversationList';
import ChatPanel from './components/ChatPanel';
import { ChatAPI } from './services/api';

const App: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await ChatAPI.getAllConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    
    fetchConversations();
  }, []);

  const handleNewMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      const response = await ChatAPI.sendMessage(
        selectedConversation?.id || null,
        message
      );

      if (!selectedConversation) {
        // Handle new conversation
        const newConversation = {
          id: response.data.conversationId,
          title: message.substring(0, 20),
          messages: []
        };
        setConversations([...conversations, newConversation]);
        setSelectedConversation(newConversation);
      }

      // Update messages
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };

      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      const updatedConversation = selectedConversation 
        ? {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage, botMessage]
          }
        : {
            id: response.data.conversationId,
            title: message.substring(0, 20),
            messages: [newMessage, botMessage]
          };

      setSelectedConversation(updatedConversation);
      setConversations(conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="app-container">
      <ConversationList 
        conversations={conversations}
        onSelectConversation={setSelectedConversation}
      />
      <ChatPanel 
        conversation={selectedConversation}
        onSendMessage={handleNewMessage}
      />
    </div>
  );
};

export default App;