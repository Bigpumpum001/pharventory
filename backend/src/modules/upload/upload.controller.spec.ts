import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadResponse } from './upload.service';

const mockUploadService: Pick<UploadService, 'uploadImage'> = {
  uploadImage: jest.fn(),
};

describe('UploadController', () => {
  let controller: UploadController;

  const makeFile = (
    overrides: Partial<Express.Multer.File> = {},
  ): Express.Multer.File => ({
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake'),
    fieldname: 'image',
    encoding: '7bit',
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  const uploadResponse: UploadResponse = {
    url: 'https://storage.googleapis.com/pharventory-bucket/images/medicine/test.jpg',
    filename: 'images/medicine/test.jpg',
    localPath: 'images/medicine/test.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should return success response for valid jpeg', async () => {
      (mockUploadService.uploadImage as jest.Mock).mockResolvedValueOnce(
        uploadResponse,
      );

      const result = await controller.uploadImage(makeFile());

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully',
        data: uploadResponse,
      });
      expect(mockUploadService.uploadImage).toHaveBeenCalledTimes(1);
    });

    it('should return success response for image/png', async () => {
      (mockUploadService.uploadImage as jest.Mock).mockResolvedValueOnce(
        uploadResponse,
      );

      const result = await controller.uploadImage(
        makeFile({ mimetype: 'image/png' }),
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should return success response for image/webp', async () => {
      (mockUploadService.uploadImage as jest.Mock).mockResolvedValueOnce(
        uploadResponse,
      );

      const result = await controller.uploadImage(
        makeFile({ mimetype: 'image/webp' }),
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should return success response for image/jpg', async () => {
      (mockUploadService.uploadImage as jest.Mock).mockResolvedValueOnce(
        uploadResponse,
      );

      const result = await controller.uploadImage(
        makeFile({ mimetype: 'image/jpg' }),
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        controller.uploadImage(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(new BadRequestException('No file uploaded'));
    });

    it('should throw BadRequestException for unsupported mime type', async () => {
      await expect(
        controller.uploadImage(makeFile({ mimetype: 'image/gif' })),
      ).rejects.toThrow(
        new BadRequestException('Only JPEG, PNG, and WebP images are allowed'),
      );
    });

    it('should throw BadRequestException when file exceeds 5MB', async () => {
      await expect(
        controller.uploadImage(makeFile({ size: 5 * 1024 * 1024 + 1 })),
      ).rejects.toThrow(
        new BadRequestException('File size must not exceed 5MB'),
      );
    });

    it('should throw BadRequestException when uploadService throws', async () => {
      (mockUploadService.uploadImage as jest.Mock).mockRejectedValueOnce(
        new Error('GCS unavailable'),
      );

      await expect(controller.uploadImage(makeFile())).rejects.toThrow(
        new BadRequestException('GCS unavailable'),
      );
    });
  });
});
