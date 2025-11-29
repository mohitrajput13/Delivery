import Content from "../models/ContentSchema.js";

export const fetchAboutContent = async (req, res, next) => {
  try {
    const content_type = Number(req.query.content_type);
    if (Number.isNaN(content_type)) {
      return res.status(400).json({ success: false, message: "Invalid content_type" });
    }
    const doc = await Content.findOne({ content_type });

    if (!doc) {
      return res.json({ success: true, res: [] }); 
    }
    return res.json({ success: true, res: [{ content: doc.content, content_1: doc.content_1 || "" }] });
  } catch (err) {
    next(err);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { content_type, content } = req.body;

    if (typeof content_type === "undefined" || content_type === null) {
      return res.status(400).json({ success: false, message: "content_type is required" });
    }

    if (typeof content !== "string") {
      return res.status(400).json({ success: false, message: "content must be a string" });
    }
    const updated = await Content.findOneAndUpdate(
      { content_type: Number(content_type) },
      { $set: { content, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, message: "Content updated", data: { content_type: updated.content_type, content: updated.content } });
  } catch (err) {
    next(err);
  }
};
