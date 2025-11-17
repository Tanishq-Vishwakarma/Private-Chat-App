import { Router } from "express";
import { 
    createGroup, 
    getAllGroups, 
    joinGroup, 
    getGroupMembers,
    getUserGroups
} from "../routes/controllers/group.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, verifyAdmin, createGroup);
router.route("/").get(verifyJWT, verifyAdmin, getAllGroups);
router.route("/my").get(verifyJWT, getUserGroups);
router.route("/join/:code").post(verifyJWT, joinGroup);
router.route("/:id").get(verifyJWT, getGroupMembers);

export default router;

