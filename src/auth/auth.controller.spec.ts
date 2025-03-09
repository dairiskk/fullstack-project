import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

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
    it('should throw ConflictException for duplicate email', async () => {
      const duplicateEmailDto: RegisterDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(userService, 'createUser').mockRejectedValue(new ConflictException('Email already registered'));

      await expect(authController.register(duplicateEmailDto)).rejects.toThrowError(ConflictException);
    });

    it('should register a new user with valid data', async () => {
      const validRegisterDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash(validRegisterDto.password, 10);
      const createdUser = {
        id: 1,
        email: validRegisterDto.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

      const result = await authController.register(validRegisterDto);
      expect(result).toEqual(createdUser);
      expect(userService.createUser).toHaveBeenCalledWith(validRegisterDto.email, validRegisterDto.password);
    });
  });
});