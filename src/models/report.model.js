import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", requird: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    fileUrl: { type: String, required: true },
    type: { type: String, required: true },
    reportText: { type: String, requird: true },
    aiSummary: { type: String, requird: true },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

export { Report };
