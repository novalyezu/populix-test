import { v4 as uuidV4 } from 'uuid';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from 'src/helpers/request-context.decorator';

@Injectable()
export class FileService {
  constructor(
    @Inject('AWS_S3')
    private s3Client: S3Client,
    @Inject('AWS_S3_BUCKET')
    private bucketName: string,
    @Inject('AWS_S3_REGION')
    private s3Region: string,
  ) {}

  public BUCKET_URL = `https://${this.bucketName}.s3.${this.s3Region}.amazonaws.com`;

  async upload(
    ctx: RequestContext,
    file: Express.Multer.File,
  ): Promise<string> {
    const ext = file.originalname.split('.');
    const newFileName = `${uuidV4()}.${ext[ext.length - 1]}`;
    const command = new PutObjectCommand({
      ACL: 'public-read',
      Bucket: this.bucketName,
      Key: newFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
    } catch (err) {
      throw err;
    }

    return newFileName;
  }

  async remove(ctx: RequestContext, filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    try {
      await this.s3Client.send(command);
    } catch (err) {
      throw err;
    }
  }

  async generateUrl(ctx: RequestContext, filename: string): Promise<string> {
    return this.BUCKET_URL + '/' + filename;
  }
}
