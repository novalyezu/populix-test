import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { STATUS } from 'src/constants/constant';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/helpers/all-exception.filter';
import { LoginDto, RegisterDto } from 'src/dtos/auth-input.dto';
import { LoginOutputDto } from 'src/dtos/auth-output.dto';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
import { LoggerModule } from 'src/helpers/logger.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), LoggerModule],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockedAuthService },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  describe('/v1/auth/register (POST)', () => {
    it('should return 400 BadRequest password not valid', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ ...registerDto, password: '123' })
        .expect(400)
        .then((response) => {
          expect(response.body.statusCode).toEqual(400);
          expect(response.body.message).toEqual(
            'password min length 6 chars, should have number, alphabet upper case and lower case',
          );
        });
    });

    it('should return 400 BadRequest username already exists', () => {
      jest.spyOn(mockedAuthService, 'register').mockImplementation(async () => {
        throw new BadRequestException('username already exists');
      });

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(400)
        .then((response) => {
          expect(response.body.statusCode).toEqual(400);
          expect(response.body.message).toEqual('username already exists');
        });
    });

    it('should return 201 Created with user data', () => {
      jest
        .spyOn(mockedAuthService, 'register')
        .mockImplementation(async () => loginOutputDto);

      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(registerDto)
        .expect(201)
        .then((response) => {
          expect(response.body.status).toEqual(STATUS.SUCCESS);
          expect(response.body.data).toEqual(loginOutputDto);
        });
    });
  });

  describe('/v1/auth/login (POST)', () => {
    it('should return 401 Unauthorized username or password is wrong', () => {
      jest.spyOn(mockedAuthService, 'login').mockImplementation(async () => {
        throw new UnauthorizedException('username or password is wrong');
      });

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(401)
        .then((response) => {
          expect(response.body.statusCode).toEqual(401);
          expect(response.body.message).toEqual(
            'username or password is wrong',
          );
        });
    });

    it('should return 200 with user data', () => {
      jest
        .spyOn(mockedAuthService, 'login')
        .mockImplementation(async () => loginOutputDto);

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(200)
        .then((response) => {
          expect(response.body.status).toEqual(STATUS.SUCCESS);
          expect(response.body.data).toEqual(loginOutputDto);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
