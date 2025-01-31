import axios from "axios";

const api = axios.create();

export const ChatAPI = {
  getAllConversations: () => api.get("/api/chat/conversations"),
  getConversation: (id: string) => api.get(`/api/chat/conversations/${id}`),
  deleteConversation: (id: string) => api.delete(`/api/chat/conversations/${id}`),
  createConversation: (title: string) => api.post("/api/chat/conversations", { title }),
  getModel: () => api.get("/api/chat/model"),
  streamMessage: async (conversationId: string | null, message: string, userMessageId: string, botMessageId: string, onToken: (data: { content: string; messageId: string; conversationId?: string }) => void, onError: (error: Error) => void, onComplete: () => void) => {
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userMessageId,
          botMessageId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.body === null) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.trim().endsWith("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "done") {
                onComplete();
                return;
              }

              if (data.content) {
                onToken(data);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
              onError(new Error("Failed to parse streaming data"));
            }
          } else {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      onError(error instanceof Error ? error : new Error("Unknown streaming error"));
    }
  },
  regenerateMessage: async (conversationId: string | null, messageId: string, onToken: (data: { content: string; messageId: string; conversationId?: string }) => void, onError: (error: Error) => void, onComplete: () => void) => {
    try {
      const response = await fetch("/api/chat/stream/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.body === null) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.trim().endsWith("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "done") {
                onComplete();
                return;
              }

              if (data.content) {
                onToken(data);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
              onError(new Error("Failed to parse streaming data"));
            }
          } else {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      onError(error instanceof Error ? error : new Error("Unknown streaming error"));
    }
  },
};
