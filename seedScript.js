import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // await Product.deleteMany({});
    // await Category.deleteMany({});

    const categoryDocs = await Category.insertMany(categories);
    const categoryMap = categoryDocs.reduce((acc, doc) => {
      acc[doc.name] = doc._id;
      return acc;
    }, {});

    const productWithCategoryIds = products.map((item) => ({
      ...item,
      category: categoryMap[item.category],
    }));

    await Product.insertMany(productWithCategoryIds);
    console.log("Database seeded successfully✅");
  } catch (er) {
    console.error("Caught an error: ", er);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
