import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";

export const start = async () => {
  await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blinkit");
  const app = Fastify();

  await registerRoutes(app);

  await buildAdminRouter(app);

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, adrr) => {
    if (err) {
      console.log("Caught an error on app.js: ", err);
    } else {
      console.log(`Server Started on ${PORT} ${admin.options.rootPath} `);
    }
  });
};

start();
