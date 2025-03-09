import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        JwtService,
        PrismaService,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = {
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

      const result = await authController.register(createUserDto.email, createUserDto.password);
      expect(result).toEqual(createdUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto.email, createUserDto.password);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const accessToken = { access_token: 'jwt-token' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest.spyOn(authService, 'login').mockResolvedValue(accessToken);

      const result = await authController.login(loginDto.email, loginDto.password);
      expect(result).toEqual(accessToken);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(loginDto.email, loginDto.password)).rejects.toThrowError(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });
});