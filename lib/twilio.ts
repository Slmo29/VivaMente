import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp(to: string, body: string) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: `whatsapp:${to}`,
    body,
  });
}

export async function sendSMS(to: string, body: string) {
  return client.messages.create({
    from: process.env.TWILIO_SMS_NUMBER!,
    to,
    body,
  });
}

export async function sendNotifica(
  canale: "whatsapp" | "sms" | "email",
  telefono: string,
  messaggio: string
) {
  if (canale === "whatsapp") {
    return sendWhatsApp(telefono, messaggio);
  }
  if (canale === "sms") {
    return sendSMS(telefono, messaggio);
  }
}
