import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';
import { Public } from '@/api/decorator/public.decorator';
import { Response } from 'express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('image')
  @ApiOperation({ summary: 'Upload một ảnh lên MinIO (public, không cần auth)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh cần upload (jpg, png, webp, gif, svg) - tối đa 10MB',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadImage(file);
  }

  @Public()
  @Post('file')
  @ApiOperation({ summary: 'Upload an installer file to MinIO (public, no auth)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Installer file (dmg) to upload - maximum 800MB',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 800 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['application/x-apple-diskimage', 'application/octet-stream'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only installer files are allowed (dmg).'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadInstaller(file);
  }

  @Public()
  @Get('clawdesktop-mac')
  @ApiOperation({
    summary: 'Download ClawDesktop installer for macOS',
  })
  async downloadClawDesktopMac(@Res() res: Response) {
    const key =
      'installers/1773222980057-3942d521-4f38-4992-bd24-534927b36205.dmg';

    const stream = await this.uploadService.getInstallerStream(key);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="ClawDesktop.dmg"');

    stream.pipe(res);
  }
}
