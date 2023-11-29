import { Test, TestingModule } from '@nestjs/testing';
import { RequestContext } from 'src/helpers/request-context.decorator';
import { FileService } from './file.service';
import { LoggerModule } from 'src/helpers/logger.module';

describe('FileService', () => {
  const ctx = new RequestContext();
  let fileService: FileService;
  const mockedS3Client = {
    send: jest.fn(),
  };
  const mockedBucketName = 'bucket-test';
  const mockedS3Region = 'ap-singapore-1';
  const file: any = {
    buffer: Buffer.from('testing'),
    originalname: 'testing.png',
    mimetype: 'image/png',
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        FileService,
        { provide: 'AWS_S3', useValue: mockedS3Client },
        { provide: 'AWS_S3_BUCKET', useValue: mockedBucketName },
        { provide: 'AWS_S3_REGION', useValue: mockedS3Region },
      ],
    }).compile();

    fileService = moduleRef.get<FileService>(FileService);
  });

  describe('upload', () => {
    it('should success return new file name', async () => {
      jest.spyOn(mockedS3Client, 'send').mockImplementation();

      const newFileName = await fileService.upload(ctx, file);

      const ext = file.originalname.split('.');
      expect(newFileName).toContain(ext[ext.length - 1]);
    });

    it('should throw error', async () => {
      jest.spyOn(mockedS3Client, 'send').mockImplementation(() => {
        throw new Error();
      });

      await expect(fileService.upload(ctx, file)).rejects.toEqual(new Error());
    });
  });

  describe('remove', () => {
    it('should success remove file and return void', async () => {
      jest.spyOn(mockedS3Client, 'send').mockImplementation();

      await expect(fileService.remove(ctx, file)).resolves.toBeUndefined();
    });

    it('should throw error', async () => {
      jest.spyOn(mockedS3Client, 'send').mockImplementation(() => {
        throw new Error();
      });

      await expect(fileService.remove(ctx, file)).rejects.toEqual(new Error());
    });
  });

  describe('generateUrl', () => {
    it('should success generate url', async () => {
      const fileUrl = await fileService.generateUrl(ctx, file.originalname);
      expect(fileUrl).toContain(mockedBucketName);
      expect(fileUrl).toContain(mockedS3Region);
      expect(fileUrl).toContain(file.originalname);
    });
  });
});
