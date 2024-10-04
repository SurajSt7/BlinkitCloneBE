import { Customer, DeliveryPartner } from "../../models/User.js";

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;
    let user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    let userModel;
    if (user.role === "Customer") {
      userModel = Customer;
    } else if (user.role === "DeliveryPartner") {
      userModel = DeliveryPartner;
    } else {
      return res.status(400).send({
        message: "Invalid user role",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    return res.send({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (er) {
    return res.status(500).send({
      message: "Caught an error in catch block",
      er,
    });
  }
};
