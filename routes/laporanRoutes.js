import express from "express";
import LaporanController from "../controllers/laporanController.js";

const router = express.Router();

router.get("/", LaporanController.get);
router.get("/dashboard", LaporanController.getDashboardData);

export default router;
