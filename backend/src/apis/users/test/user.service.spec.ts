import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { UserEntity } from '../entities/user.entity';
import { UserService } from '../user.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

/** repository Mocking */
const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

/** dummy */
const id = 'user123';
const nickName = '홍길동';
const user = {
  id: 'user123',
  nickName: '홍길동',
  password: 'Aa1@abcdefg',
};

describe('UserService', () => {
  let userService;
  let userRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('to Be defined', async () => {
    {
      data: null;
    }
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  /** ===== isValidUser Test ===== */
  describe('isValidUser', () => {
    it('If ID does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(false);

      try {
        await userService.isValidUser('user123');
      } catch (e) {
        expect(e instanceof ConflictException).toBeTruthy();
        expect(e.message).toBe('일치하는 id가 없습니다.');
      }
    });

    it('If ID already exist', async () => {
      const id = 'user123';

      mockUserRepository.findOne.mockResolvedValue(true);
      const result = await userService.isValidUser('user123');

      expect(mockUserRepository.findOne).toBeCalledTimes(1);
      expect(mockUserRepository.findOne).toBeCalledWith({ where: { id: id } });
      expect(result).toEqual(true);
    });
  });

  /** ===== checkValidatePwd Test ===== */
  describe('checkValidatePwd', () => {
    it('should return true if password is valid', async () => {
      const pwd = 'Aa1@abcdefg';
      const result = await userService.checkValidatePwd(pwd);

      expect(result).toBe(true);
    });

    it('should throw ConflictException if password is invalid', async () => {
      const pwd = 'Aa1@abc';

      try {
        await userService.checkValidatePwd(pwd);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe(
          '유효한 비밀번호가 아닙니다. 양식에 맞춰 다시 입력해주세요.',
        );
      }
    });
  });

  /** ===== checkInfo Test ===== */
  describe('checkInfo', () => {
    it('should return user If user is not already exist', async () => {
      const result = mockUserRepository.find.mockResolvedValue([]);
      await userService.checkInfo(id, nickName);

      expect(mockUserRepository.find).toBeCalledTimes(1);
      expect(mockUserRepository.find).toBeCalledWith({
        where: [{ id }, { nickName }],
      });
    });

    it('If user already exist', async () => {
      mockUserRepository.find.mockResolvedValue([user]);

      try {
        await userService.checkInfo(id, nickName);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('이미 있는 아이디 혹은 닉네임 입니다.');
      }
    });
  });

  /** ===== getUser Test ===== */
  describe('getUser', () => {
    it('should return user If user already exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);
      await userService.getUser(id);

      expect(mockUserRepository.findOne).toBeCalledTimes(1);
      expect(mockUserRepository.findOne).toBeCalledWith({
        select: ['id', 'nickName'],
        where: { id: id },
      });
    });

    it('If user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(false);

      try {
        await userService.getUser(id);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('일치하는 정보가 없습니다. 다시 입력해주세요.');
      }
    });
  });

  /** ===== createUser Test ===== */
  describe('createUser', () => {
    it('If the user does not exist, the password must be hashed and stored.', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('dlkj1o3ifjo132l@#$');
      mockUserRepository.save.mockResolvedValue(user);

      await userService.createUser(user);

      expect(bcrypt.hash).toBeCalledWith(user.password, 10);
      expect(mockUserRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith({
        id: id,
        nickName: nickName,
        password: 'dlkj1o3ifjo132l@#$',
      });
    });
  });

  /** ===== updateUser Test ===== */
  describe('updateUser', () => {
    const result = {
      id: 'user123',
      nickName: '홍길동2',
      password: 'dlkj1o3ifjo132l@#$',
    };
    const input = {
      nickName: '홍길동2',
      password: 'Aa1@abcdefg',
    };

    it('If the user want to update a password and nickname', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('dlkj1o3ifjo132l@#$');
      mockUserRepository.update.mockResolvedValue(true);

      await userService.updateUser(id, input);

      expect(bcrypt.hash).toBeCalledWith(user.password, 10);
      expect(mockUserRepository.update).toBeCalledTimes(1);
      expect(userRepository.update).toBeCalledWith(id, input);
    });

    it('If the user want to update only nickname', async () => {
      mockUserRepository.update.mockResolvedValue(true);

      try {
        await userService.updateUser(id, { nickName: '홍길동2' });
      } catch (e) {
        expect(bcrypt.hash).not.toBeCalled();
        expect(mockUserRepository.update).toBeCalledTimes(1);
        expect(userRepository.update).toBeCalledWith(id, {
          nickName: '홍길동2',
        });
      }
    });
  });

  /** ===== deleteUser Test ===== */
  describe('deleteUser', () => {
    const input = {
      id: 'user123',
      password: 'Aa1@abcdefg',
    };

    it('If password not collect', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(undefined);

      try {
        await userService.deleteUser(id, 'Aa1@abcdefg2', input);
      } catch (e) {
        expect(bcrypt.compare).toBeCalledTimes(2);
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('비밀번호가 일치하지 않습니다.');
      }
    });

    it('should return true When the user is deleted', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.softDelete.mockResolvedValue(1);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await userService.deleteUser(id, 'Aa1@abcdefg', input);

      expect(bcrypt.compare).toBeCalledTimes(2);
      expect(mockUserRepository.softDelete).toBeCalledTimes(1);
      expect(mockUserRepository.softDelete).toBeCalledWith(id);
    });
  });
});
