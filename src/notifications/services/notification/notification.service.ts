import { Injectable, Inject } from '@nestjs/common';
import { MatchDto } from 'src/dtos/match-dto';
import { SmsNotificationService } from '../sms-notification/sms-notification.service';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { LogService } from 'src/log/services/log/log.service';

@Injectable()
export class NotificationService {

    constructor(
        @Inject(SmsNotificationService) private readonly smsNotifService: SmsNotificationService,
        @Inject(EmailNotificationService) private readonly emailNotifService: EmailNotificationService,
        @Inject(LogService) private readonly log: LogService
    ) {}


    async sendMatchNotification(match: MatchDto): Promise<void> {
        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Executing");

        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Sending SMS Notification to match " + match.id);
        await this.smsNotifService.sendMatchNotification(match);
        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Successfully sent SMS Notification to match " + match.id);

        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Sending Email Notification to match " + match.id);
        await this.emailNotifService.sendMatchNotification(match);
        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Successfully sent Email Notification to match " + match.id);

        this.log.debug(NotificationService.name, this.sendMatchNotification.name, "Exiting successfully");
    }

    async sendMatchConfirmationNotification(match: MatchDto): Promise<void> {
        this.log.debug(NotificationService.name, this.sendMatchConfirmationNotification.name, "Executing");

        this.log.debug(NotificationService.name, this.sendMatchConfirmationNotification.name, "Sending Match Confirmation Notification for match: " + match.id);
        await this.emailNotifService.sendMatchConfirmationNotification(match);
        this.log.debug(NotificationService.name, this.sendMatchConfirmationNotification.name, "Successfully sent Match Confirmation Notification for match: " + match.id);

        this.log.debug(NotificationService.name, this.sendMatchConfirmationNotification.name, "Exiting Successfulyy");
    }

    /**
     * send match cancelation notifications.
     */

    async sendMatchCancellationNotification(match: MatchDto): Promise<void> {
        this.log.debug(NotificationService.name, this.sendMatchCancellationNotification.name, "Executing");
        await this.smsNotifService.sendMatchCancellationNotification(match);
        await this.emailNotifService.sendMatchCancellationNotification(match);
    }

    async sendPostMatchNotification(match: MatchDto): Promise<void> {
        this.log.debug(NotificationService.name, this.sendPostMatchNotification.name, "Executing");
        await this.smsNotifService.sendPostMatchNotification(match);
        await this.emailNotifService.sendPostMatchNotification(match);
        this.log.debug(NotificationService.name, this.sendPostMatchNotification.name, "Exiting");
    }
}