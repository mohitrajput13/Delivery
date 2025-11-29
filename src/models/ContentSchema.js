import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    content_type: {
      type: Number,
      required: true,
      index: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
    content_1: {
      type: String,
      default: "",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: true }
);
const Content = mongoose.model("Content", ContentSchema);
export default Content;
