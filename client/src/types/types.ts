export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type StreamEvent = {
  token: string;
  messageId: string; // Ensure this matches backend type (string/number)
  conversationId?: string; // Optional for existing conversations
};