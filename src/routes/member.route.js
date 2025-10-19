import { Router } from "express";
import {
  addMember,
  getAllMembers,
  updateMember,
  deleteMember,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const memberRouter = Router();

// ✅ file upload config (for reports)
upload.array("reports", 10); // allow up to 10 reports per member

// ✅ Routes

// ➕ Add Family Member
memberRouter
  .route("/add-member")
  .post(verifyJWT, upload.array("reports", 10), addMember);

// 📋 Get All Members for Logged-in User
memberRouter.route("/get-all-members").get(verifyJWT, getAllMembers);

// ✏️ Update Family Member
memberRouter
  .route("/update-member/:id")
  .put(verifyJWT, upload.array("reports", 10), updateMember);

// ❌ Delete Family Member
memberRouter.route("/delete-member/:id").delete(verifyJWT, deleteMember);
