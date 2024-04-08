import express from "express"
import { createService, getServices, getServiceById, updateService, deleteService,uploadImagem,getImageService } from '../controllers/servicesController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import multer from "multer"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './storage/services/');
    },

    filename: (req, file, cb) => {
        cb(null, "service" + Date.now() + file.originalname);
    }
})
const upload = multer({ storage: storage });

router.route('/')
    .post(authMiddleware,createService)
    .get(getServices)

router.route('/:id')
    .get(authMiddleware,getServiceById)
    .put(authMiddleware,updateService)
    .delete(authMiddleware,deleteService)

router.post("/upload/:id", [authMiddleware, upload.single("file0")],uploadImagem);
router.get("/image/:file", getImageService);


export default router;