import express from "express";
import { healthCheckController } from "../controllers/healthCheck.controller.js";

const router = express.Router();

router.route("/").get(healthCheckController);

export {
    router
}