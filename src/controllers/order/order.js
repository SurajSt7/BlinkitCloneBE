import Branch from "../../models/branch.js";
import { Customer, DeliveryPartner } from "../../models/User.js";
import Order from "../../models/order.js";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    console.log("Cust data: ", customerData);
    const branchData = await Branch.findById(branch);
    console.log("Branch data: ", branchData);
    if (!customerData) {
      return res.status(404).send({
        message: "Customer not found",
      });
    }
    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.location.latitude,
        longitude: branchData.location.longitude,
        address: branchData.address || "No address available",
      },
    });
    console.log("New order: ", newOrder);

    const savedOrder = await newOrder.save();
    return res.status(201).send(savedOrder);
  } catch (er) {
    console.log("Caught an error: ", er);
    return res.status(500).send({
      message: "Failed to create order",
    });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return res.status(404).send({ message: "Delivery person not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({
        message: "Order not found",
      });
    }
    if (order.status.toLowerCase() !== "available") {
      return res.status(400).send({
        message: "Order is not available",
      });
    }

    order.status = "Confirmed";

    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };

    req.server.io.to(orderId).emit("orderConfirmed", order);

    await order.save();

    return res.send(order);
  } catch (error) {
    return res.status(500).send({
      message: "Failed to confirm the order",
      error,
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return res.status(400).send({
        message: "Delivery person not found",
      });
    }
    const order = await Order.findById(orderId);
    console.log("Order id: ", order);

    if (!order) {
      return res.status(404).send({
        message: "Order not found",
      });
    }
    if (["Cancelled", "Delivered"].includes(order.status)) {
      return res.status(400).send({
        message: "Order cannot not be updated",
      });
    }

    if (order.deliveryPartner.toString() !== userId) {
      return res.status(400).send({
        message: "Unauthorized access",
      });
    }

    order.status = status;

    order.deliveryPartner = userId;

    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();

    req.server.io.to(orderId).emit("liveTrackingUpdates", order);

    return res.send(order);
  } catch (e) {
    return res.status(500).send({
      message: "Failed to update order status",
      error: e,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    console.log("orders: ", req.query);

    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }
    console.log("Query: ", Order.find(query));

    const orders = await Order.find(query);
    // .populate(
    //   "Customer branch items. item delivery partner"
    // );
    console.log("Orders 2nd: ", orders);

    return res.send(orders);
  } catch (er) {
    return res.status(500).send({
      message: "Failed to retrieve orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await Order.findById(orderId).populate(
      "branch items. item deliveryPartner"
    );

    if (!orders) {
      return res.status(404).send({
        message: "Order not found",
      });
    }
    return res.send(orders);
  } catch (er) {
    return res.status(500).send({
      message: "Failed to retrieve order",
    });
  }
};
