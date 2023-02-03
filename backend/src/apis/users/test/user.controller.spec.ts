import { getRedisToken, RedisModule } from '@liaoliaots/nestjs-redis';
import { createRequest, createResponse } from 'node-mocks-http';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { UserService } from '../user.service';
import { UserController } from '../user.controller';

/** UserService Mocking */
const mockUserService = {
  checkInfo: jest.fn(),
  checkValidatePwd: jest.fn(),
  createUser: jest.fn(),
};

/** Redis Mocking*/
const mockAccessTokenPool = {
  get: jest.fn(),
};

/** DTO - createUserInput */
interface IUser {
  id: string;
  password: string;
  nickName?: string;
}

const createUserDto: IUser = {
  id: 'user123',
  password: '12345!@fd',
  nickName: '홍길동',
};

describe('UserController', () => {
  let userController;
  let userService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRedisToken('access_token'),
          useValue: mockAccessTokenPool,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('to be defined', async () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('If user does not exist', async () => {
      let res = createResponse();

      mockUserService.checkInfo.mockResolvedValue(false);
      mockUserService.checkValidatePwd.mockResolvedValue(true);
      mockUserService.createUser.mockResolvedValue(false);

      try {
        await userController.createUser(createUserDto, res);
      } catch (e) {
        expect(mockUserService.checkInfo).toBeCalledTimes(1);
        expect(mockUserService.checkInfo).toBeCalledWith(
          createUserDto.id,
          createUserDto?.nickName,
        );

        expect(mockUserService.checkValidatePwd).toBeCalledTimes(1);
        expect(mockUserService.checkValidatePwd).toBeCalledWith(
          createUserDto.password,
        );

        expect(mockUserService.createUser).toBeCalledTimes(1);
        expect(mockUserService.createUser).toBeCalledWith(false);
      }
    });

    it('If user already exist', async () => {
      let res = createResponse();
      mockUserService.checkInfo.mockResolvedValue(true);
      mockUserService.checkValidatePwd.mockResolvedValue(true);
      mockUserService.createUser.mockResolvedValue(true);

      try {
        const result = await userController.createUser(createUserDto, res);
      } catch (e) {
        expect(mockUserService.checkInfo).toBeCalledTimes(1);
        expect(mockUserService.checkInfo).toBeCalledWith(
          createUserDto.id,
          createUserDto.nickName,
        );

        expect(mockUserService.checkValidatePwd).toBeCalledTimes(1);
        expect(mockUserService.checkValidatePwd).toBeCalledWith(
          createUserDto.password,
        );

        expect(mockUserService.createUser).toBeCalledTimes(1);
        expect(mockUserService.createUser).toBeCalledWith(createUserDto);

        expect(e).toBeInstanceOf(ConflictException);
      }
    });

    describe('getUsers', () => {
      let req = createRequest({
        headers: {
          authorization: 'Bearer abc123',
        },
      });

      it('should return success if provided with a valid access token', async () => {
        const result = await userController.getUsers(req, 'user123');

        expect(mockAccessTokenPool.get).toBeCalledTimes(1);
        expect(mockAccessTokenPool.get).toBeCalledWith('abc123');
        expect(result).toEqual('성공!!');
      });

      it('should return an error if there is a token in bl_accessToken.', async () => {
        mockAccessTokenPool.get.mockResolvedValue(true);

        try {
          await userController.getUsers(req, 'user123');
        } catch (e) {
          expect(e instanceof ConflictException).toBeTruthy();
          expect(e.message).toBe('로그인을 먼저 해주세요.');
        }
      });
    });
  });
});
