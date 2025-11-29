import mongoose from "mongoose";

const HelpSupportSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const HelpSupport = mongoose.model("HelpSupport", HelpSupportSchema);
export default HelpSupport;