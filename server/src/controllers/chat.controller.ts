import { Request, Response } from "express";
import dbService from "../services/db.service";
import { Message, Ollama } from "ollama";

class ChatController {
  async streamResponse(req: Request, res: Response) {
    let { conversationId, message } = req.body;

    try {
      const doesConversationExist = await dbService.doesConversationExist(conversationId);
      if (!doesConversationExist) {
        conversationId = (await dbService.createConversation(message)).id;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Transfer-Encoding", "chunked");

      res.flushHeaders?.();

      const ollama = new Ollama({ host: process.env.OLLAMA_HOST });

      let messages : Message[] = [];

      if(process.env.HISTORY === "true") {
        const savedMessages = await dbService.getMessages(conversationId); 
        for(const savedMessage of savedMessages) {
          messages.push({ role: savedMessage.sender, content: savedMessage.text });
        }
        if(process.env.HISTORY_DEPTH) {
          if(messages.length > parseInt(process.env.HISTORY_DEPTH)) {
            messages = messages.slice(-parseInt(process.env.HISTORY_DEPTH) - 1);
          }
        }
      }
      messages.push({ role: "user", content: message });
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || "",
        messages: messages,
        stream: true,
      });

      let text = "";

      for await (const chunk of response) {
        if (chunk.message?.content) {
          text += chunk.message.content;
          res.write(`data: ${JSON.stringify({ content: chunk.message.content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      await dbService.addMessage(conversationId, message, "user");
      await dbService.addMessage(conversationId, text, "bot");
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      res.status(500).json({ error: "Streaming failed" });
    }
  }

  async createConversation(req: Request, res: Response) {
    try {
      const { title } = req.body;
      const conversation = await dbService.createConversation(title);
      res.json(conversation);
    } catch (error) {
      console.log(error);
    }
  }

  async getConversations(_: Request, res: Response) {
    try {
      const conversations = await dbService.getConversations();
      res.json(conversations);
    } catch (error) {
      console.log(error);

      res.status(500).json({ success: false, error: "Failed to fetch conversations" });
    }
  }

  async getConversation(req: Request, res: Response) {
    const conversationId = req.params.conversationId;
    try {
      const conversations = await dbService.getConversation(conversationId);
      res.json(conversations);
    } catch (error) {
      console.log(error);

      res.status(500).json({ success: false, error: "Failed to fetch conversations" });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    const conversationId = req.params.conversationId;
    try {
      await dbService.deleteConversation(conversationId);
      res.json({ success: true, message: "Conversation deleted" });
    } catch (error) {
      console.log(error);

      res.status(500).json({ success: false, error: "Failed to fetch conversations" });
    }
  }

  async getCurrentModel(_: Request, res: Response) {
    res.status(200).json({model: process.env.OLLAMA_MODEL});
  }
}

export default new ChatController();
