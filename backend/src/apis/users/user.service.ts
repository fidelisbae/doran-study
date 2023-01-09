import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { CreateUserInput } from './dto/createUser.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>, //
  ) {}

  async hasNickname(
    nickName: string, //
  ) {}

  async createUser(
    input: CreateUserInput, //
  ) {
    const { id, password, nickName } = input;

    const user = await this.userRepository.save({
      ...input,
    });

    return user;
  }
}
