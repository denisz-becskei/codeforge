import { Request, Response } from 'express';
import dbService from '../services/db.service';
import ollamaService from '../services/ollama.service';

class ChatController {
  async handleMessage(req: Request, res: Response) {
    const { conversationId, message } = req.body;
    
    try {
      // Save user message
      await dbService.addMessage(conversationId, message, 'user');
      
      // Get conversation history
      const conversation = await dbService.getConversation(conversationId);
      
      // Generate AI response
      const aiResponse = await ollamaService.generateResponse(message);
      
      // Save AI response
      await dbService.addMessage(conversationId, aiResponse, 'bot');
      
      res.json({ success: true, response: aiResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getConversations(_: Request, res: Response) {
    try {
      const conversations = await dbService.getConversations();
      res.json(conversations);
    } catch (error) {
        console.log(error);
        
      res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
  }
}

export default new ChatController();