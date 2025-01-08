import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
    },
    campaignPayout: {
      type: String,
    },
    campaignCategory: {
      type: String,
    },
    campaignType: {
      type: String,
    },
    geo: {
      type: String,
    },
    featured: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    preferred: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    previewLink: {
      type: String,
    },
    device: {
      type: String,
    },
    allowedMedia: {
      type: [String],
      default: [],
    },
    disallowedMedia: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
