import AppDataSource from "../config/data-source";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

class DBService {
  private conversationRepo = AppDataSource.getRepository(Conversation);
  private messageRepo = AppDataSource.getRepository(Message);

  async createConversation(title: string): Promise<Conversation> {
    const conversation = new Conversation();
    conversation.title = title;
    return this.conversationRepo.save(conversation);
  }

  async addMessage(conversationId: string, text: string, sender: 'user' | 'bot') {
    const conversation = await this.conversationRepo.findOne({ 
      where: { id: conversationId },
      relations: ["messages"]
    });
    
    if (!conversation) throw new Error('Conversation not found');
    
    const message = new Message();
    message.text = text;
    message.sender = sender;
    message.timestamp = new Date();
    message.conversation = conversation;
    
    return this.messageRepo.save(message);
  }

  async getConversations(): Promise<Conversation[]> {
    return this.conversationRepo.find({ 
      relations: ["messages"],
      order: {
        messages: { timestamp: "ASC" }
      }
    });
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ["messages"],
      order: {
        messages: { timestamp: "ASC" }
      }
    });
  }
}

export default new DBService();