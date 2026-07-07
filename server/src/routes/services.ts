import { Router } from "express";
import * as servicesController from "../controllers/services.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", servicesController.list);
router.get("/meus", authenticate, authorize("PRESTADOR"), servicesController.listMyServices);
router.get("/:id", servicesController.getById);
router.post(
  "/",
  authenticate,
  authorize("PRESTADOR"),
  validate(servicesController.createServiceSchema),
  upload.array("fotos", 10),
  servicesController.create
);
router.put(
  "/:id",
  authenticate,
  authorize("PRESTADOR"),
  validate(servicesController.updateServiceSchema),
  upload.array("fotos", 10),
  servicesController.update
);
router.delete("/:id", authenticate, authorize("PRESTADOR"), servicesController.remove);

export default router;

