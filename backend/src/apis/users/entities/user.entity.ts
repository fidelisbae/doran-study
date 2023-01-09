import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString } from 'class-validator';

@Entity({ name: 'users' })
export class UserEntity {
  @IsString()
  @PrimaryColumn({ type: String })
  id: string;

  @IsString()
  @Column({ type: String })
  password: string;

  @IsString()
  @Column({ type: String })
  nickName: string;

  @CreateDateColumn({ type: Date })
  createdAt: Date;

  @UpdateDateColumn({ type: Date })
  updatedAt: Date;

  @DeleteDateColumn({ type: Date })
  deletedAt: Date;
}
