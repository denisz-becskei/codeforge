import React, { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "../types/types";
import MessageComponent from "./Message";
import { ChatAPI } from "../services/api";

interface ChatPanelProps {
  conversation: Conversation | null;
  model: string;
  onReceiveFirstChunk: () => Promise<void>;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ conversation, model, onReceiveFirstChunk, setSelectedConversation, setConversations }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamedText]);

  const handleSend = async () => {
    if (!newMessage.trim() || isStreaming) return;
    let isFirstChunkReceived = false;

    setIsStreaming(true);
    setStreamedText("");
    const tempConvId = conversation?.id ?? `temp-${Date.now()}`;

    try {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      };

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };

      let updatedConversation: Conversation;

      if (conversation) {
        updatedConversation = {
          ...conversation,
          messages: [...conversation.messages, userMessage, botMessage],
        };
      } else {
        updatedConversation = {
          id: tempConvId,
          title: newMessage.substring(0, 20),
          messages: [userMessage, botMessage],
        };
        setConversations((prev) => [...prev, updatedConversation]);
      }

      setSelectedConversation(updatedConversation);

      await ChatAPI.streamMessage(
        tempConvId,
        newMessage,
        (data) => {
          setStreamedText((prev) => prev + data.content);
          setSelectedConversation((current) => {
            if (!current) return current;
            const updatedMessages = [...current.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.sender === "bot") {
              lastMessage.text = (lastMessage.text || "") + data.content;
              if (!isFirstChunkReceived) {
                isFirstChunkReceived = true;
                onReceiveFirstChunk();
              }
            }
            return {
              ...current,
              messages: updatedMessages,
            };
          });
        },
        (error) => {
          console.error("Streaming error:", error);
        },
        () => {
          
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setNewMessage("");
      setIsStreaming(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages">
        {conversation?.messages.map((message) => (
          <MessageComponent key={message.id} message={message} isStreaming={isStreaming && message.sender === "bot" && message === conversation.messages[conversation.messages.length - 1]} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Type your message..." disabled={isStreaming} />
        <button onClick={handleSend} disabled={isStreaming} className={isStreaming ? "opacity-50 cursor-not-allowed" : ""}>
          {isStreaming ? "Sending..." : "Send"}
        </button>
      </div>
      <p className="current-model">Current Model: {model}</p>
    </div>
  );
};

export default ChatPanel;
