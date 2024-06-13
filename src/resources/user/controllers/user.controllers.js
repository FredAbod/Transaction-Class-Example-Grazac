import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import logger from "../../../utils/log/logger.js";
import { loginSchemas, signupSchemas } from "../../../utils/validation/validation.js";
import User from "../models/user.js";
import { checkExistingUser, checkPassword, createJwtToken } from "../services/user.service.js";

export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, phoneNumber } = req.body;
    const { error } = signupSchemas.validate(req.body);
    if (error) {
      return errorResMsg(res, 404, error.message);
    }
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return errorResMsg(res, 400, "User already exists");
    }
// const accountNumber = phoneNumber.slice(-10)
    const newUser = await User.create({
      userName,
      email,
      password,
      phoneNumber,
    //   accountNumber,
    });

    return successResMsg(res, 201, {
      success: true,
      data: newUser,
      message: "User Created Successfully",
    });
  } catch (error) {
    logger.error(error.message)
    return errorResMsg(res, 500, "User creation failed")
  }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const { error } = loginSchemas.validate(req.body);
        if (error) {
            return errorResMsg(res, 404, error.message);
          }
          const user = await checkExistingUser(email);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    const pass = await checkPassword(password, user)
    if(!pass) {
        return errorResMsg(res, 404, "Password mismatch");
    }
     const payload = {
        userId: user._id,
     }
    const token = await createJwtToken(payload)
    return successResMsg(res, 201, {
        success: true,
        data: user,
        token: token,
        message: "User Logged In Successfully",
      });
    } catch (error) {
        logger.error(error.message)
        return errorResMsg(res, 500, "error Logging IN")
    }
};