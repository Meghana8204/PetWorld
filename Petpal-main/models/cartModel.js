import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);
cartSchema.pre("save", async function (next) {
  let total = 0;
  await this.populate("items.pet", "price");
  this.items.forEach((item) => {
    total += item.pet.price * item.quantity;
  });
  this.totalAmount = total;
  next();
});


export default mongoose.model("Cart", cartSchema);
