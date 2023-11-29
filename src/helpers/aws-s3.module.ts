import { S3Client } from '@aws-sdk/client-s3';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class AwsS3Module {
  static register(options: AwsS3Options): DynamicModule {
    const AwsS3Provider = {
      provide: 'AWS_S3',
      useFactory: () => {
        return new S3Client({
          region: options.region,
          credentials: {
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey,
          },
        });
      },
    };

    const AwsS3Bucket = {
      provide: 'AWS_S3_BUCKET',
      useValue: options.bucket,
    };

    const AwsS3Region = {
      provide: 'AWS_S3_REGION',
      useValue: options.region,
    };

    return {
      global: true,
      module: AwsS3Module,
      providers: [AwsS3Provider, AwsS3Bucket, AwsS3Region],
      exports: [AwsS3Provider, AwsS3Bucket, AwsS3Region],
    };
  }
}

export interface AwsS3Options {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}
