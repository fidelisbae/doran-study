import { IsArray, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'chats' })
export class ChatEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @IsString()
  @Column({ type: String })
  roomName: string;

  @IsString()
  @Column({ type: String })
  host: string;

  @IsArray()
  @Column({ type: 'simple-array' })
  users: string[];
}
