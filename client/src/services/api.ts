import axios from 'axios';

const api = axios.create();

export const ChatAPI = {
  getAllConversations: () => api.get('/api/chat/conversations'),
  getConversation: (id: number) => api.get(`/api/chat/conversations/${id}`),
  sendMessage: (conversationId: string | null, message: string) => {
    // Create new conversation if no ID provided
    const payload = conversationId 
      ? { conversationId, message }
      : { message };
    return api.post('/message', payload);
  }
};