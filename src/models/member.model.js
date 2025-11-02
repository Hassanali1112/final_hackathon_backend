import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema({
  fileName: String,
  fileUrl: String,
  fileType: String,
});

const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum : ["male", "female"], default: "male" },
    bp: { type: String },
    sugar: { type: String },
    temperature: { type: String },
    weight: { type: String },
    notes: { type: String },
    reports: [reportSchema], // multiple reports
  },
  { timestamps: true }
);

export const Member = mongoose.model("Member", memberSchema);
