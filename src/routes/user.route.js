import { Router } from "express";
import { logoutUser, registerUser, userLogin } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.maddleware.js";
import { upload } from "../middlewares/multer.maddleware.js";
const router = Router();
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }

]),registerUser)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT,logoutUser)

export {router};