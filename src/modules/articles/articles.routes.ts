import { Router } from "express";
import { ArticlesController } from "./articles.controller";
import { authenticate, optionalAuth } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { readRateLimiter } from "../../middleware/rateLimiter";
import { createArticleSchema, updateArticleSchema } from "./articles.schema";

const router = Router();
const controller = new ArticlesController();

// --- Public routes ---
// GET /articles — public news feed (published, not-deleted, with filters)
router.get("/", controller.publicFeed);

// --- Author-only routes (must come before /:id to avoid route conflicts) ---
router.get("/me", authenticate, authorize("author"), controller.listMine);
router.post(
  "/",
  authenticate,
  authorize("author"),
  validate(createArticleSchema),
  controller.create
);
router.put(
  "/:id",
  authenticate,
  authorize("author"),
  validate(updateArticleSchema),
  controller.update
);
router.delete("/:id", authenticate, authorize("author"), controller.remove);

// GET /articles/:id — single article view with read tracking
router.get("/:id", optionalAuth, readRateLimiter, controller.getById);

export default router;
