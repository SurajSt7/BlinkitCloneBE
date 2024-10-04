import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

export const start = async () => {
  await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blinkit");
  const app = Fastify();

  app.register(fastifySocketIO, {
    cors: {
      origin: "*",
    },
    pingInterval: 10000,
    pingTimeout: 30000,
    transports: ["websocket"],
  });

  await registerRoutes(app);

  await buildAdminRouter(app);

  app.listen({ port: PORT }, (err, adrr) => {
    if (err) {
      console.log("Caught an error on app.js: ", err);
    } else {
      console.log(`Server Started on ${PORT} ${admin.options.rootPath} `);
    }
  });
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A User connected: ", socket.id);

      socket.on("joinRoom", (orderID) => {
        socket.join(orderID);
        console.log("User joined the room: ", orderID);
      }),
        socket.on("disconnect", () => {
          console.log("User disconnected");
        });
    });
  });
};

start();
