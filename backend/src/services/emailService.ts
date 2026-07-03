import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import type { CreateLeadInput } from "../types/lead.js";

const isEmailConfigured = () => Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

export const sendAcknowledgementEmail = async (lead: CreateLeadInput) => {
  if (!isEmailConfigured()) {
    console.info("SMTP is not configured. Skipping acknowledgement email.");
    return { sent: false, skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  const industryLine = lead.industry ? `We noticed your work in ${lead.industry}, and our team will keep that context in mind.` : "";

  await transporter.sendMail({
    from: `"Lead Management Team" <${env.smtpUser}>`,
    to: lead.email,
    subject: "Thanks for reaching out",
    text: `Hi ${lead.name},

Thank you for sharing your project with us. ${industryLine}

We received your note: "${lead.projectDescription}"

Our sales team will review the details and contact you shortly.

Best,
Lead Management Team`,
    html: `<p>Hi ${lead.name},</p>
<p>Thank you for sharing your project with us. ${industryLine}</p>
<p><strong>Your project:</strong> ${lead.projectDescription}</p>
<p>Our sales team will review the details and contact you shortly.</p>
<p>Best,<br/>Lead Management Team</p>`
  });

  return { sent: true, skipped: false };
};
