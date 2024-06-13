import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: mongoose.Decimal128,
    // required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit", "transfer"],
    // required: true,
  },
  description: {
    type: String,
    // required: true,
  },
  balanceBefore: {
    type: mongoose.Decimal128,
    // required: true,
  },
  balanceAfter: {
    type: mongoose.Decimal128,
    // required: true,
  },
  reference: {
    type: String,
    unique: true,
    // default: uuidv4,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
