import { Injectable, Inject } from '@nestjs/common';
import { MatchDto } from 'src/dtos/match-dto';
import { LogService } from 'src/log/services/log/log.service';
import Mail from "@sendgrid/mail"
import { ConfigService } from '@nestjs/config';
import { promises as FileSystem } from "fs";
import Path from "path";
import moment from "moment-timezone";
import { SmsNotificationService } from '../sms-notification/sms-notification.service';

@Injectable()
export class EmailNotificationService {

    // template to use to send notifications informing users of matches.
    private readonly matchNotificationContentPath: string;

    // template to use to notify users of confirmed matches
    private readonly matchConfirmationContentPath: string;

    private readonly appDomain: string;

    // the sender email address.
    private readonly senderEmail: string;

    constructor(
        @Inject(LogService) private readonly log: LogService, 
        @Inject(ConfigService) private readonly config: ConfigService
    ) {
        try {
            // initialize API
            this.log.debug(EmailNotificationService.name, "constructor", "Initializing Mail Service");
            Mail.setApiKey(this.config.get("mail.sendgridApiKey"));
            this.senderEmail = this.config.get("mail.senderEmail");
            this.appDomain = this.config.get("app.domain");

            this.matchNotificationContentPath = process.env.PWD + Path.sep + "src" + Path.sep + this.config.get('mail.templates.matchNotificationPath');
            this.matchConfirmationContentPath = process.env.PWD + Path.sep + "src" + Path.sep + this.config.get("mail.templates.matchConfirmationPath");
            this.log.debug(EmailNotificationService.name, "constructor", "Successfully nitialized Mail Service");
        }
        catch(err) {
            const error = err as Error;
            this.log.error(EmailNotificationService.name, "constructor", error.message, error.stack);
        }
    }

    /**
     * Sends an email notification to the match recipients about the match.
     * @param match The Match data
     */

    async sendMatchNotification(match: MatchDto): Promise<void> {
        // send notifications to all those users.
        this.log.debug(EmailNotificationService.name, this.sendMatchNotification.name, "Executing");
        try {

            // set email constants.
            const subject = "You have a match.";
            const theme = "Entrepreneurship";


            // get the email content.
            const schedule = match.schedule;
            let recipient = match.participants.a;
            let confirmationLink = "";
            let cancellationLink = "";
            
            // prepare the first email.
            confirmationLink = `${this.appDomain}/match/${match.id}/confirm/${recipient.id}`;
            cancellationLink = `${this.appDomain}/match/${match.id}/decline/${recipient.id}`;
            let content = await this.createMatchNotificationEmailContents(recipient.name, schedule, theme, confirmationLink, cancellationLink);

            // send the first email
            await this.sendEmail(recipient.email, subject, content);

            // prepare the second email
            recipient = match.participants.b;
            confirmationLink = `${this.appDomain}/match/${match.id}/confirm/${recipient.id}`;
            cancellationLink = `${this.appDomain}/match/${match.id}/decline/${recipient.id}`;
            content = await this.createMatchNotificationEmailContents(recipient.name, schedule,theme, confirmationLink, cancellationLink);

            // send the email
            await this.sendEmail(recipient.email, subject, content);

            
        }
        catch(err) {
            const error = err as Error;
            this.log.error(SmsNotificationService.name, this.sendMatchNotification.name, error.message, error.stack);
        }
        
        this.log.debug(EmailNotificationService.name, this.sendMatchNotification.name, "Exiting");
    }

    async sendMatchConfirmationNotification(match: MatchDto): Promise<void> {
        this.log.debug(EmailNotificationService.name, this.sendMatchConfirmationNotification.name, "Executing");

        // prepare the first email
        let recipient = match.participants.a;
        const theme = "Entrepreneurship";
        const themeClipLink = "";
        let content = this.createMatchConfirmationContent(recipient.name, theme, themeClipLink, match.link, match.number);

        this.log.debug(EmailNotificationService.name, this.sendMatchConfirmationNotification.name, "Exiting");
    }

    /**
     * send match cancelation notifications.
     */

    async sendMatchCancellationNotification(match: MatchDto): Promise<void> {
        this.log.debug(EmailNotificationService.name, this.sendMatchCancellationNotification.name, "Executing");

        this.log.debug(EmailNotificationService.name, this.sendMatchCancellationNotification.name, "Exiting");
    }

    async sendPostMatchNotification(match: MatchDto): Promise<void> {
        this.log.debug(EmailNotificationService.name, this.sendPostMatchNotification.name, "Executing");
        
        this.log.debug(EmailNotificationService.name, this.sendPostMatchNotification.name, "Exiting");
    }

    /**
     * creates a match notification for a match.
     */

    private async createMatchNotificationEmailContents(recipientName: string, schedule: Date, theme: string, confirmationLink: string, cancellationLink: string): Promise<string> {
        let content: string = "";

        try {
            // get the file contents.
            content = await this.loadTemplate(this.matchNotificationContentPath);
            
            // replace the recipient name
            content = content.replace("{{recipientName}}", recipientName);

            // replace the schedule date
            const momentDate = moment(schedule).tz("America/New_York");
            const dateStr = momentDate.format("dddd MMMM Do YYYY");
            content = content.replace("{{scheduleDate}}", dateStr);

            // set the schedule time
            const timeStr = momentDate.format("h:mm");
            const ampm = (momentDate.hour() > 11) ? "PM" : "AM"; 
            const timeStrWithAMPM = timeStr + ` ${ampm} ET`;
            content = content.replace("{{scheduleTime}}", timeStrWithAMPM);

            // set the theme 
            content = content.replace("{{theme}}", theme);

            // set the links
            content = content.replace("{{confirmationLink}}", confirmationLink);
            content = content.replace("{{cancellationLink}}", cancellationLink);
        }
        catch(err) {
            const error = err as Error;
            this.log.error(EmailNotificationService.name, this.createMatchNotificationEmailContents.name, error.message, error.stack);
        }
        return content;
    }

    private async createMatchConfirmationContent(recipientName: string, theme: string, themeClipLink: string, matchLink: string, matchNumber: string): Promise<string> {
        let content: string = "";
        try {
            content = await this.loadTemplate(this.matchConfirmationContentPath);

            // replace the name
            content = content.replace("{{recipientName}}", recipientName);

            // set the theme
            content = content.replace("{{theme}}", theme);
            content = content.replace("{{themeClipLink}}", themeClipLink)

            // set the match number and link
            content = content.replace("{{matchNumber}}", matchNumber)
            content = content.replace("{{matchLink}}", matchLink);

        }
        catch(err) {
            const error = err as Error;
            this.log.error(EmailNotificationService.name, this.createMatchConfirmationContent.name, error.message, error.stack);
        }

        return content;
    }

    /**
     * Loads a template from a file.
     * @param templatePath the path of the template.
     */

    private async loadTemplate(templatePath: string): Promise<string> {
        try {
            return await FileSystem.readFile(templatePath, {encoding: "utf-8"});
        }
        catch(err) {
            const error = err as Error;
            this.log.error(EmailNotificationService.name, this.loadTemplate.name, error.message, error.stack);
        }
    }

    /**
     * Sends an email.
     * @param recipientEmail the recipient's email address.
     * @param subject the email subject.
     * @param content 
     */

    private async sendEmail(recipientEmail: string, subject: string, content: string): Promise<void> {

        this.log.debug(SmsNotificationService.name, this.sendEmail.name, "Executing");
        
        try {
            // send the message.
            await Mail.send({
                to: recipientEmail,
                from: this.senderEmail,
                subject: subject,
                html: content,
                
            });

            this.log.debug(SmsNotificationService.name, this.sendEmail.name, "Successfully send email.");
        }
        catch(err) {
            // something went wrong.
            const error = err as Error;
            this.log.error(SmsNotificationService.name, this.sendEmail.name, error.message, error.stack);
        }

        this.log.debug(SmsNotificationService.name, this.sendEmail.name, "Exiting");
    }
}
