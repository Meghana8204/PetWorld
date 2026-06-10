import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure the email transport
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to Outlook or others
      auth: {
        user: process.env.EMAIL_USER, // Your sender email (e.g., Gmail)
        pass: process.env.EMAIL_PASS, // Your app password (not your normal password)
      },
    });

    const mailOptions = {
      from: `"PetPal Admin 🐾" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
