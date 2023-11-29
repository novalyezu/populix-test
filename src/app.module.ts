import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ControllerModule } from './controllers/controller.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './helpers/all-exception.filter';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ElasticSearchModule } from './helpers/elasticsearch.module';
import { AwsS3Module } from './helpers/aws-s3.module';
import { LoggerModule } from './helpers/logger.module';

const configureMySQLModule = () => {
  return TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [User],
    synchronize: false,
  });
};

const configureJwtModule = () => {
  return JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '7d' },
  });
};

const configureElasticSearchModule = () => {
  return ElasticSearchModule.register({
    cloud: {
      id: process.env.ELASTIC_SEARCH_CLOUD_ID,
    },
    auth: {
      username: process.env.ELASTIC_SEARCH_AUTH_USERNAME,
      password: process.env.ELASTIC_SEARCH_AUTH_PASSWORD,
    },
  });
};

const configureAwsS3Module = () => {
  return AwsS3Module.register({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  });
};

const AllExceptionsFilterProvider = {
  provide: APP_FILTER,
  useClass: AllExceptionsFilter,
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule,
    configureMySQLModule(),
    configureJwtModule(),
    configureElasticSearchModule(),
    configureAwsS3Module(),
    ControllerModule,
  ],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilterProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
