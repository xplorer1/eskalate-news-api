import { Router } from "express";
import { ArticlesController } from "./articles.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { createArticleSchema, updateArticleSchema } from "./articles.schema";

const router = Router();
const controller = new ArticlesController();

// All routes require authentication + author role
router.use(authenticate, authorize("author"));

router.post("/", validate(createArticleSchema), controller.create);
router.get("/me", controller.listMine);
router.put("/:id", validate(updateArticleSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
