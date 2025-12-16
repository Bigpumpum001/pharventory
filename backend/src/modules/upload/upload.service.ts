import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

export interface UploadResponse {
  url: string;
  filename: string;
  localPath?: string;
}

@Injectable()
export class UploadService {
  private storage: Storage;
  private bucketName: string;
  private readonly logger = new Logger(UploadService.name);

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILE,
    });
    this.bucketName = process.env.GCS_BUCKET_NAME || 'pharventory-bucket';

    // Log initialization
    this.logger.log(
      `UploadService initialized with bucket: ${this.bucketName}`,
    );
    this.logger.log(`GCS Project ID: ${process.env.GCS_PROJECT_ID}`);
    this.logger.log(`GCS Key File: ${process.env.GCS_KEY_FILE}`);
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResponse> {
    this.logger.log(`Starting upload for file: ${file.originalname}`);
    this.logger.log(`File size: ${file.size} bytes`);
    this.logger.log(`File type: ${file.mimetype}`);

    try {
      const bucket = this.storage.bucket(this.bucketName);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const path = 'images/medicine/';
      const filename = `${path}${timestamp}-${randomString}-${file.originalname}`;

      this.logger.log(`Generated filename: ${filename}`);

      // Create file reference
      const fileRef = bucket.file(filename);

      // Upload file
      this.logger.log('Starting file upload to GCS...');
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      // this.logger.log('File saved to GCS, making public...');

      // // Make file public
      // await fileRef.makePublic();

      this.logger.log('File made public successfully');

      // Get public URL - return both GCS URL and local path
      const gcsPublicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
      const localPath = `${filename}`;

      this.logger.log(`GCS URL: ${gcsPublicUrl}`);
      this.logger.log(`Local path: ${localPath}`);

      const result = {
        url: gcsPublicUrl, // Use GCS URL for public access
        filename: filename,
        localPath: localPath, // Keep local path for database storage
      };

      this.logger.log(`Upload completed successfully for: ${filename}`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error uploading to GCS: ${errorMessage}`);
      this.logger.error(`Error details:`, error);
      throw new Error(
        `Failed to upload image to cloud storage: ${errorMessage}`,
      );
    }
  }

  // Helper method to generate signed URL for private access if needed
  async getSignedUrl(
    filename: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const fileRef = this.storage.bucket(this.bucketName).file(filename);
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      this.logger.log(
        `Generated signed URL for ${filename}, expires in ${expiresIn}s`,
      );
      return url;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error generating signed URL: ${errorMessage}`);
      throw new Error('Failed to generate signed URL');
    }
  }

  // Test method to verify GCS connection
  async testConnection(): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.getMetadata();
      this.logger.log('GCS connection test successful');
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`GCS connection test failed: ${errorMessage}`);
      return false;
    }
  }
}
