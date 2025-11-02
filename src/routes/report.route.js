import { Router } from "express";
import { uploadReport } from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const reportRouter = Router()


reportRouter.route("/upload").post(upload.single("report"),uploadReport)


export default reportRouter;