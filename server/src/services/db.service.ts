import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

class DBService {
  private conversationRepo: any = undefined;
  private messageRepo: any = undefined;

  async createConversation(title: string): Promise<Conversation> {
    const conversation = new Conversation();
    conversation.title = title;
    return this.conversationRepo.save(conversation);
  }

  async addMessage(messageId: string, conversationId: string, text: string, sender: "user" | "bot") {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = new Message();
    message.id = messageId;
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
        messages: { timestamp: "DESC" },
      },
    });
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ["messages"],
      order: {
        messages: { timestamp: "ASC" },
      },
    });
  }

  async doesConversationExist(conversationId: string): Promise<boolean> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.messageRepo.delete({
      conversation: conversationId,
    });

    await this.conversationRepo.delete({
      id: conversationId,
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.messageRepo.delete({
      id: messageId,
    });
  }

  async updateMessage(messageId: string, text: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new Error("Message not found");

    message.text = text;
    return this.messageRepo.save(message);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepo.find({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      order: {
        timestamp: "ASC",
      },
    });
  }

  async deletePastMessageTimestamp(referenceMessageId: string, conversationId: string) {
    const referenceMessage = await this.messageRepo.createQueryBuilder("message").select("message.timestamp").where("message.id = :messageId", { messageId: referenceMessageId }).andWhere("message.conversationId = :conversationId", { conversationId }).getOne();

    if (!referenceMessage) {
      throw new Error(`Message with ID ${referenceMessageId} not found in conversation ${conversationId}`);
    }

    return this.messageRepo.createQueryBuilder().delete().from(Message).where("timestamp > :timestamp", { timestamp: referenceMessage.timestamp }).andWhere("conversationId = :conversationId", { conversationId }).execute();
  }

  async setRepos(conversationRepository: any, messageRepository: any) {
    this.conversationRepo = conversationRepository;
    this.messageRepo = messageRepository;
  }
}

export default new DBService();
