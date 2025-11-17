import { Router } from "express";
import { 
    getMessages, 
    sendMessage 
} from "../routes/controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:groupId/messages").get(verifyJWT, getMessages);
router.route("/:groupId/messages").post(verifyJWT, sendMessage);

export default router;

