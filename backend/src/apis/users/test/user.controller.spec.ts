import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConflictException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { request } from 'https';
import Redis from 'ioredis';
import { createResponse } from 'node-mocks-http';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import redis from 'redis-mock';

/** UserService Mocking */
const mockUserService = {
  checkInfo: jest.fn(),
  checkValidatePwd: jest.fn(),
  createUser: jest.fn(),
};

/** About RedisModule */
const redisOptions: RedisModuleOptions = {
  config: [
    {
      namespace: 'access_token',
      db: 1,
      port: 6379,
    },
  ],
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
  let app: INestApplication;
  let userController;
  let userService;
  let access_token_pool;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule.forRoot(redisOptions)],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    access_token_pool = module.get<RedisModule>(RedisModule);
    await app.init();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllTimers();
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

    /** ⭐️ */
    describe('getUsers', () => {
      it('should return success if provided with a valid access token', async () => {
        jest.spyOn(access_token_pool, 'getClient').mockImplementation(() => {
          return { get: jest.fn().mockResolvedValue(true) };
        });

        const request = { headers: { authorization: 'Bearer abc123' } };

        try {
          const result = await userController.getUsers(request, 'user123');
          expect(result).toEqual('성공!!');
        } catch (e) {
          console.error(e);
        }
      });
    });
  });
});
