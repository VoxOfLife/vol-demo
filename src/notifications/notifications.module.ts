import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification/notification.service';
import { SmsNotificationService } from './services/sms-notification/sms-notification.service';
import { EmailNotificationService } from './services/email-notification/email-notification.service';
import { LogModule } from 'src/log/log.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [
    NotificationService, 
    SmsNotificationService, 
    EmailNotificationService,
  ],
  imports: [LogModule, ConfigModule],
  exports: [NotificationService]
})
export class NotificationsModule {}
