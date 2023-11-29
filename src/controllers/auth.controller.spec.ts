import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/services/auth.service';
import { LoginOutputDto } from 'src/dtos/auth-output.dto';
import { LoginDto, RegisterDto } from 'src/dtos/auth-input.dto';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { STATUS } from 'src/constants/constant';
import { LoggerModule } from 'src/helpers/logger.module';

describe('AuthController', () => {
  const ctx = new RequestContext();
  let authController: AuthController;
  const mockedAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };
  const jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YmE1N2FlNC03YTMwLTQzMWMtYmI1YS0xN2UwYjU1N2Y0NTMiLCJ1c2VybmFtZSI6InRlc3RpbmcxMjMiLCJpYXQiOjE3MDExNDI5NDYsImV4cCI6MTcwMTIyOTM0Nn0.duXrVBVgI5h71lW7VTgWqQkPJMa8nGqau2WPjkJqdUw`;
  const userId = 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7';

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

  const loginOutputDto: LoginOutputDto = {
    id: userId,
    fullname: 'Testing Name',
    username: 'testing',
    description: 'testing bio',
    phoneNumber: '082391827412',
    profilePicture: undefined,
    accessToken: jwtToken,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockedAuthService }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should success register', async () => {
      jest
        .spyOn(mockedAuthService, 'register')
        .mockImplementation(async () => loginOutputDto);

      const register = await authController.register(ctx, registerDto);

      expect(register).toHaveProperty('status', STATUS.SUCCESS);
      expect(register).toHaveProperty('data', loginOutputDto);
    });
  });

  describe('login', () => {
    it('should success login', async () => {
      jest
        .spyOn(mockedAuthService, 'login')
        .mockImplementation(async () => loginOutputDto);

      const login = await authController.login(ctx, loginDto);

      expect(login).toHaveProperty('status', STATUS.SUCCESS);
      expect(login).toHaveProperty('data', loginOutputDto);
    });
  });
});
