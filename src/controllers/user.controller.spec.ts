import { Test, TestingModule } from '@nestjs/testing';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { STATUS } from 'src/constants/constant';
import { UserController } from './user.controller';
import { UserService } from 'src/services/user.service';
import { UpdateUserDto } from 'src/dtos/user-input.dto';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from 'src/helpers/logger.module';

describe('UserController', () => {
  const userId = 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7';
  const ctx = new RequestContext();
  ctx.user = {
    sub: userId,
    username: 'testing',
  };
  let userController: UserController;
  const mockedUserService = {
    getById: jest.fn(),
    update: jest.fn(),
  };
  const mockedJwtService = {
    signAsync: jest.fn(),
  };

  const file: any = {
    buffer: Buffer.from('testing'),
    originalname: 'testing.png',
    mimetype: 'image/png',
  };
  const updateUserDto: UpdateUserDto = {
    fullname: 'Testing Name Edit',
    username: 'testing_edit',
    description: 'testing bio',
    password: 'NewPassword123',
    phoneNumber: '082391827412',
    profilePictureFile: file,
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
    const app: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockedUserService },
        { provide: JwtService, useValue: mockedJwtService },
      ],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  describe('getMe', () => {
    it('should success return get user data', async () => {
      jest
        .spyOn(mockedUserService, 'getById')
        .mockImplementation(async () => userOutputDto);

      const userData = await userController.getMe(ctx);

      expect(userData).toHaveProperty('status', STATUS.SUCCESS);
      expect(userData).toHaveProperty('data', userOutputDto);
    });
  });

  describe('updateProfile', () => {
    it('should success update profile', async () => {
      jest
        .spyOn(mockedUserService, 'update')
        .mockImplementation(async () => userOutputDto);

      const login = await userController.updateProfile(
        ctx,
        updateUserDto,
        file,
      );

      expect(login).toHaveProperty('status', STATUS.SUCCESS);
      expect(login).toHaveProperty('data', userOutputDto);
    });
  });
});
