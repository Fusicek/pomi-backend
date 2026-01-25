import nodemailer from "nodemailer";

/**
 * Základní emailová služba
 * Používá se pro notifikace (propojení, chat, dokončení zakázky)
 */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: `"Pomi" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email odeslán:", to, subject);
  } catch (err) {
    console.error("❌ Chyba při odesílání emailu", err);
  }
}
