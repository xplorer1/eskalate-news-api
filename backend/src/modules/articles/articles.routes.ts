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

/**
 * @swagger
 * /articles:
 *   get:
 *     tags: [Articles]
 *     summary: Public news feed
 *     description: Returns published articles with optional filters and pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *         description: Filter by author name
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Paginated list of published articles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     Object:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 */
router.get("/", controller.publicFeed);

// --- Author-only routes (must come before /:id to avoid route conflicts) ---

/**
 * @swagger
 * /articles/me:
 *   get:
 *     tags: [Articles]
 *     summary: List my articles
 *     description: Returns the authenticated author's articles (including drafts).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: includeDeleted
 *         schema: { type: boolean, default: false }
 *         description: Include soft-deleted articles
 *     responses:
 *       200:
 *         description: Paginated list of author's articles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     Object:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an author
 */
router.get("/me", authenticate, authorize("author"), controller.listMine);

/**
 * @swagger
 * /articles:
 *   post:
 *     tags: [Articles]
 *     summary: Create an article
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Title, Content, Category]
 *             properties:
 *               Title:
 *                 type: string
 *                 maxLength: 150
 *                 example: Breaking News
 *               Content:
 *                 type: string
 *                 minLength: 50
 *                 example: "This is the full content of the article that must be at least fifty characters long."
 *               Category:
 *                 type: string
 *                 example: Technology
 *               Status:
 *                 type: string
 *                 enum: [Draft, Published]
 *                 default: Draft
 *     responses:
 *       201:
 *         description: Article created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - properties:
 *                     Object:
 *                       $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an author
 */
router.post(
  "/",
  authenticate,
  authorize("author"),
  validate(createArticleSchema),
  controller.create
);

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     tags: [Articles]
 *     summary: Update an article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 maxLength: 150
 *               Content:
 *                 type: string
 *                 minLength: 50
 *               Category:
 *                 type: string
 *               Status:
 *                 type: string
 *                 enum: [Draft, Published]
 *     responses:
 *       200:
 *         description: Article updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - properties:
 *                     Object:
 *                       $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an author or not the owner
 *       404:
 *         description: Article not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("author"),
  validate(updateArticleSchema),
  controller.update
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     tags: [Articles]
 *     summary: Soft-delete an article
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Article deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an author or not the owner
 *       404:
 *         description: Article not found
 */
router.delete("/:id", authenticate, authorize("author"), controller.remove);

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Get a single article
 *     description: Returns a single article by ID. Optionally tracks a read log if authenticated.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Article found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - properties:
 *                     Object:
 *                       $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 */
router.get("/:id", optionalAuth, readRateLimiter, controller.getById);

export default router;
