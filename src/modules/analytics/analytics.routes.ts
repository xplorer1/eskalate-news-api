import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();
const controller = new AnalyticsController();

// GET /author/dashboard — author only
router.get("/dashboard", authenticate, authorize("author"), controller.dashboard);

export default router;
