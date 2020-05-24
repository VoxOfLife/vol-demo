import { Module, Logger } from '@nestjs/common';
import { LogService } from './services/log/log.service';

@Module({
  providers: [LogService, Logger],
  exports: [LogService],
})
export class LogModule {}
