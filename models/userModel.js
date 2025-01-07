import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true, // Ensure uniqueness
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true, // Ensure uniqueness
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // Regex for valid email
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the model
export default mongoose.model("User", UserSchema);
