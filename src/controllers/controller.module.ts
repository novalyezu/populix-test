import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ServiceModule } from 'src/services/service.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [ServiceModule],
  controllers: [UserController, AuthController],
  providers: [],
  exports: [],
})
export class ControllerModule {}
