import { Router } from "express";
import { z } from "zod";
import * as usersController from "../controllers/users.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

const updateProfileSchema = z.object({
  nome: z.string().min(2, "Nome precisa ter no mínimo 2 caracteres").optional(),
  telefone: z.string().optional(),
  descricao: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

const updatePasswordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

const router = Router();

router.get("/:id", usersController.getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), usersController.updateProfile);
router.put("/password", authenticate, validate(updatePasswordSchema), usersController.updatePassword);
router.put("/avatar", authenticate, upload.single("avatar"), usersController.uploadAvatar);
router.delete("/account", authenticate, usersController.deleteAccount);

export default router;

