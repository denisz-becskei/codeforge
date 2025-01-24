export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
}