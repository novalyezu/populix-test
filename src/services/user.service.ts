import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUserInformation, User } from 'src/entities/user.entity';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { UserRepository } from 'src/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from 'src/dtos/user-input.dto';
import { plainToInstance } from 'class-transformer';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { FileService } from './file.service';
import { AppLogger } from 'src/helpers/logger.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private fileService: FileService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  async validateUsername(ctx: RequestContext, username: string): Promise<void> {
    const user = await this.userRepository.findByUsername(username);
    if (user) {
      throw new BadRequestException('username already exists');
    }
  }

  async create(
    ctx: RequestContext,
    input: CreateUserDto,
  ): Promise<UserOutputDto> {
    this.logger.log(ctx, `${this.create.name} called`);

    await this.validateUsername(ctx, input.username);

    const hashPassword = await bcrypt.hash(input.password, 10);

    const user = new User();
    user.id = uuidV4();
    user.username = input.username;
    user.password = hashPassword;
    await this.userRepository.insert(user);

    const userInformation: IUserInformation = {
      id: user.id,
      fullname: input.fullname,
      description: input.description,
      phoneNumber: input.phoneNumber,
    };
    await this.userRepository.saveInformation(userInformation);

    return plainToInstance(
      UserOutputDto,
      {
        ...user,
        ...userInformation,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async update(
    ctx: RequestContext,
    userId: string,
    input: UpdateUserDto,
  ): Promise<UserOutputDto> {
    this.logger.log(ctx, `${this.update.name} called`);

    const userData = await this.getById(ctx, userId);

    const user = new User();
    user.id = userData.id;

    if (input.profilePictureFile) {
      user.profilePicture = await this.fileService.upload(
        ctx,
        input.profilePictureFile,
      );
    }

    if (input.username !== userData.username) {
      await this.validateUsername(ctx, input.username);
      user.username = input.username;
    }

    if (input.password) {
      const hashPassword = await bcrypt.hash(input.password, 10);
      user.password = hashPassword;
    }

    await this.userRepository.update(user);

    const userInformation: IUserInformation = {
      id: user.id,
      fullname: input.fullname || userData.fullname,
      description: input.description || userData.description,
      phoneNumber: input.phoneNumber || userData.phoneNumber,
    };
    await this.userRepository.saveInformation(userInformation);

    // Remove older image if user change the profile picture
    if (user.profilePicture && userData.profilePicture) {
      const oldFile = userData.profilePicture.split('/');
      await this.fileService.remove(ctx, oldFile[oldFile.length - 1]);
    }

    return plainToInstance(
      UserOutputDto,
      {
        ...user,
        ...userInformation,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getById(ctx: RequestContext, userId: string): Promise<UserOutputDto> {
    this.logger.log(ctx, `${this.getById.name} called`);

    const userProm = this.userRepository.findById(userId);
    const userInformationProm = this.userRepository.findInformationById(userId);
    const [user, userInformation] = await Promise.all([
      userProm,
      userInformationProm,
    ]);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const userData = plainToInstance(
      UserOutputDto,
      {
        ...user,
        ...userInformation,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    if (user.profilePicture) {
      userData.profilePicture = await this.fileService.generateUrl(
        ctx,
        user.profilePicture,
      );
    }

    return userData;
  }
}
