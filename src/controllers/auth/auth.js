import "dotenv/config";
import { Customer, DeliveryPartner } from "../../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, res) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });

      await customer.save();
    }
    const { accessToken, refreshToken } = await generateToken(customer);
    return res.send({
      message: customer ? "Login Successful" : "Customer created and logged in",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (er) {
    return res.status(500).send({
      message: "Error occured",
      error,
    });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      return res.status(404).send({
        message: "Delivery Partner not found",
        error,
      });
    }

    const isMatch = password === deliveryPartner.password;

    if (!isMatch) {
      return res.status(400).send({
        message: "Invalid Credentials",
        error,
      });
    }

    const { accessToken, refreshToken } = await generateToken(deliveryPartner);

    return res.send({
      message: "Login Successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (er) {
    return res.status(500).send({
      message: "Error occured",
      error,
    });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(404).send({
      message: "Refresh token required",
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("Decoded: ", decoded);
    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findOne(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findOne(decoded.userId);
    } else {
      return res.status(403).send({
        message: "Invalid role",
      });
    }
    if (!user) {
      return res.status(403).send({
        message: "Invalid refresh token",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
    return res.send({
      message: "Token Refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).send({
      message: "Invalid Refresh Token",
    });
  }
};

export const fetchUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return res.status(403).send({
        message: "Invalid role",
      });
    }
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    return res.send({
      message: "User fetched successfully",
      user,
    });
  } catch (er) {
    return res.status(500).send({
      message: "An error occured",
      er,
    });
  }
};
