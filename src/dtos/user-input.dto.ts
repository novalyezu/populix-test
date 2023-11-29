import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullname: string;

  @ApiProperty({
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ValidateIf((o, v) => v)
  @ApiPropertyOptional({
    description:
      'min length 6 chars, should have number, alphabet upper case and lower case',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, {
    message:
      'password min length 6 chars, should have number, alphabet upper case and lower case',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'allow file type: jpg, jpeg, png. max size 2mb',
  })
  @IsOptional()
  profilePictureFile?: Express.Multer.File;
}
