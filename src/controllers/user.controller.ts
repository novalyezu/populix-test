import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { STATUS } from 'src/constants/constant';
import {
  ApiErrorResponse,
  ApiResponseWrapper,
  SwaggerApiResponseWrapper,
} from 'src/dtos/api-response-wrapper.dto';
import { UpdateUserDto } from 'src/dtos/user-input.dto';
import { UserOutputDto } from 'src/dtos/user-output.dto';
import { AuthGuard } from 'src/helpers/auth.guard';
import { AppLogger } from 'src/helpers/logger.service';
import {
  ReqContext,
  RequestContext,
} from 'src/helpers/request-context.decorator';
import { UserService } from 'src/services/user.service';

@ApiBearerAuth()
@ApiTags('v1/me')
@Controller('v1/me')
export class UserController {
  constructor(
    private userService: UserService,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @UseGuards(AuthGuard)
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(UserOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'unauthorized request',
    type: ApiErrorResponse,
  })
  async getMe(
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponseWrapper<UserOutputDto>> {
    this.logger.log(ctx, `${this.getMe.name} called`);

    const user = await this.userService.getById(ctx, ctx.user.sub);
    return { status: STATUS.SUCCESS, data: user };
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profilePictureFile'))
  @Put('')
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerApiResponseWrapper(UserOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'bad request',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'unauthorized request',
    type: ApiErrorResponse,
  })
  async updateProfile(
    @ReqContext() ctx: RequestContext,
    @Body() input: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    profilePictureFile?: Express.Multer.File,
  ): Promise<ApiResponseWrapper<UserOutputDto>> {
    this.logger.log(ctx, `${this.updateProfile.name} called`);

    input.profilePictureFile = profilePictureFile;
    const user = await this.userService.update(ctx, ctx.user.sub, input);
    return { status: STATUS.SUCCESS, data: user };
  }
}
