import { Test, TestingModule } from '@nestjs/testing';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { LoginDto, RegisterDto } from 'src/dtos/auth-input.dto';
import { User } from 'src/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { LoggerModule } from 'src/helpers/logger.module';

describe('AuthService', () => {
  const ctx = new RequestContext();
  let authService: AuthService;
  const mockedUserRepository = {
    findByUsername: jest.fn(),
  };
  const mockedJwtService = {
    signAsync: jest.fn(),
  };
  const mockedUserService = {
    create: jest.fn(),
    getById: jest.fn(),
  };
  const jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YmE1N2FlNC03YTMwLTQzMWMtYmI1YS0xN2UwYjU1N2Y0NTMiLCJ1c2VybmFtZSI6InRlc3RpbmcxMjMiLCJpYXQiOjE3MDExNDI5NDYsImV4cCI6MTcwMTIyOTM0Nn0.duXrVBVgI5h71lW7VTgWqQkPJMa8nGqau2WPjkJqdUw`;
  const userId = 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7';

  const user: User = {
    id: userId,
    username: 'testing',
    password: '$2b$10$S3njBo8S72e9iHM5JG04V.TsO/WUCqrwIK0X1Ci2fR9RXVFVijbJ2',
    profilePicture: 'filename.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const registerDto: RegisterDto = {
    fullname: 'Testing Name',
    username: 'testing',
    description: 'testing bio',
    phoneNumber: '082391827412',
    password: 'Testing123',
  };

  const loginDto: LoginDto = {
    username: 'testing',
    password: 'Testing123',
  };

  const userOutputDto: UserOutputDto = {
    id: 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7',
    fullname: 'Testing Name',
    username: 'testing',
    description: 'testing bio',
    phoneNumber: '082391827412',
    profilePicture: undefined,
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockedUserRepository },
        { provide: JwtService, useValue: mockedJwtService },
        { provide: UserService, useValue: mockedUserService },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('generateToken', () => {
    it('should return jwt token', async () => {
      jest
        .spyOn(mockedJwtService, 'signAsync')
        .mockImplementation(() => jwtToken);

      const token = await authService.generateToken(ctx, userOutputDto);
      expect(token).toEqual(jwtToken);
    });
  });

  describe('register', () => {
    it('should success register', async () => {
      jest
        .spyOn(mockedUserService, 'create')
        .mockImplementation(() => userOutputDto);
      jest
        .spyOn(authService, 'generateToken')
        .mockImplementation(async () => jwtToken);

      const userData = await authService.register(ctx, registerDto);

      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('fullname', userOutputDto.fullname);
      expect(userData).toHaveProperty('username', userOutputDto.username);
      expect(userData).toHaveProperty('phoneNumber', userOutputDto.phoneNumber);
      expect(userData).toHaveProperty('accessToken', jwtToken);
      expect(userData).not.toHaveProperty('password');
    });
  });

  describe('register', () => {
    it('should throw BadRequestException username or password is wrong because user not found', async () => {
      const user: User = null;

      jest
        .spyOn(mockedUserRepository, 'findByUsername')
        .mockImplementation(() => user);

      await expect(authService.login(ctx, loginDto)).rejects.toEqual(
        new BadRequestException('username or password is wrong'),
      );
    });

    it('should throw BadRequestException username or password is wrong because password not match', async () => {
      jest
        .spyOn(mockedUserRepository, 'findByUsername')
        .mockImplementation(() => user);

      await expect(authService.login(ctx, loginDto)).rejects.toEqual(
        new BadRequestException('username or password is wrong'),
      );
    });

    it('should success login', async () => {
      loginDto.password = 'newPassword123';

      jest
        .spyOn(mockedUserRepository, 'findByUsername')
        .mockImplementation(() => user);
      jest
        .spyOn(mockedUserService, 'getById')
        .mockImplementation(async () => userOutputDto);
      jest
        .spyOn(authService, 'generateToken')
        .mockImplementation(async () => jwtToken);

      const userData = await authService.login(ctx, loginDto);

      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('fullname', userOutputDto.fullname);
      expect(userData).toHaveProperty('username', userOutputDto.username);
      expect(userData).toHaveProperty('phoneNumber', userOutputDto.phoneNumber);
      expect(userData).toHaveProperty('accessToken', jwtToken);
      expect(userData).not.toHaveProperty('password');
    });
  });
});
