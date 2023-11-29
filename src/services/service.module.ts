import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { RepositoryModule } from 'src/repositories/repository.module';
import { AuthService } from './auth.service';
import { FileService } from './file.service';

@Module({
  imports: [RepositoryModule],
  controllers: [],
  providers: [UserService, AuthService, FileService],
  exports: [UserService, AuthService, FileService],
})
export class ServiceModule {}
