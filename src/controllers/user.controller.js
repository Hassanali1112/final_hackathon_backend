import crypto from "crypto";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Member } from "../models/member.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

const BASE_URL = process.env.CORS_ORIGIN;

// Options

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  // httpOnly: true,
  // secure: process.env.NODE_ENV === "production",
  // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// register user
export const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, password } = req.body;

  

  if ([fullName, email, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required !");
  }

  const userFound = await User.findOne({ email }); 

  if (userFound) {
    throw new ApiError(409, "User with this email or user name already exits!");
  }

  //  const profileImageLocalPath = req.files?.profileImage[0].path

  //  if(!profileImageLocalPath){
  //   throw new ApiError(400, "Profile image is required!")
  //  }

  //  const profileImage = await uploadImageToCloudinary(profileImageLocalPath)

  //   if (!profileImage) {
  //     throw new ApiError(400, "Profile image is required!");
  //   }

  const newUser = await User.create({
    fullName,
    // userName,
    email,
    password,
    // profileImage : profileImage.url
  });

  const newlyCreatedUser = await User.findById(newUser._id).select("-password");

  console.log(newlyCreatedUser);

  if (!newlyCreatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user !"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, newlyCreatedUser, "user created successfully", true)
    );
});

// login user
export const loginUser = asyncHandler(async (req, res) => {
  console.log("login route hit");
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, " email is required !");
  }

  const userFound = await User.findOne({
    email,
  });

  console.log("check");

  if (!userFound) {
    throw new ApiError(404, "User with this user name or email not exists!");
  }

  const validatePassword = await userFound.isPasswordCorrect(password);

  if (!validatePassword) {
    throw new ApiError(401, "Invalid user credentials !");
  }

  const token = await userFound.generateToken();

  console.log(token);

  const user = await User.findById(userFound?._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, { user }, "User logged in successfully", true));
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
  console.log("backend logout hit");
  // const user = await User.findByIdAndUpdate(
  //   req.user._id,
  //   {
  //     $set: { refreshToken: "" },
  //   },
  //   {
  //     new: true,
  //   }
  // );

  return (
    res
      .status(200)
      .clearCookie("token", options)
      // .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Logout successfully", true))
  );
});

// get user
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  console.log("auth", user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "User data retrieved successfully!", true)
    );
});

// refresh token  ( in complete )
export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const inCommingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!inCommingRefreshToken) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    const decodedToken = await jwt.verify(
      inCommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const userFound = await User.findById(decodedToken?._id);

    if (!userFound) {
      throw new ApiError(401, "Invalid refreshToken");
    }
  } catch (error) {}
});

export const forgotPassword = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, userName } = req.body;

  if (!(userName || email)) {
    throw new ApiError(401, null, "User name or email is required ! ");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(
      401,
      {},
      "User does not exist with this user name or email !"
    );
  }

  console.log(user);

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save({
    validateBeforeSave: false,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const resetLink = `${BASE_URL}/reset-password/${token}`;

  transporter.sendMail({
    to: user?.email,
    subject: "Reset password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link is valid for 1 hour.</p>`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reset link send to your email", true));
});

export const resetPassword = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: {
      $gt: Date.now(),
    },
  });
  console.log("user", user);

  if (!user) {
    throw new ApiError(400, {}, "Invalid or expired token");
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  console.log("response");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully", true));
});

// ________________________________________________________________________________________________
export const addMember = asyncHandler(async (req, res) => {
  console.log("➕ Add Member");

  const userId = req.user?._id || req.body.userId;
  const { name, relation, age, gender, bp, sugar, temperature, weight, notes } =
    req.body;

  if (!name || !relation || !age) {
    throw new ApiError(400, "Name, relation, and age are required!");
  }

  const reports =
    req.files?.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/reports/${file.filename}`,
      fileType: file.mimetype,
    })) || [];

  const newMember = await Member.create({
    user: userId,
    name,
    relation,
    age,
    gender,
    bp,
    sugar,
    temperature,
    weight,
    notes,
    reports,
  });

  if (!newMember) {
    throw new ApiError(500, "Failed to create family member!");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, newMember, "Family member added successfully", true)
    );
});

// 🧾 GET ALL MEMBERS FOR A USER
export const getAllMembers = asyncHandler(async (req, res) => {
  console.log("📋 Fetching members");
  const userId = req.user?._id || req.query.userId;

  if (!userId) {
    throw new ApiError(400, "User ID missing!");
  }

  const members = await Member.find({ user: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, members, "All family members fetched successfully")
    );
});

// ✏️ UPDATE MEMBER DETAILS
export const updateMember = asyncHandler(async (req, res) => {
  console.log("✏️ Updating member");
  const memberId = req.params.id;

  const existing = await Member.findById(memberId);
  if (!existing) {
    throw new ApiError(404, "Member not found!");
  }

  const { name, relation, age, gender, bp, sugar, temperature, weight, notes } =
    req.body;

  const newReports =
    req.files?.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/reports/${file.filename}`,
      fileType: file.mimetype,
    })) || [];

  existing.name = name || existing.name;
  existing.relation = relation || existing.relation;
  existing.age = age || existing.age;
  existing.gender = gender || existing.gender;
  existing.bp = bp || existing.bp;
  existing.sugar = sugar || existing.sugar;
  existing.temperature = temperature || existing.temperature;
  existing.weight = weight || existing.weight;
  existing.notes = notes || existing.notes;

  if (newReports.length > 0) {
    existing.reports.push(...newReports);
  }

  await existing.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, existing, "Family member updated successfully", true)
    );
});

// ❌ DELETE MEMBER
export const deleteMember = asyncHandler(async (req, res) => {
  console.log("🗑️ Delete Member");
  const memberId = req.params.id;

  const deleted = await Member.findByIdAndDelete(memberId);
  if (!deleted) {
    throw new ApiError(404, "Member not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Member deleted successfully", true));
});
