import React, { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "./types/types";
import "./App.css";
import ConversationList from "./components/ConversationList";
import ChatPanel from "./components/ChatPanel";
import { ChatAPI } from "./services/api";
import Resizer from "./components/Resizer";

const App: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [currentModel, setCurrentModel] = useState("");
  const messagesRef = useRef<Message[]>([]);

  const fetchConversations = async () => {
    try {
      const response = await ChatAPI.getAllConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const getCurrentModel = async () => {
    try {
      const response = await ChatAPI.getModel();
      setCurrentModel(response.data.model);
    } catch (error) {
      console.error("Error fetching current model:", error);
    }
  }

  useEffect(() => {
    getCurrentModel();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesRef.current = selectedConversation?.messages || [];
  }, [selectedConversation?.messages]);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await ChatAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleResize = (clientX: number) => {
    const newWidth = Math.max(200, Math.min(600, clientX));
    setSidebarWidth(newWidth);
  };

  return (
    <div className={`app-container ${isDragging ? "dragging" : ""}`}>
      <div className="conversation-list-container" style={{ width: sidebarWidth }}>
        <ConversationList conversations={conversations} onSelectConversation={setSelectedConversation} onDeleteConversation={handleDeleteConversation} selectedConversationId={selectedConversation?.id} />
        <Resizer onDrag={handleResize} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
      </div>
      <ChatPanel conversation={selectedConversation} model={currentModel} onReceiveFirstChunk={fetchConversations} setSelectedConversation={setSelectedConversation} setConversations={setConversations} />
    </div>
  );
};

export default App;
