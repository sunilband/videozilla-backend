import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserpassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/ratelimiter.middleware.js";

const router = Router();

router.route("/register").post(
  rateLimit(1),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(rateLimit(3), loginUser);
router.route("/refresh-token").get(rateLimit(1), refreshAccessToken);

// secured routes (user must have token)
router.route("/logout").get(rateLimit(1), verifyJWT, logoutUser);
router
  .route("/change-password")
  .post(rateLimit(1), verifyJWT, changeUserpassword);

export default router;
