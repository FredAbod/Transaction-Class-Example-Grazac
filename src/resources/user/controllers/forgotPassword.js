// File: /path/to/controllers/authController.js
import { sendEmail } from "../../../utils/email/email-sender.js";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import { checkExistingUser } from "../services/user.service.js";
import User from "../models/user.js";
import logger from "../../../utils/log/logger.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // const { error } = loginSchemas.validate({ email });
    if (!email) {
      return errorResMsg(res, 404, error.message);
    }

    const user = await checkExistingUser(email);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

    const emailSent = await sendEmail(
      email,
      'Password Reset Request',
      `Please click the following link to reset your password: ${resetUrl}`
    );

    if (!emailSent) {
      return errorResMsg(res, 500, "Error sending password reset email");
    }

    return successResMsg(res, 200, {
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    logger.error(error.message);
    return errorResMsg(res, 500, "Error processing password reset request");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResMsg(res, 400, "Password reset token is invalid or has expired");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResMsg(res, 200, {
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error(error.message);
    return errorResMsg(res, 500, "Error resetting password");
  }
};
