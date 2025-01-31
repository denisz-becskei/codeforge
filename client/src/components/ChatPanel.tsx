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
    if(!conversation?.id) {
      const newConversation = await ChatAPI.createConversation(newMessage);
      conversation = newConversation.data;
      conversation!.messages = [];
      setSelectedConversation(conversation);
    }

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

      if(!conversation?.id) {
        return;
      }

      let updatedConversation: Conversation = {
          ...conversation,
          messages: [...conversation!.messages, userMessage, botMessage],
        };

      setSelectedConversation(updatedConversation);

      await ChatAPI.streamMessage(
        updatedConversation.id,
        newMessage,
        userMessage.id,
        botMessage.id,
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
        () => {}
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setNewMessage("");
      setIsStreaming(false);
    }
  };
  
  const handleRegenerate = async (botMessageId: string) => {
    if (!conversation) return;
    let isFirstChunkReceived = false;

    const botMessageIndex = conversation.messages.findIndex((m) => m.id === botMessageId);
    if (botMessageIndex === -1) return;

    const userMessage = conversation.messages[botMessageIndex - 1];
    if (!userMessage || userMessage.sender !== 'user') return;

    const truncatedMessages = conversation.messages.slice(0, botMessageIndex);

    const savedBotMessage = conversation.messages[botMessageIndex];

    try {
      setIsStreaming(true);
      setStreamedText("");

      const updatedConversation: Conversation = {
        ...conversation,
        messages: truncatedMessages,
      };

      setSelectedConversation(updatedConversation);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };

      const newMessages = [...truncatedMessages, botMessage];
      setSelectedConversation((prev) => prev ? { ...prev, messages: newMessages } : prev);

      await ChatAPI.regenerateMessage(
        updatedConversation.id,
        savedBotMessage.id,
        (data) => {
          setStreamedText((prev) => prev + data.content);
          setSelectedConversation((current) => {
            if (!current) return current;
            const updatedMessages = [...current.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.sender === "bot") {
              lastMessage.text = (lastMessage.text || "") + data.content;
              if (data.content && !isFirstChunkReceived) {
                isFirstChunkReceived = true;
                onReceiveFirstChunk();
              }
            }
            return { ...current, messages: updatedMessages };
          });
        },
        (error) => {
          console.error("Streaming error:", error);
        },
        () => {}
      );
    } catch (error) {
      console.error("Error regenerating message:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages">
        {conversation?.messages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.sender === 'bot' && message === conversation?.messages[conversation.messages.length - 1]}
            isGlobalStreaming={isStreaming}
            onRegenerate={handleRegenerate}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Type your message..." disabled={isStreaming} />
        <button onClick={handleSend} disabled={isStreaming || !newMessage.trim()} className={isStreaming ? "opacity-50 cursor-not-allowed" : ""}>
          {isStreaming ? "Sending..." : "Send"}
        </button>
      </div>
      <p className="current-model">Current Model: {model}</p>
    </div>
  );
};

export default ChatPanel;
