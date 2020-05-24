import { Injectable, Inject, Body } from '@nestjs/common';
import { MatchDto } from 'src/dtos/match-dto';
import { Twilio } from "twilio";
import { ConfigService } from '@nestjs/config';
import { PhoneNumber } from 'src/notifications/values/phone-number';
import moment from "moment-timezone";
import { LogService } from 'src/log/services/log/log.service';
import { ThisMonthPage } from 'twilio/lib/rest/api/v2010/account/usage/record/thisMonth';

@Injectable()
export class SmsNotificationService {

    private readonly smsService: Twilio
    private readonly sid: string;
    private readonly authToken: string;
    private readonly sourceNumber: string;
    private readonly smsMatchedMessage: string;
    private readonly smsConfirmationMessage: string;
    private readonly smsCancellationMessage: string;

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(LogService) private readonly log: LogService
    ) {
        this.sid = this.config.get("twilio.sid");
        this.authToken = this.config.get("twilio.authToken");
        this.sourceNumber = this.config.get('twilio.originNumber');
        this.smsMatchedMessage = this.config.get('twilio.matchedNotificationMessage');
        this.smsConfirmationMessage = this.config.get("twilio.matchConfirmationMessage");
        this.smsCancellationMessage = this.config.get("matchCancellationMessage");

        this.smsService = new Twilio(this.sid, this.authToken);
    }

    /**
     * sends the SMS notifications notifying that a match has been made.
     * @param match The match details.
     */

    async sendMatchNotification(match: MatchDto): Promise<void> {

        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, "Executing");

        // send notification to both user.
        const recipient1 = new PhoneNumber(match.participants.a.phone);

        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Preparing notification for recipient ${recipient1}`);
        let msg = this.createMatchMessage(match.participants.a.name, match.participants.b.name, match.schedule);
        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Sending notification for recipient ${recipient1}`);
        await this.sendMessage(recipient1, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Successfully sent notification for recipient ${recipient1}`);

        const recipient2 = new PhoneNumber(match.participants.b.phone);
        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Preparing notification for recipient ${recipient2}`);
        msg = this.createMatchMessage(match.participants.b.name, match.participants.a.name, match.schedule);
        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Sending notification for recipient ${recipient2}`);
        await this.sendMessage(recipient2, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, `Successfully sent notification for recipient ${recipient2}`);

        this.log.debug(SmsNotificationService.name, this.sendMatchNotification.name, "Exiting");
    }

    async sendPostMatchNotification(match: MatchDto): Promise<void> {
        this.log.debug(SmsNotificationService.name, this.sendPostMatchNotification.name, "Executing");

        this.log.debug(SmsNotificationService.name, this.sendPostMatchNotification.name, "Exiting");
    }

    /**
     * Sends a notification for a confirmed match.
     * @param match 
     */

    async sendMatchConfirmationNotification(match: MatchDto): Promise<void> {

        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, "Executing");

        // send the notification for both users.
        const recipient1 = new PhoneNumber(match.participants.a.phone);
        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Preparing SMS notification for ${recipient1}`);
        let msg = this.createConfirmationMessage(match.participants.a.name, match.participants.b.name, match.schedule);
        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Sending notification to ${recipient1}`);
        await this.sendMessage(recipient1, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Succesffuly sent notification to ${recipient1}`);

        // send the message to the second recipient
        const recipient2 = new PhoneNumber(match.participants.b.phone);
        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Preparing SMS notification for ${recipient2}`);
        msg = this.createConfirmationMessage(match.participants.b.name, match.participants.a.name, match.schedule);

        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Sending notification to ${recipient2}`);
        await this.sendMessage(recipient2, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, `Succesffuly sent notification to ${recipient2}`);

        this.log.debug(SmsNotificationService.name, this.sendMatchConfirmationNotification.name, "Exiting");
    }

    /**
     * send match cancelation notifications.
     */

    async sendMatchCancellationNotification(match: MatchDto): Promise<void> {

        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, "Executing.");

        // send message to both users
        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Preparing notifications.`);
        const recipient1 = new PhoneNumber(match.participants.a.phone);

        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Preparing notification for recipient ${recipient1}`);
        let msg = this.createCancellationMessage(match.participants.a.name, match.participants.b.name, match.schedule);

        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Sending notification to ${recipient1}`);
        await this.sendMessage(recipient1, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Successfully sent notification to ${recipient1}`);

        const recipient2 = new PhoneNumber(match.participants.b.phone);
        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Preparing notification on ${recipient2}`);
        msg = this.createCancellationMessage(match.participants.b.name, match.participants.a.name, match.schedule);

        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Sending notification to ${recipient2}`);
        await this.sendMessage(recipient2, msg);
        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, `Successfully sent notification to ${recipient2}`);

        this.log.debug(SmsNotificationService.name, this.sendMatchCancellationNotification.name, "exiting");
    }

    /**
     * Sends an SMS message.
     * @param to the phone number to send the message to.
     * @param msg The message to send.
     */

    private async sendMessage(to: PhoneNumber, msg: string): Promise<void> {

        this.log.debug(SmsNotificationService.name, this.sendMessage.name, "Executing.");

        try {
            this.log.debug(SmsNotificationService.name, this.sendMessage.name, "Sending message");
            const message = await this.smsService.messages.create({
                body: msg,
                from: this.sourceNumber,
                to: to.getE164Number()
            });

            this.log.debug(SmsNotificationService.name, this.sendMessage.name, "Successfully send message.");
        }
        catch (err) {
            const error = err as Error;
            this.log.error(SmsNotificationService.name, this.sendMessage.name, error.message, error.stack);
        }

        this.log.debug(SmsNotificationService.name, this.sendMessage.name, "Exiting");
    }

    /**
     * Creates the message for new matches.
     * @param receiverName the name of the message receiver
     * @param partnerName the name of the partner of the receiver
     * @param date the date of the match.
     * @param templateMessage the message template to use.
     */

    private createMessageFromTemplate(receiverName: string, partnerName: string, date: Date, templateMessage: string): string {

        this.log.debug(SmsNotificationService.name, this.createMessageFromTemplate.name, "Executing");
        this.log.debug(SmsNotificationService.name, this.createMessageFromTemplate.name, "Preparing template.");
        let msg = templateMessage.replace("{{recipientName}}", receiverName);
        msg = msg.replace("{{matchName}}", partnerName);

        const dateObj = moment(date).tz("America/New_York");
        const datestr = dateObj.format("dddd MMMM Do YYYY");
        msg = msg.replace("{{scheduleDate}}", datestr);

        const timeStr = dateObj.format("h:mm");
        const ampm = (dateObj.hour() > 11) ? "PM" : "AM"; 
        const timeStrWithAmpm = timeStr + ` ${ampm} ET`;
        msg = msg.replace("{{scheduleTime}}", timeStrWithAmpm);

        this.log.debug(SmsNotificationService.name, this.createMessageFromTemplate.name, "Successfully generated template.");
        this.log.debug(SmsNotificationService.name, this.createMessageFromTemplate.name, "Exiting.");
        return msg;
    }

    /**
     * creates the match message.
     * @param receiverName the name of the recipient of the message.
     * @param partnerName the name of the other person.
     * @param date the date of the match schedule.
     */

    private createMatchMessage(receiverName: string, partnerName: string, date: Date): string {
        return this.createMessageFromTemplate(receiverName, partnerName, date, this.smsMatchedMessage);
    }

    private createConfirmationMessage(receiverName: string, partnerName: string, date: Date): string {
        return this.createMessageFromTemplate(receiverName, partnerName, date, this.smsConfirmationMessage);
    }

    private createCancellationMessage(receiverName: string, partnerName: string, date: Date): string {
        return this.createMessageFromTemplate(receiverName, partnerName, date, this.smsCancellationMessage);
    }
}
