import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { ERROR } from 'src/commons/messages/message.enum';

import { UserEntity } from './entities/user.entity';
import { checkPwdform } from './checkValidatePwd';
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
  async isValidUser(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) throw new ConflictException(ERROR.INVALID_USER_ID);
      return user;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /** 유효한 비밀번호 check */
  async checkValidatePwd(pwd: string) {
    const checkPassword = checkPwdform(pwd);
    if (!checkPassword) throw new ConflictException(ERROR.NOT_A_PASSWORD_FORM);
    return checkPassword;
  }

  /** 중복 id, nickname 체크 */
  async checkInfo(id: string, nickName?: string) {
    if (id.length < 5 || nickName.length < 2)
      throw new ConflictException(ERROR.INVALID_FORM);

    try {
      const user = await this.userRepository.find({
        where: [{ id }, { nickName }],
      });

      if (user.length !== 0)
        throw new ConflictException(ERROR.ALREADY_EXIST_USER);

      return user;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  // ///////////////////////////////////////////////////////////////////////////////
  /** 로그인 회원 정보 조회 */
  async getUserById(id: string) {
    try {
      const result = await this.userRepository.findOne({
        select: ['id', 'nickName'],
        where: { id },
      });

      if (result === undefined) {
        throw new ConflictException(ERROR.INVALID_USER_INFO);
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /** 회원생성 */
  async createUser(input: CreateUserInput) {
    await this.checkInfo(input.id, input.nickName);
    await this.checkValidatePwd(input.password);

    const hashPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository
      .save({ ...input, password: hashPassword })
      .catch((error) => {
        throw new InternalServerErrorException(error);
      });
    const { deletedAt, createdAt, updatedAt, password, ...output } = user;
    return output;
  }

  /** 회원정보 수정 */
  async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.isValidUser(id);
    if (input.nickName && input.nickName.length < 2)
      throw new ConflictException(ERROR.INVALID_FORM);

    if (input.password) {
      await this.checkValidatePwd(input.password);
      input.password = await bcrypt.hash(input.password, 10);
    }
    const result = await this.userRepository.update(id, input);

    return result.affected
      ? ERROR.USER_UPDATE_INFO_SUCCEED
      : ERROR.USER_UPDATE_INFO_FAILED;
  }

  /** 회원 삭제 */
  async deleteUser(
    id: string,
    pwd: string, //
    input: DeleteUserInput,
  ) {
    await this.isValidUser(id);
    const user = await this.userRepository.findOne({ where: { id: id } });

    const isAuthenticated = await bcrypt.compare(input.password, user.password);
    const isAuthenticated2 = await bcrypt.compare(pwd, user.password);

    if (!isAuthenticated && !isAuthenticated2)
      throw new UnauthorizedException(ERROR.INVALID_USER_PASSWORD);

    const result = await this.userRepository.softDelete(id);
    return result.affected
      ? ERROR.SUCCEED_DELETED_ACCOUNT
      : ERROR.FAILED_DELETED_ACCOUNT;
  }
}
