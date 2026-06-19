const user = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail, getTemplateContent } = require("../utils/mailer");
require("dotenv").config();

const key = process.env.SECRET_KEY;
const saltRounds = 10;

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;

  let maskedLocal = "";
  if (local.length <= 2) {
    maskedLocal = local[0] + "*";
  } else {
    maskedLocal = local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  }

  const domainParts = domain.split(".");
  const maskedDomain = domainParts.map((part, index) => {
    if (index === domainParts.length - 1) return part;
    if (part.length <= 2) return part[0] + "*";
    return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
  }).join(".");

  return `${maskedLocal}@${maskedDomain}`;
}


async function signUp(req, res) {
  const { name, username, email, password } = req.body;

  try {
    const existingUsername = await user.findOne({ username: username });
    const existingEmail = await user.findOne({ email: email.toLowerCase() });

    if (existingUsername) {
      if (existingUsername.isVerified === false) {
        await user.deleteOne({ _id: existingUsername._id });
      } else {
        return res.send({
          status: false,
          message: "Username is already taken!",
        });
      }
    }

    if (existingEmail) {
      if (existingEmail.isVerified === false) {
        await user.deleteOne({ _id: existingEmail._id });
      } else {
        return res.send({
          status: false,
          message: "Email is already registered!",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 600000; // 10 minutes

    const newUser = new user({
      name: name,
      username: username,
      email: email.toLowerCase(),
      password: hashedPassword,
      date: new Date().toISOString(),
      isVerified: false,
      otp: otp,
      otpExpires: otpExpires,
    });

    await newUser.save();

    const htmlContent = getTemplateContent("verification", { otp });

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Verify Your Email - todo.",
      htmlContent: htmlContent,
    });

    res.send({
      status: true,
      message: "Verification code sent to your email. Please check your inbox.",
    });

  } catch (err) {
    console.error("Signup failed:", err);
    res.send({
      status: false,
      message: "Account creation failed!",
    });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const userData = await user.findOne({ email: email.toLowerCase() });

    if (!userData) {
      return res.send({
        status: false,
        message: "User not found!",
      });
    }

    if (userData.isVerified) {
      return res.send({
        status: false,
        message: "Account already verified. Please log in.",
      });
    }

    if (userData.otp !== otp || userData.otpExpires < Date.now()) {
      return res.send({
        status: false,
        message: "Invalid or expired verification code.",
      });
    }

    userData.isVerified = true;
    userData.otp = undefined;
    userData.otpExpires = undefined;
    await userData.save();

    // Send Welcome Email
    const welcomeHtml = getTemplateContent("welcome", { name: userData.name });

    sendEmail({
      to: userData.email,
      subject: "Welcome to todo.!",
      htmlContent: welcomeHtml,
    }).catch((err) => console.error("Welcome email failed:", err));

    res.send({
      status: true,
      message: "Account verified successfully!",
    });

  } catch (err) {
    console.error("Verification failed:", err);
    res.send({
      status: false,
      message: "Verification failed!",
    });
  }
}

async function resendOtp(req, res) {
  const { email } = req.body;

  try {
    const userData = await user.findOne({ email: email.toLowerCase() });

    if (!userData) {
      return res.send({
        status: false,
        message: "User not found!",
      });
    }

    if (userData.isVerified) {
      return res.send({
        status: false,
        message: "Account already verified.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    userData.otp = otp;
    userData.otpExpires = Date.now() + 600000; // 10 minutes
    await userData.save();

    const htmlContent = getTemplateContent("verification", { otp });

    await sendEmail({
      to: userData.email,
      subject: "New Verification Code - todo.",
      htmlContent: htmlContent,
    });

    res.send({
      status: true,
      message: "Verification code resent successfully!",
    });

  } catch (err) {
    console.error("Resending verification code failed:", err);
    res.send({
      status: false,
      message: "Failed to resend code.",
    });
  }
}

async function signIn(req, res) {
  const { username, password } = req.body;

  const existingUser = await user.findOne({
    $or: [
      { username: { $eq: username } },
      { email: { $eq: username.toLowerCase() } }
    ]
  });

  if (!existingUser) {
    res.send({
      status: false,
      message: "No account found!",
    });
  } else {
    // Check verification status (backward compatible if isVerified is undefined)
    if (existingUser.isVerified === false) {
      const otp = crypto.randomInt(100000, 999999).toString();
      existingUser.otp = otp;
      existingUser.otpExpires = Date.now() + 600000; // 10 minutes
      await existingUser.save();

      const htmlContent = getTemplateContent("verification", { otp });

      sendEmail({
        to: existingUser.email,
        subject: "Verify Your Email - todo.",
        htmlContent: htmlContent,
      }).catch((err) => console.error("Login auto-verification email failed to send:", err));

      return res.send({
        status: false,
        message: `Please verify your email before logging in. We sent a verification code to ${maskEmail(existingUser.email)}.`,
        isUnverified: true,
        email: existingUser.email,
      });
    }

    const checkPwd = await bcrypt.compare(password, existingUser.password);

    const token = jwt.sign({ id: existingUser._id, username: existingUser.username }, key);

    if (checkPwd) {
      res.send({
        status: true,
        message: "Login successful",
        token: token,
        userData: existingUser,
      });
    } else {
      res.send({
        status: false,
        message: "Incorrect Password!",
      });
    }
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const userData = await user.findOne({ email: email.toLowerCase() });

    if (!userData) {
      // Prevent user enumeration by returning success in all cases
      return res.send({
        status: true,
        message: "If that email exists in our system, we have sent a reset code.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    userData.resetPasswordOtp = otp;
    userData.resetPasswordOtpExpires = Date.now() + 600000; // 10 minutes
    await userData.save();

    const htmlContent = getTemplateContent("reset-password", { otp });

    await sendEmail({
      to: userData.email,
      subject: "Reset Password Verification Code - todo.",
      htmlContent: htmlContent,
    });

    res.send({
      status: true,
      message: "If that email exists in our system, we have sent a reset code.",
    });

  } catch (err) {
    console.error("Forgot password request failed:", err);
    res.send({
      status: false,
      message: "Failed to process forgot password request",
    });
  }
}

async function resetPassword(req, res) {
  const { email, otp, password } = req.body;

  try {
    const userData = await user.findOne({ email: email.toLowerCase() });

    if (!userData) {
      return res.send({
        status: false,
        message: "User not found!",
      });
    }

    if (userData.resetPasswordOtp !== otp || userData.resetPasswordOtpExpires < Date.now()) {
      return res.send({
        status: false,
        message: "Invalid or expired verification code.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    userData.password = hashedPassword;
    userData.resetPasswordOtp = undefined;
    userData.resetPasswordOtpExpires = undefined;
    await userData.save();

    // Send confirmation email
    const confirmationHtml = getTemplateContent("confirmation", { name: userData.name });

    sendEmail({
      to: userData.email,
      subject: "Password Reset Successful - todo.",
      htmlContent: confirmationHtml,
    }).catch((err) => console.error("Password reset confirmation failed:", err));

    res.send({
      status: true,
      message: "Password updated successfully!",
    });

  } catch (err) {
    console.error("Password reset failed:", err);
    res.send({
      status: false,
      message: "Failed to reset password.",
    });
  }
}

async function getUserData(req, res) {
  const username = req.username;
  if (username) {
    const userData = await user.findOne({ username: { $eq: username } });
    if (userData) {
      res.json({
        status: true,
        data: userData,
      });
    } else {
      res.json({
        status: false,
        message: "Unauthorized",
      });
    }
  }
}

async function updateProfile(req, res) {
  const username = req.username;
  const { name, email } = req.body;

  if (!username) {
    return res.send({
      status: false,
      message: "Unauthorized access",
    });
  }

  try {
    // Check if the email is already in use by another user
    if (email) {
      const emailExists = await user.findOne({ email: email, username: { $ne: username } });
      if (emailExists) {
        return res.send({
          status: false,
          message: "Email is already in use by another account",
        });
      }
    }

    const updatedUser = await user.findOneAndUpdate(
      { username: username },
      { name: name, email: email },
      { new: true }
    );

    if (updatedUser) {
      res.send({
        status: true,
        message: "Profile updated successfully",
        userData: updatedUser,
      });
    } else {
      res.send({
        status: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.send({
      status: false,
      message: "Failed to update profile details",
    });
  }
}

async function changePassword(req, res) {
  const username = req.username;
  const { currentPassword, newPassword } = req.body;

  if (!username) {
    return res.send({
      status: false,
      message: "Unauthorized access",
    });
  }

  try {
    const userData = await user.findOne({ username: username });
    if (!userData) {
      return res.send({
        status: false,
        message: "User not found",
      });
    }

    const checkPwd = await bcrypt.compare(currentPassword, userData.password);
    if (!checkPwd) {
      return res.send({
        status: false,
        message: "Incorrect current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    userData.password = hashedPassword;
    await userData.save();

    // Send confirmation email
    const confirmationHtml = getTemplateContent("confirmation", { name: userData.name });
    sendEmail({
      to: userData.email,
      subject: "Security Alert: Password Updated - todo.",
      htmlContent: confirmationHtml,
    }).catch((err) => console.error("Change password confirmation email failed to send:", err));

    res.send({
      status: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.send({
      status: false,
      message: "Failed to update password",
    });
  }
}

async function requestDeleteOtp(req, res) {
  const username = req.username;

  if (!username) {
    return res.send({
      status: false,
      message: "Unauthorized access",
    });
  }

  try {
    const userData = await user.findOne({ username: username });
    if (!userData) {
      return res.send({
        status: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    userData.deleteAccountOtp = otp;
    userData.deleteAccountOtpExpires = otpExpires;
    await userData.save();

    const htmlContent = getTemplateContent("delete-account-otp", { otp });

    await sendEmail({
      to: userData.email.toLowerCase(),
      subject: "Confirm Account Deletion - todo.",
      htmlContent: htmlContent,
    });

    res.send({
      status: true,
      message: "Verification code sent to your email. Please check your inbox.",
    });

  } catch (err) {
    console.error("Request delete OTP error:", err);
    res.send({
      status: false,
      message: "Failed to send verification code. Please try again.",
    });
  }
}

async function deleteAccount(req, res) {
  const username = req.username;
  const { otp } = req.body;

  if (!username) {
    return res.send({
      status: false,
      message: "Unauthorized access",
    });
  }

  if (!otp) {
    return res.send({
      status: false,
      message: "Verification code is required.",
    });
  }

  try {
    const userData = await user.findOne({ username: username });
    if (!userData) {
      return res.send({
        status: false,
        message: "User not found",
      });
    }

    // Verify OTP
    if (!userData.deleteAccountOtp || userData.deleteAccountOtp !== otp) {
      return res.send({
        status: false,
        message: "Incorrect verification code.",
      });
    }

    if (new Date() > new Date(userData.deleteAccountOtpExpires)) {
      return res.send({
        status: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const email = userData.email;

    // Delete all associated tasks/todos
    const Todo = require("../models/todoModel");
    await Todo.deleteMany({ userId: userData._id.toString() });

    // Delete the user
    await user.deleteOne({ _id: userData._id });

    // Send goodbye email
    const goodbyeHtml = getTemplateContent("goodbye", {});
    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: "Your todo. Account Has Been Deleted",
        htmlContent: goodbyeHtml,
      });
    } catch (mailErr) {
      console.error("[MAILER] Failed to send goodbye email:", mailErr);
    }

    res.send({
      status: true,
      message: "Account and associated data deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    res.send({
      status: false,
      message: "Failed to delete account",
    });
  }
}

module.exports = {
  signUp,
  signIn,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getUserData,
  updateProfile,
  changePassword,
  requestDeleteOtp,
  deleteAccount,
};
