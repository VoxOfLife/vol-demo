import { Module } from '@nestjs/common';
import { MainController } from './main/main.controller';
import { LogModule } from 'src/log/log.module';

@Module({
  controllers: [MainController],
  imports: [LogModule]
})
export class MainModule {}
