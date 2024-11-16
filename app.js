// import "dotenv/config";
// import Fastify from "fastify";
// import { connectDB } from "./src/config/connect.js";
// import { PORT } from "./src/config/config.js";
// import { admin, buildAdminRouter } from "./src/config/setup.js";
// import { registerRoutes } from "./src/routes/index.js";
// import fastifySocketIO from "fastify-socket.io";

// export const start = async () => {
//   await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blinkit");
//   const app = Fastify();

//   app.register(fastifySocketIO, {
//     cors: {
//       origin: "*",
//     },
//     pingInterval: 10000,
//     pingTimeout: 30000,
//     transports: ["websocket"],
//     secret: process.env.JWT_SECRET,
//   });

//   // Authentication middleware
//   app.decorate("authenticate", async function (request, reply) {
//     try {
//       await request.jwtVerify();
//     } catch (err) {
//       reply.send(err);
//     }
//   });

//   app.get(
//     "/protected-endpoint",
//     { preValidation: [app.authenticate] },
//     async (request, reply) => {
//       return { message: "You have access!" };
//     }
//   );

//   await registerRoutes(app);

//   await buildAdminRouter(app);

//   app.listen({ port: PORT }, (err, adrr) => {
//     if (err) {
//       console.log("Caught an error on app.js: ", err);
//     } else {
//       console.log(`Server Started on ${PORT} ${admin.options.rootPath} `);
//     }
//   });
//   app.ready().then(() => {
//     app.io.on("connection", (socket) => {
//       console.log("A User connected: ", socket.id);

//       socket.on("joinRoom", (orderID) => {
//         socket.join(orderID);
//         console.log("User joined the room: ", orderID);
//       }),
//         socket.on("disconnect", () => {
//           console.log("User disconnected");
//         });
//     });
//   });
// };

// start();
import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/api/index.js";
import fastifySocketIO from "fastify-socket.io";
import fastifyJwt from "fastify-jwt"; // Added fastify-jwt for JWT handling

export const start = async () => {
  // Connect to MongoDB (you can change URI as needed)
  await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blinkit");

  const app = Fastify();

  // Register Socket.io plugin
  app.register(fastifySocketIO, {
    cors: {
      origin: "*", // Adjust based on your frontend
    },
    pingInterval: 10000,
    pingTimeout: 30000,
    transports: ["websocket"],
  });

  // Register fastify-jwt plugin to handle JWT token validation
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "your_default_jwt_secret", // Make sure to set this in your .env file
  });

  // Authentication middleware (using JWT)
  app.decorate("authenticate", async function (request, reply) {
    try {
      // Verifies the JWT token from Authorization header
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized", message: err.message });
    }
  });

  // Example of a protected route that requires JWT authentication
  app.get(
    "/protected-endpoint",
    { preValidation: [app.authenticate] },
    async (request, reply) => {
      return { message: "You have access to this protected route!" };
    }
  );

  // Register your custom routes (make sure registerRoutes is implemented)
  await registerRoutes(app);

  // Set up Admin routes
  await buildAdminRouter(app);

  // Start server
  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
      console.log("Caught an error on app.js: ", err);
    } else {
      console.log(`Server Started on ${PORT} ${admin.options.rootPath}`);
    }
  });

  // Set up WebSocket connection handling
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A User connected: ", socket.id);

      socket.on("joinRoom", (orderID) => {
        socket.join(orderID);
        console.log("User joined the room: ", orderID);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  });
};

// Start the app
start();
