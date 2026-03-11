import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT || 'https://minio.lynxsolution.vn';
    this.bucket = process.env.MINIO_BUCKET || 'app-uploads';

    this.s3Client = new S3Client({
      region: process.env.MINIO_REGION || 'us-east-1',
      endpoint: this.endpoint,
      forcePathStyle: true, // BẮT BUỘC với MinIO
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const key = `images/${Date.now()}-${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    });

    await this.s3Client.send(command);

    const url = `${this.endpoint}/${this.bucket}/${key}`;

    return { url, key };
  }

  async uploadInstaller(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const allowedMimeTypes = ['application/x-apple-diskimage', 'application/octet-stream'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const key = `installers/${Date.now()}-${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    });

    await this.s3Client.send(command);

    const url = `${this.endpoint}/${this.bucket}/${key}`;

    return { url, key };
  }

  async getInstallerStream(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new BadRequestException('Installer file not found in storage');
      }

      return response.Body as Readable;
    } catch (error) {
      throw new BadRequestException('Failed to download installer file');
    }
  }
}
