import HelpSupport from "../models/HelpSupport.js";


export const fetchHelpSupport = async (req, res) => {
  try {
    const data = await HelpSupport.findOne();

    return res.status(200).json({
      status: "success",
      res: data ? data : {},
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const updateHelpSupport = async (req, res) => {
  try {
    const { content, email, phone } = req.body;

    if (!content) {
      return res.status(400).json({
        status: "error",
        message: "Content is required",
      });
    }

    let data = await HelpSupport.findOne();

    if (data) {
      data.content = content;
      data.email = email || "";
      data.phone = phone || "";
      await data.save();
    } else {
      await HelpSupport.create({
        content,
        email: email || "",
        phone: phone || "",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Help & Support updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
