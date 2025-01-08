import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    pubName: {
      type: String,
      required: true,
    },
    pubEmail: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    pubContact: {
      type: String,
    },
    pubCompany: {
      type: String,
    },
    pubSkypeId: {
      type: String,
      required: false,
      match: [/^[a-zA-Z0-9._-]{6,32}$/, "Please enter a valid Skype ID"], // Regex validation for Skype ID
    },
    pubStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
  },
  { timestamps: true }
  //{ collection: 'mobilinks' }
);

const Publisher =
  mongoose.models.Publisher || mongoose.model("Publisher", publisherSchema);

export default Publisher;
