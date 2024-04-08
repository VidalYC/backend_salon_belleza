import express from "express";
import {
  register,
  verifyAccount,
  login,
  user,
  forgotPassword,
  verifyPasswordResetToken,
  updatePassword,
  admin,
  perfil,
  updatePerfil,
  actualizarPassword,
  uploadImagenAvatar,
  getImageAvatar,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./storage/avatar/");
  },

  filename: (req, file, cb) => {
    cb(null, "service" + Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Rutas de autenticacion
router.post("/register", register);
router.get("/verify/:token", verifyAccount);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

router
  .route("/forgot-password/:token")
  .get(verifyPasswordResetToken)
  .post(updatePassword);

// Area privada - requiere JWT

router.get("/user", authMiddleware, user);
router.get("/admin", authMiddleware, admin);
router.get("/perfil", authMiddleware, perfil);
router.put("/perfil/:id", authMiddleware, updatePerfil);
router.put("/actualizar-password", authMiddleware, actualizarPassword);
router.post(
  "/upload/foto/:id",
  [authMiddleware, upload.single("file1")],
  uploadImagenAvatar
);
router.get("/avatar/:file", getImageAvatar);

export default router;
