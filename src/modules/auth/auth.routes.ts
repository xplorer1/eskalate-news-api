import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { signupSchema, loginSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Name, Email, Password, Role]
 *             properties:
 *               Name:
 *                 type: string
 *                 example: John Doe
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               Password:
 *                 type: string
 *                 minLength: 8
 *                 example: Secret1!a
 *               Role:
 *                 type: string
 *                 enum: [author, reader]
 *                 example: author
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - properties:
 *                     Object:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post("/signup", validate(signupSchema), controller.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Email, Password]
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               Password:
 *                 type: string
 *                 example: Secret1!a
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - properties:
 *                     Object:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginSchema), controller.login);

export default router;
