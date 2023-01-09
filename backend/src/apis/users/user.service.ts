import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { CreateUserInput } from './dto/createUser.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>, //
  ) {}

  // /////////////////////////////////////////////////////////////////
  // utils

  /** 로그인을 위한 회원정보 판별 */
  async isVailedUser(
    id: string, //
  ) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new ConflictException('일치하는 id가 없습니다.');
    }
    return user;
  }

  /** 유효한 비밀번호 check */
  async checkValidatePwd(
    pwd: string, //
  ) {
    const checkPassword =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        pwd,
      );
    if (!checkPassword) {
      throw new ConflictException(
        '유효한 비밀번호가 아닙니다. 양식에 맞춰 다시 입력해주세요.',
      );
    }

    return checkPassword;
  }

  /** 중복 id, nickname 체크 */
  async checkInfo(
    id: string, //
    nickName?: string,
  ) {
    const user = await this.userRepository.find({
      where: [
        { id }, //
        { nickName },
      ],
    });

    if (user.length !== 0) {
      throw new ConflictException('이미 있는 아이디 혹은 닉네임 입니다.');
    }

    return user;
  }

  // ///////////////////////////////////////////////////////////////////////////////
  /** 회원생성 */
  async createUser(
    input: CreateUserInput, //
  ): Promise<UserEntity> {
    const { id, password, nickName } = input;
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      id,
      nickName,
      password: hashPassword,
    });

    return user;
  }
}
