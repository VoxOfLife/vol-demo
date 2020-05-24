import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { LogModule } from './log/log.module';
import { MatchingModule } from './matching/matching.module';
import { ScheduleModule } from "@nestjs/schedule";
import { NotificationsModule } from './notifications/notifications.module';
import { MainModule } from './main/main.module';
import airtableConfig from "src/config/airtable";
import appConfig from "src/config/app";
import smsConfig from "src/config/sms";
import mailConfig from "src/config/mail";

@Module({
  imports: [
    
    // setup the schedule module to create CRON jobs.
    ScheduleModule.forRoot(),

    // setup the config module
    ConfigModule.forRoot({

      // make the config module available globally.
      isGlobal: true,

      // load the configuration files.
      load: [
        appConfig,
        airtableConfig,
        smsConfig,
        mailConfig
      ],
    }),

    // setup application modules.
    LogModule,
    MatchingModule,
    NotificationsModule,
    MainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
