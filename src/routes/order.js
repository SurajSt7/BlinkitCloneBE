import {
  confirmOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
  await fastify.addHook("preHandler", async (req, res) => {
    const isAuthenticated = await verifyToken(req, res);
    if (!isAuthenticated) {
      return res.code(401).send({
        message: "Unauthenticated access",
      });
    }
  });
  fastify.get("/order", getAllOrders);
  fastify.post("/order", createOrder);
  fastify.patch("/order/:orderId/status", updateOrderStatus);
  fastify.post("/order/:orderId/confirm", confirmOrder);
  fastify.post("/order/:orderId", getOrderById);
};
