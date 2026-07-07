import { Router } from "express";
import * as reviewsController from "../controllers/reviews.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/servico/:servicoId", reviewsController.listByService);
router.post(
  "/servico/:servicoId",
  authenticate,
  validate(reviewsController.createReviewSchema),
  upload.array("fotos", 5),
  reviewsController.create
);
router.delete("/:id", authenticate, reviewsController.remove);

export default router;

