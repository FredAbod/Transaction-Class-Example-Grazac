import express from "express";
import { credit, debit, transfer } from "../controllers/transaction.Controller.js";
const router = express.Router();

// router.post("/credit/:id", credit);
router.post("/credit", credit);
router.post("/debit/:userId", debit);
router.post("/transfer", transfer);


export default router;
