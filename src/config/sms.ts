
// Twilio credentials


export default () => ({
    twilio: {
        sid: process.env.TWILIO_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        originNumber: process.env.TWILIO_NUMBER,

        /**
         * matchedNotificationMessage defines the sms message sent whenever someone has a match. You can format the message however way you 
         * like. To insert data into the message, use the following reference.
         * 
         * {{recipientName}} : The name of the recipient of the messag.
         * {{matchName}} : The name of the person the recipient has been matched with.
         * {{scheduleDate}} : The date of the call.
         * {{scheduleTime}} : The time of the call.
         * 
         */

        matchedNotificationMessage: "Hello {{recipientName}}. You have a Voxoflife call with {{matchName}}, scheduled for {{scheduleDate}} at {{scheduleTime}}. Check your email to confirm this call.",

        /**
         * matchConfirmationMessage defines the sms message sent whenever a match is confirmed. You can format the message however way you
         * like. To insert data into the message, use the following reference.
         *
         * {{recipientName}} : The name of the recipient of the messag.
         * {{matchName}} : The name of the person the recipient has been matched with.
         * {{scheduleDate}} : The date of the call.
         * {{scheduleTime}} : The time of the call.
         *
         */

        matchConfirmationMessage: "Hi {{recipientName}}. Your Voxoflife call with {{matchName}}, scheduled for {{scheduleDate}} at {{scheduleTime}} is confirmed. Please check your email for further information.",


        /**
         * matchCancellationMessage defines the sms message sent whenever a match has been cancelled. You can format the message however way you
         * like. To insert data into the message, use the following reference.
         *
         * {{recipientName}} : The name of the recipient of the messag.
         * {{matchName}} : The name of the person the recipient has been matched with.
         * {{scheduleDate}} : The date of the call.
         * {{scheduleTime}} : The time of the call.
         *
         */

        matchCancellationMessage: "Hi {{recipientName}}. We are sorry to say that your Voxoflife call with {{matchName}}, scheduled for {{scheduleDate}} at {{scheduleTime}}, has been cancelled. For more information, please check your email.",
    }

})