import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';

const mockSave = jest.fn();
const mockGetSignedUrl = jest.fn();
const mockGetMetadata = jest.fn();
const mockFile = jest.fn();
const mockBucket = jest.fn();

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: mockBucket,
  })),
}));

describe('UploadService', () => {
  let service: UploadService;

  const multerFile: Express.Multer.File = {
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    fieldname: 'image',
    encoding: '7bit',
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    mockFile.mockReturnValue({ save: mockSave, getSignedUrl: mockGetSignedUrl });
    mockBucket.mockReturnValue({ file: mockFile, getMetadata: mockGetMetadata });
    mockSave.mockResolvedValue(undefined);
    mockGetSignedUrl.mockResolvedValue(['https://signed-url.example.com']);
    mockGetMetadata.mockResolvedValue([{}]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should return url, filename, localPath on success', async () => {
      const result = await service.uploadImage(multerFile);

      expect(result.url).toMatch(
        /^https:\/\/storage\.googleapis\.com\/.+\/images\/medicine\/.+test-image\.jpg$/,
      );
      expect(result.filename).toMatch(/^images\/medicine\/.+test-image\.jpg$/);
      expect(result.localPath).toBe(result.filename);
    });

    it('should throw when GCS save fails', async () => {
      mockSave.mockRejectedValueOnce(new Error('GCS save failed'));

      await expect(service.uploadImage(multerFile)).rejects.toThrow(
        'Failed to upload image to cloud storage: GCS save failed',
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should return signed url', async () => {
      const url = await service.getSignedUrl('images/medicine/test.jpg');
      expect(url).toBe('https://signed-url.example.com');
    });

    it('should use custom expiresIn', async () => {
      await service.getSignedUrl('images/medicine/test.jpg', 7200);
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'read' }),
      );
    });

    it('should throw when getSignedUrl fails', async () => {
      mockGetSignedUrl.mockRejectedValueOnce(new Error('Signing failed'));

      await expect(service.getSignedUrl('images/medicine/test.jpg')).rejects.toThrow(
        'Failed to generate signed URL',
      );
    });
  });

  describe('testConnection', () => {
    it('should return true when GCS is reachable', async () => {
      const result = await service.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when GCS connection fails', async () => {
      mockGetMetadata.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });
});