const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFile(path.join(process.cwd(), "server.log"), logMessage, (err) => {
    if (err) console.error("Failed to write to server.log:", err);
  });
};

/**
 * Loads an email HTML template and replaces double-braced placeholders.
 * @param {string} templateName - Name of the template (without extension)
 * @param {Object} replacements - Key-value map of placeholders to values
 * @returns {string} Fully resolved HTML content
 */
const getTemplateContent = (templateName, replacements = {}) => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "emails",
      "templates",
      `${templateName}.html`,
    );
    let content = fs.readFileSync(filePath, "utf-8");
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
    return content;
  } catch (error) {
    const errorMsg = `[MAILER] Error loading template ${templateName}: ${error.message}`;
    console.error(errorMsg);
    logToFile(errorMsg);
    // Return a fallback basic HTML layout
    return `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>todo. Notification</h2>
        <p>${Object.entries(replacements)
          .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
          .join("<br/>")}</p>
      </div>
    `;
  }
};

/**
 * Sends an email using the Brevo SMTP API.
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.htmlContent - HTML body content
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.SENDER_EMAIL || "no-reply@todo.devkantkumar.com";
  const senderName = process.env.SENDER_NAME || "todo.";

  if (!apiKey) {
    const errorMsg =
      "[MAILER] BREVO_API_KEY is not defined in environment variables.";
    console.error(errorMsg);
    logToFile(errorMsg);
    throw new Error("Mail API key is missing");
  }

  // Extract OTP code for local console/log visibility if possible
  const otpMatch =
    htmlContent.match(/>(\d{6})</) || htmlContent.match(/\b(\d{6})\b/);
  const otp = otpMatch ? otpMatch[1] : "N/A";

  const initMsg = `[MAILER] Initiating send request - To: ${to}, Subject: "${subject}", OTP: ${otp}`;
  console.log(initMsg);
  logToFile(initMsg);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = `[MAILER] Brevo API request failed: ${JSON.stringify(data)}`;
      console.error(errorMsg);
      logToFile(errorMsg);
      throw new Error(data.message || "Failed to send email via Brevo");
    }

    const successMsg = `[MAILER] Success - Email dispatched to ${to}. Message ID: ${data.messageId || "N/A"}`;
    console.log(successMsg);
    logToFile(successMsg);

    return data;
  } catch (error) {
    const failureMsg = `[MAILER] Failure - Failed to send to ${to}. Error: ${error.message}`;
    console.error(failureMsg);
    logToFile(failureMsg);
    throw error;
  }
};

module.exports = { sendEmail, getTemplateContent };
