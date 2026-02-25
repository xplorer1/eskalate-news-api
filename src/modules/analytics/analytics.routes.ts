import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();
const controller = new AnalyticsController();

/**
 * @swagger
 * /author/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Author dashboard
 *     description: Returns paginated article stats with total view counts for the authenticated author.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     Object:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DashboardEntry'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an author
 */
router.get("/dashboard", authenticate, authorize("author"), controller.dashboard);

export default router;
