import mongoose from "mongoose";
import Counter from "./counter.js";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  deliveryPartner: {
    type: String,
    ref: "DeliveryPartner",
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branch",
    required: true,
  },
  items: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      count: {
        type: Number,
        required: true,
      },
    },
  ],
  deliveryLocation: {
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
  },
  pickupLocation: {
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
  },
  deliveryPersonLocation: {
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    address: {
      type: String,
    },
  },
  status: {
    type: String,
    enum: ["Available", "Confirmed", "Arriving", "Delivered", "Cancelled"],
    default: "Available",
  },
  totalPrice: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

async function getNextSequenceValue(sequence) {
  const sequenceDoc = await Counter.findOneAndUpdate(
    {
      name: sequence,
    },
    {
      $inc: {
        sequence_value: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  return sequenceDoc.sequence_value;
}

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const sequence = "orderId";
    const sequenceValue = await getNextSequenceValue(sequence);
    this.orderId = `ORDR${sequenceValue.toString().padStart(5, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
