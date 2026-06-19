const { sendEmail } = require("./src/utils/mailer");

const runTest = async () => {
  try {
    console.log("Sending test email...");
    await sendEmail({
      to: "eyemdev@gmail.com",
      subject: "Test Email from todo.",
      htmlContent: "<div style='font-family:sans-serif; text-align:center;'><h3>This is a test email!</h3><p>Your OTP is <strong>987654</strong>.</p></div>"
    });
    console.log("Test execution completed successfully!");
  } catch (error) {
    console.error("Test execution failed:", error);
  }
};

runTest();
