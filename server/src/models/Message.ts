import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Conversation } from './Conversation';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  text: string;

  @Column()
  sender: 'user' | 'bot';

  @Column({ type: 'datetime' })
  timestamp: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;
}