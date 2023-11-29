import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { STATUS } from 'src/constants/constant';
import { UserService } from 'src/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserController } from 'src/controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import { UpdateUserDto } from 'src/dtos/user-input.dto';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/helpers/all-exception.filter';
import { LoggerModule } from 'src/helpers/logger.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const mockedUserService = {
    getById: jest.fn(),
    update: jest.fn(),
  };
  const mockedJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };
  const jwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YmE1N2FlNC03YTMwLTQzMWMtYmI1YS0xN2UwYjU1N2Y0NTMiLCJ1c2VybmFtZSI6Im5vdmFsIiwiaWF0IjoxNzAxMTkwNDYyLCJleHAiOjE3MDk4MzA0NjJ9.dznRvB63nvvgJ_bWaxatgmXZ7GyLMBmfhpvBpss6j28';

  const userOutputDto: UserOutputDto = {
    id: 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7',
    fullname: 'Testing Name',
    username: 'testing',
    description: 'testing bio',
    phoneNumber: '082391827412',
    profilePicture: undefined,
  };
  const updateUserDto: UpdateUserDto = {
    fullname: 'Testing Name Edit',
    username: 'testing_edit',
    description: 'testing bio',
    password: 'NewPassword123',
    phoneNumber: '082391827412',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), LoggerModule],
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockedUserService },
        { provide: JwtService, useValue: mockedJwtService },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  describe('/v1/me (GET)', () => {
    it('should return 401 Unauthorized request', () => {
      return request(app.getHttpServer())
        .get('/v1/me')
        .expect(401)
        .then((response) => {
          expect(response.body.statusCode).toEqual(401);
          expect(response.body.message).toEqual('Unauthorized');
        });
    });

    it('should return 200 with user data', () => {
      jest
        .spyOn(mockedUserService, 'getById')
        .mockImplementation(async () => userOutputDto);

      return request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.status).toEqual(STATUS.SUCCESS);
          expect(response.body.data).toEqual(userOutputDto);
        });
    });
  });

  describe('/v1/me (PUT)', () => {
    it('should return 400 BadRequest password not valid', () => {
      return request(app.getHttpServer())
        .put('/v1/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('fullname', updateUserDto.fullname)
        .field('username', updateUserDto.username)
        .field('description', updateUserDto.description)
        .field('password', '123')
        .field('phoneNumber', updateUserDto.phoneNumber)
        .expect(400)
        .then((response) => {
          expect(response.body.statusCode).toEqual(400);
          expect(response.body.message).toEqual(
            'password min length 6 chars, should have number, alphabet upper case and lower case',
          );
        });
    });

    it('should return 200 success update profile', () => {
      jest
        .spyOn(mockedUserService, 'update')
        .mockImplementation(async () => userOutputDto);

      return request(app.getHttpServer())
        .put('/v1/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('fullname', updateUserDto.fullname)
        .field('username', updateUserDto.username)
        .field('description', updateUserDto.description)
        .field('password', updateUserDto.password)
        .field('phoneNumber', updateUserDto.phoneNumber)
        .expect(200)
        .then((response) => {
          expect(response.body.status).toEqual(STATUS.SUCCESS);
          expect(response.body.data).toEqual(userOutputDto);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
