import { Router } from "express";
import { forgotPassword, getUser, loginUser, logoutUser, registerUser, resetPassword } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


export const userRouter = Router()



// file upload 
upload.fields([
  {
    name: "profileImage",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
]); 


// user routes
userRouter.route("/register").post(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser)
userRouter.route("/forgot-password").post(forgotPassword)
userRouter.route("/reset-password/:token").post(resetPassword)

// secure routes 
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/get-user").post(verifyJWT, getUser)