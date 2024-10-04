import Category from "../../models/category.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.send(categories);
  } catch (er) {
    return res.status(500).send({
      message: "An error occured:",
      error: er,
    });
  }
};
