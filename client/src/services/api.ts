import axios from 'axios';

const api = axios.create({
  baseURL: '/api/chat',
});

export const ChatAPI = {
  getAllConversations: () => api.get('/conversations'),
  getConversation: (id: number) => api.get(`/conversations/${id}`),
  sendMessage: (conversationId: string | null, message: string) => {
    // Create new conversation if no ID provided
    const payload = conversationId 
      ? { conversationId, message }
      : { message };
    return api.post('/message', payload);
  }
};