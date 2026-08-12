const querystring = require("node:querystring");

const sendSms = async({ to, body }) => {
    const accountSid = process.env.TWILTO_ACCOUNT_SID;
    const authToken = process.env.TWILTO_AUTH_TOKEN;
    const fromNumber = process.env.TWILTO_FROM_NUMBER;

    if(!accountSid || !authToken || !fromNumber) {
        const configMessage =
            "SMS provider is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.";

            if(process.env.NODE_ENV === "production") {
                throw new Error(configMessage);
            }

            console.warn(`${configMessage} OTP to ${to}: ${body}`);
            return { simulated: true};
    }
    const payload = querystring.stringify({
        TO: to,
        From: fromNumber,
        Body: body,
    });

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type" : "application/x-www-from-urlencoded"
            },
            body: payload,
        }

    );

    if(!response.ok) {
        let details ="";
        try {
            const errorData = await response.json();
            details = errorData.message ? `${errorData.message}` :"";
        } catch {
            details = "";
        }

        throw new Error(`Failed to send verification SMS.${details}`);
    }
    return {simulated: false};
};

module.exports ={
    sendSms,
};