import express from "express";
const app = express();
import userRouter from "./resources/user/routes/user.routes.js"
import passwordRouter from "./resources/user/routes/password.routes.js"
import transactionRouter from "./resources/user/routes/transactions.Routes.js"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to Money app 💵💵💵 ");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/reset", passwordRouter);
app.use("/api/v1/transaction", transactionRouter);


export default app;
