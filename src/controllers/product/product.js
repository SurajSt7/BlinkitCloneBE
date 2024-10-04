import Product from "../../models/product.js";

export const getProductsByCategoryId = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();
    return res.send(products);
  } catch (Er) {
    return res.status(500).send({
      message: "An error occured",
      error: Er,
    });
  }
};