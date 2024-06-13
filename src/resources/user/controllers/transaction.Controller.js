import mongoose from "mongoose";
import User from "../models/user.js";
import Transaction from "../models/transactions.Models.js";
import got from "got";
import { v4 as uuidv4 } from "uuid";


// const credit = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // const userId = req.user.userId;
//     const userId = req.params.id
//     const { amount, type, description } = req.body;

//     if (!amount || !type || !description) {
//       return res.status(400).json({
//         error: "Invalid input",
//         message: "Please enter an amount and a type.",
//       });
//     }

//     const user = await User.findOne({ _id: userId }).session(session);

//     if (!user) {
//       return res.status(400).json({
//         error: "user not found",
//         message: "Please create a new user",
//       });
//     }

//     const balanceBefore = user.balance;
//     const updateduser = await User.findOneAndUpdate(
//       { _id: user._id },
//       { $inc: { balance: amount } },
//       { new: true, session } // Ensure you get the updated document
//     );
    

//     const balanceAfter = updateduser.balance;

//     const newTransaction = new Transaction({
//       user: user._id,
//       amount,
//       type,
//       balanceBefore,
//       balanceAfter,
//       description,
//     });

//     await newTransaction.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: "User Credited",
//       data: updateduser,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       // data: updatedWallet,
//     });
//     // next(error);
//   }
// };
const credit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount,email, userName, phoneNumber } = req.body;
      const response = await got.post("https://api.flutterwave.com/v3/payments", {
          headers: {
              Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
          },
          json: {
              tx_ref: uuidv4(),
              amount: amount,
              currency: "NGN",
              redirect_url: "https://transaction-class-example-grazac.onrender.com/",
              customer: {
                  email: email,
                  phonenumber: phoneNumber,
                  name: userName
              },
              customizations: {
                  title: "Pied Piper Payments",
                  logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
              }
          }
      }).json();
    return res.status(200).json({
      success: true,
      message: "User Credited",
      data: response,
    });
  } catch (err) {
      console.log(err);
      console.log(err.response.body);
  }
  
};

const debit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, type, description } = req.body;
    const userId = req.params.userId;

    if (!amount || !type || !description) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please enter an amount and a type.",
      });
    }

    const user = await User.findOne({ userId }).session(session);

    if (!user) {
      return res.status(400).json({
        error: "Wallet not found",
        message: "Please create a new wallet",
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
        message: "User has insufficient balance for this transaction",
      });
    }

    const balanceBefore = user.balance;

    const updatedWallet = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    const balanceAfter = updatedWallet.balance;

    const newTransaction = new Transaction({
      user: user._id,
      amount,
      type,
      balanceBefore,
      balanceAfter,
      description
    });

    await newTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Wallet Debited",
      data: updatedWallet,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      // data: updatedWallet,
    });
    // next(error);
  }
};

//  Transferring From User To USer
const transfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderUsername, amount, receiverUsername } = req.body;

    if (!senderUsername || !amount || !receiverUsername) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please provide senderUsername, amount, and receiverUsername.",
      });
    }

const sender = await User.findOne({ userName: senderUsername}).session(session);
// console.log(senderId._id);
// const senderObjectId = mongoose.Types.ObjectId(senderId._id);
// console.log(senderObjectId);
    // Find sender's wallet
    // const sender = await User.findOne({ userId: senderId._id }).session(session);

    if (!sender) {
      return res.status(400).json({
        error: "Sender's Wallet not found",
        message: "Please create a wallet for the sender",
      });
    }

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance",
        message: "Sender has insufficient balance for this transaction",
      });
    }

    const reciever = await User.findOne({ userName: receiverUsername}).session(session);

    if (!reciever) {
      return res.status(400).json({
        error: "Receiver's Wallet not found",
        message: "Please create a wallet for the receiver",
      });
    }

    // Debit the sender's wallet
    const updatedSender = await User.findOneAndUpdate(
      { _id: sender._id },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    // Credit the receiver's wallet
    const updatedReceiver = await User.findOneAndUpdate(
      { _id: reciever._id },
      { $inc: { balance: amount } },
      { new: true, session }
    );

    // Save transaction details
    const newTransaction = new Transaction({
      user: sender._id,
      amount,
      type: "transfer",
      balanceBefore: sender.balance,
      balanceAfter: updatedSender.balance,
      description: `Transfer to ${receiverUsername}`,
    });

    await newTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      data: {
        sender: updatedSender,
        receiver: updatedReceiver,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      // data: updatedWallet,
    });
    // next(error);
  }
};

const flutterwave = async (req, res, next) => {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== secretHash) {
      // This request isn't from Flutterwave; discard it
      return res.status(401).end();
    }
    const { event, data } = req.body;

    if (event === "charge.completed") {
      const email = data.customer.email;
      const { tx_ref, amount, status } = data;
    }

const user = await User.findOne({ email: email});
if (!user) {
  return res.status(401).end();
}
user.balanceBefore = user.balance
user.balance = +amount;
user.balanceAfter = user.balance

user.save();
return res.status(200).json({
  success: true,
  message: "Transaction successful",
  data: user
});
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      // data: updatedWallet,
    });
  }
}

export { credit, debit, transfer, flutterwave };
