import { Router } from "express";
import { reportByAnon, blockByAnon } from "./controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/report").post(verifyJWT, reportByAnon);
router.route("/block").post(verifyJWT, blockByAnon);

export default router;