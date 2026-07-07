import { Router } from "express";
import * as contractsController from "../controllers/contracts.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", authenticate, contractsController.listMyContracts);
router.post(
  "/servico/:servicoId",
  authenticate,
  authorize("CLIENTE"),
  validate(contractsController.createContractSchema),
  contractsController.create
);
router.patch("/:id/status", authenticate, authorize("PRESTADOR"), contractsController.updateStatus);

export default router;

