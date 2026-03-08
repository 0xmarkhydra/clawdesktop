import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private vpsSetupContext = '';

  constructor(
    @InjectPinoLogger(KnowledgeService.name)
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit() {
    try {
      let docPath = path.join(__dirname, '..', 'docs', 'vps_setup.txt');
      if (!fs.existsSync(docPath)) {
        // Fallback cho development khi nest-cli chưa copy sang dist kịp
        docPath = path.join(process.cwd(), 'src', 'modules', 'business', 'docs', 'vps_setup.txt');
      }
      
      if (fs.existsSync(docPath)) {
        this.vpsSetupContext = fs.readFileSync(docPath, 'utf8');
        this.logger.info('Loaded VPS setup documentation for AI context.');
      } else {
        this.logger.warn(`Could not find document at ${docPath}`);
      }
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to load knowledge documents');
    }
  }

  getVpsContext(): string {
    return this.vpsSetupContext;
  }
}
