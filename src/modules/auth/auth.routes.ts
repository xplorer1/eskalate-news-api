import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { signupSchema, loginSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

router.post("/signup", validate(signupSchema), controller.signup);
router.post("/login", validate(loginSchema), controller.login);

export default router;
