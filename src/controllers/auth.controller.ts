import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { STATUS } from 'src/constants/constant';
import {
  ApiErrorResponse,
  ApiResponseWrapper,
  SwaggerApiResponseWrapper,
} from 'src/dtos/api-response-wrapper.dto';
import { LoginDto, RegisterDto } from 'src/dtos/auth-input.dto';
import { LoginOutputDto } from 'src/dtos/auth-output.dto';
import { AppLogger } from 'src/helpers/logger.service';
import {
  ReqContext,
  RequestContext,
} from 'src/helpers/request-context.decorator';
import { AuthService } from 'src/services/auth.service';

@ApiTags('v1/auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerApiResponseWrapper(LoginOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'error username already exists',
    type: ApiErrorResponse,
  })
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterDto,
  ): Promise<ApiResponseWrapper<LoginOutputDto>> {
    this.logger.log(ctx, `${this.register.name} called`);

    const data = await this.authService.register(ctx, input);
    return { status: STATUS.SUCCESS, data: data };
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(LoginOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'error username or password is wrong',
    type: ApiErrorResponse,
  })
  async login(
    @ReqContext() ctx: RequestContext,
    @Body() input: LoginDto,
  ): Promise<ApiResponseWrapper<LoginOutputDto>> {
    this.logger.log(ctx, `${this.login.name} called`);

    const data = await this.authService.login(ctx, input);
    return { status: STATUS.SUCCESS, data: data };
  }
}
