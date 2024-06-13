import express from "express";
import { credit, debit, flutterwave, transfer } from "../controllers/transaction.Controller.js";
const router = express.Router();

// router.post("/credit/:id", credit);
router.post("/credit", credit);
router.post("/debit/:userId", debit);
router.post("/transfer", transfer);
router.post("/flutter", flutterwave);


export default router;
