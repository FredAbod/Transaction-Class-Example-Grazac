import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define user schema
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "UserName Is Required"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password Is Required"],
    },
    resetPasswordToken: {
      type: String,
      // required: [true, "Password Is Required"],
    },
    resetPasswordExpires: {
      type: String,
      // required: [true, "Password Is Required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "PhoneNumber Is Required"],
      validate: {
        validator: function(v) {
          return /^\d{11}$/.test(v);
        },
        message: props => `${props.value} is not a valid 11-digit phone number!`
      },
    },
    accountNumber: {
      type: String,
      unique: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit account number!`
      },
    },
    balance: {
      type: mongoose.Decimal128,
      default: 0,
    },
    balanceBefore: {
      type: mongoose.Decimal128,
      default: 0,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    
    // Save only the first 11 digits of the phone number
    this.accountNumber = this.phoneNumber.slice(-10);

    // Generate unique 10-digit account number if not already set
    if (!this.accountNumber) {
      let generatedNumber;
      let isUnique = false;
      while (!isUnique) {
        generatedNumber = this.accountNumber
        const existingUser = await mongoose.model("User").findOne({ accountNumber: generatedNumber });
        if (!existingUser) {
          isUnique = true;
        }
      }
      this.accountNumber = generatedNumber;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
