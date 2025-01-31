import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Conversation } from "./Conversation";

@Entity()
export class Message {
  @PrimaryColumn()
  id: string;

  @Column()
  text: string;

  @Column()
  sender: 'user' | 'bot';

  @Column({ type: 'datetime' })
  timestamp: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversationId' }) 
  conversation: Conversation;

  @Column() 
  conversationId: string;
}