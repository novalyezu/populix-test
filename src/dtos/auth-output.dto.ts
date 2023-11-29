import { Expose } from 'class-transformer';
import { UserOutputDto } from './user-output.dto';

export class LoginOutputDto extends UserOutputDto {
  @Expose()
  accessToken: string;
}
