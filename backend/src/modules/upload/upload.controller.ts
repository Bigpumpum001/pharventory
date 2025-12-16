import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService, UploadResponse } from './upload.service';

interface UploadSuccessResponse {
  statusCode: number;
  message: string;
  data: UploadResponse;
}

@ApiTags('upload')
@Controller('/api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image to Google Cloud Storage' })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    type: 'object',
  })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadSuccessResponse> {
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      this.logger.error(`Invalid file type: ${file.mimetype}`);
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.logger.error(`File size too large: ${file.size} bytes`);
      throw new BadRequestException('File size must not exceed 5MB');
    }

    try {
      this.logger.log(`Uploading file: ${file.originalname}`);
      const result = await this.uploadService.uploadImage(file);
      this.logger.log(`File uploaded successfully: ${result.filename}`);

      return {
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully',
        data: result,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Upload failed: ${errorMessage}`);
      throw new BadRequestException(errorMessage);
    }
  }
}
