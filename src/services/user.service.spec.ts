import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from 'src/repositories/user.repository';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateUserDto, UpdateUserDto } from 'src/dtos/user-input.dto';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { IUserInformation, User } from 'src/entities/user.entity';
import { LoggerModule } from 'src/helpers/logger.module';

describe('UserService', () => {
  const ctx = new RequestContext();
  let userService: UserService;
  const mockedUserRepository = {
    findById: jest.fn(),
    findByUsername: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    saveInformation: jest.fn(),
    findInformationById: jest.fn(),
  };
  const mockedFileService = {
    upload: jest.fn(),
    remove: jest.fn(),
    generateUrl: jest.fn(),
  };

  const userId = 'd4acb181-a19c-4466-a2d1-da3dc5ac19d7';
  const createUserDto: CreateUserDto = {
    fullname: 'Testing Name',
    username: 'testing',
    description: 'testing bio',
    password: 'Testing123',
    phoneNumber: '082391827412',
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
        UserService,
        { provide: UserRepository, useValue: mockedUserRepository },
        { provide: FileService, useValue: mockedFileService },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  describe('validateUsername', () => {
    it('should throw BadRequestException username already exists', async () => {
      const result = { id: 1, username: 'testing' };

      jest
        .spyOn(mockedUserRepository, 'findByUsername')
        .mockImplementation(() => result);

      await expect(
        userService.validateUsername(ctx, 'testing'),
      ).rejects.toEqual(new BadRequestException('username already exists'));
    });

    it('should resolve and return void', async () => {
      const result = null;

      jest
        .spyOn(mockedUserRepository, 'findByUsername')
        .mockImplementation(() => result);

      await expect(
        userService.validateUsername(ctx, 'testing'),
      ).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('should throw BadRequestException username already exists', async () => {
      jest.spyOn(userService, 'validateUsername').mockImplementation(() => {
        throw new BadRequestException('username already exists');
      });

      await expect(userService.create(ctx, createUserDto)).rejects.toEqual(
        new BadRequestException('username already exists'),
      );
    });

    it('should success create user', async () => {
      jest.spyOn(userService, 'validateUsername').mockImplementation();
      jest.spyOn(mockedUserRepository, 'insert').mockImplementation();
      jest.spyOn(mockedUserRepository, 'saveInformation').mockImplementation();

      const userData = await userService.create(ctx, createUserDto);

      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('fullname', createUserDto.fullname);
      expect(userData).toHaveProperty('username', createUserDto.username);
      expect(userData).toHaveProperty('phoneNumber', createUserDto.phoneNumber);
    });
  });

  describe('update', () => {
    it('should success update user information', async () => {
      const updateUserDto: UpdateUserDto = {
        fullname: 'Testing Name Edit',
        username: 'testing',
        description: 'testing bio',
        password: '',
        phoneNumber: '082391827412',
        profilePictureFile: undefined,
      };

      jest
        .spyOn(userService, 'getById')
        .mockImplementation(async () => userOutputDto);
      jest.spyOn(mockedUserRepository, 'update').mockImplementation();
      jest.spyOn(mockedUserRepository, 'saveInformation').mockImplementation();

      const userData = await userService.update(ctx, userId, updateUserDto);

      expect(userData).toHaveProperty('id');
      expect(userData).toHaveProperty('fullname', updateUserDto.fullname);
    });

    it('should success update username, password, profile picture', async () => {
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
      const newFileName = 'newFileName.png';
      userOutputDto.profilePicture = 'https://path-to-s3.com/filename.png';

      jest
        .spyOn(userService, 'getById')
        .mockImplementation(async () => userOutputDto);
      jest
        .spyOn(mockedFileService, 'upload')
        .mockImplementation(async () => newFileName);
      jest.spyOn(userService, 'validateUsername').mockImplementation();
      jest.spyOn(mockedUserRepository, 'update').mockImplementation();
      jest.spyOn(mockedUserRepository, 'saveInformation').mockImplementation();
      jest.spyOn(mockedFileService, 'remove').mockImplementation();

      const userData = await userService.update(ctx, userId, updateUserDto);

      expect(userData).toHaveProperty('id', userId);
      expect(userData).toHaveProperty('fullname', updateUserDto.fullname);
      expect(userData).toHaveProperty('username', updateUserDto.username);
      expect(userData).toHaveProperty('profilePicture', newFileName);
    });
  });

  describe('getById', () => {
    it('should return user not found', async () => {
      const user = null;
      const userInformation = null;

      jest
        .spyOn(mockedUserRepository, 'findById')
        .mockImplementation(() => user);
      jest
        .spyOn(mockedUserRepository, 'findInformationById')
        .mockImplementation(() => userInformation);

      await expect(userService.getById(ctx, userId)).rejects.toEqual(
        new NotFoundException('user not found'),
      );
    });

    it('should success return user data', async () => {
      const user: User = {
        id: userId,
        username: 'testing',
        password: 'hash',
        profilePicture: 'filename.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userInformation: IUserInformation = {
        id: userId,
        fullname: 'Testing Name',
        description: 'testing bio',
        phoneNumber: '082319236124',
      };
      const profilePicture = 'https://path-to-s3.com/filename.png';

      jest
        .spyOn(mockedUserRepository, 'findById')
        .mockImplementation(() => user);
      jest
        .spyOn(mockedUserRepository, 'findInformationById')
        .mockImplementation(() => userInformation);
      jest
        .spyOn(mockedFileService, 'generateUrl')
        .mockImplementation(() => profilePicture);

      const userData = await userService.getById(ctx, userId);

      expect(userData).toHaveProperty('id', userId);
      expect(userData).toHaveProperty('fullname', userInformation.fullname);
      expect(userData).toHaveProperty('username', user.username);
      expect(userData).toHaveProperty('profilePicture', profilePicture);
      expect(userData).not.toHaveProperty('password');
    });
  });
});
