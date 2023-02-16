import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ERROR } from 'src/commons/utils/error.enum';

import { UserEntity } from './entities/user.entity';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { DeleteUserInput } from './dto/deleteUser.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>, //
  ) {}

  // /////////////////////////////////////////////////////////////////
  // utils

  /** 로그인을 위한 회원정보 판별 */
  async isValidUser(
    id: string, //
  ) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new ConflictException(ERROR.INVALID_USER_ID);
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
      throw new ConflictException(ERROR.NOT_A_PASSWORD_FORM);
    }

    return checkPassword;
  }

  /** 중복 id, nickname 체크 */
  async checkInfo(
    id: string, //
    nickName?: string,
  ) {
    if (id.length < 5 || nickName.length < 5) {
      throw new ConflictException(ERROR.INVALID_FORM);
    }

    const user = await this.userRepository.find({
      where: [
        { id }, //
        { nickName },
      ],
    });

    if (user.length !== 0) {
      throw new ConflictException(ERROR.ALREADY_EXIST_USER);
    }

    return user;
  }

  // ///////////////////////////////////////////////////////////////////////////////
  /** 로그인 회원 정보 조회 */
  async getUser(
    id: string, //
  ) {
    const result = await this.userRepository.findOne({
      select: ['id', 'nickName'],
      where: { id },
    });

    if (result === undefined) {
      throw new ConflictException(ERROR.INVALID_USER_INFO);
    }

    return result;
  }

  /** 회원생성 */
  async createUser(
    input: CreateUserInput, //
  ): Promise<UserEntity> {
    const { password, ...form } = input;
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      ...form,
      password: hashPassword,
    });

    return user;
  }

  /** 회원정보 수정 */
  async updateUser(
    id: string,
    input: UpdateUserInput, //
  ) {
    if (input.nickName.length < 5) {
      throw new ConflictException(ERROR.INVALID_FORM);
    }

    if (input.password) {
      await this.checkValidatePwd(input.password);
      input.password = await bcrypt.hash(input.password, 10);
    }
    const result = await this.userRepository.update(id, input);

    return result.affected ? true : false;
  }

  /** 회원 삭제 */
  async deleteUser(
    id: string,
    pwd: string, //
    input: DeleteUserInput,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    const isAuthenticated = await bcrypt.compare(input.password, user.password);
    const isAuthenticated2 = await bcrypt.compare(pwd, user.password);

    if (!isAuthenticated && !isAuthenticated2) {
      throw new UnauthorizedException(ERROR.INVALID_USER_PASSWORD);
    }

    const result = await this.userRepository.softDelete(id);
    return result.affected ? true : false;
  }
}
