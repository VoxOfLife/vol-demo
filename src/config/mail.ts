

export default () => ({
    mail: {
        sendgridApiKey: process.env.SENDGRID_API_KEY,

        /**
         * The sender's email address.
         */
        senderEmail: process.env.EMAIL_SENDER_ADDRESS || "noreply@voxoflife.com",

        // Email template paths.
        templates: {

            /**
             * matchNotificationPath
             * 
             * matchNotificationPath contains a path (starting from the project root) to the template 
             * to use for sending match notification emails. The template must be an html file. You are 
             * free to format the template however way you like. To specify where to insert data, use the 
             * following reference.
             * 
             * {{recipientName}} : Inserts the email recipient's name into the message.
             * {{scheduleDate}} : Inserts the schedule date into the message.
             * {{scheduleTime}} : Inserts the schedule time into the message.
             * {{confirmationLink}} : Inserts the confirmation link into the message.
             * {{cancellationLink}} : Inserts the cancellation link into the message.
             */
            matchNotificationPath: "assets/emails/match-notification.html",

            /**
             * matchConfirmationPath
             * 
             * matchConfirmationPath contains a path (starting from the project root) to the template
             * to use for sending match confirmation emails. The template must be an html file You are
             * free to format the template however way you like. To specify where to insert data, use the 
             * following reference.
             * 
             * {{recipientName}} : Insert the name of the recipient
             * {{scheduleDate}} : Insert the date of the match
             * {{scheduleTime}} : Inserts the time of the match.
             * {{theme}} : Insert the current match theme.
             * {{themeClipLink}} : Insert the link to the theme clip.
             * {{matchLink}} : Insert the match link
             * {{matchNumber}} : Insert the match's call-in number (for mobile users).
             */
            matchConfirmationPath: "assets/emails/match-confirmation.html",

        }
    }
})