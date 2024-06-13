import User from "../models/user.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

 export const checkExistingUser = async (email)=> {
    return User.findOne({ email: email})
 }

 export const checkPassword = async (password, user) =>{
    return bcrypt.compare(password, user.password)
 }

 export const createJwtToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2day',
    });
    return token;
  };
  