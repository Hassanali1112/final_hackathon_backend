import { asyncHandler } from "../utils/asyncHandler.js";
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import { extractText } from "../utils/fileTextExtraction.js";
import { getMedicalSummary } from "../utils/aiResponse.js";
import { text } from "express";

export const uploadReport = asyncHandler(async (req, res) => {
  console.log(req.body);

  if (!req.file) {
    throw new ApiError(401, "file is required");
  }

  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(500, "Something went wrong while file upload");
  }

  const uploadedFile = await uploadImageToCloudinary(fileLocalPath);

  if (!uploadedFile.secure_url) {
    throw new ApiError(500, "Something went wrong while file upload");
  }

  const text = await extractText(uploadedFile.secure_url, req.file.mimetype);

  if (!text) {
    throw new ApiError(500, "Text conversion failure");
  }

  const summary = await getMedicalSummary(text);

  console.log("ai summary", summary);

  if (!summary) {
    throw new ApiError(500, "AI response failure");
  }

  const reportDBEntry = await Report.create({
    userId: req.body.userId,
    memberId: req.body?.memberId ? req.body?.memberId : null,
    fileUrl: uploadedFile.url,
    type: req.file.mimetype,
    reportText: text,
    aiSummary: summary,
  });

  if (!reportDBEntry) {
    throw new ApiError("500", "Something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, reportDBEntry, "report added done", true));
});
