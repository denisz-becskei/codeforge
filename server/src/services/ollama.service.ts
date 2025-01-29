import axios from 'axios';
import { Readable } from 'stream';

class OllamaService {
  private readonly ollamaUrl: string;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
  }

  async generateResponse(prompt: string) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: 'deepseek-coder-v2:16b',
        prompt: prompt,
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to generate response');
    }
  }
}

export default new OllamaService();