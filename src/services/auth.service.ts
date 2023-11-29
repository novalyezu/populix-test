import * as bcrypt from 'bcrypt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { LoginDto, RegisterDto } from 'src/dtos/auth-input.dto';
import { LoginOutputDto } from 'src/dtos/auth-output.dto';
import { UserRepository } from 'src/repositories/user.repository';
import {
  RequestContext,
  UserAccessToken,
} from 'src/helpers/request-context.decorator';
import { UserService } from './user.service';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { AppLogger } from 'src/helpers/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private userService: UserService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async generateToken(
    ctx: RequestContext,
    user: UserOutputDto,
  ): Promise<string> {
    const payload: UserAccessToken = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async register(
    ctx: RequestContext,
    input: RegisterDto,
  ): Promise<LoginOutputDto> {
    this.logger.log(ctx, `${this.register.name} called`);

    const user = await this.userService.create(ctx, input);
    const accessToken = await this.generateToken(ctx, user);

    return plainToInstance(
      LoginOutputDto,
      {
        ...user,
        accessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async login(ctx: RequestContext, input: LoginDto): Promise<LoginOutputDto> {
    this.logger.log(ctx, `${this.login.name} called`);

    const user = await this.userRepository.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedException('username or password is wrong');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('username or password is wrong');
    }

    const userData = await this.userService.getById(ctx, user.id);
    const accessToken = await this.generateToken(ctx, userData);

    return plainToInstance(
      LoginOutputDto,
      {
        ...userData,
        accessToken,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
