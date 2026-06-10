import Cart from "../models/cartModel.js";
import Pet from "../models/petModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/userModel.js";

// 🛒 Add to cart
// 🛒 Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { petId, quantity = 1 } = req.body;
    const userId = req.user._id;

    const pet = await Pet.findById(petId);
    if (!pet || pet.status !== "approved") {
      return res.status(404).json({ message: "Pet not available" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existingItem = cart.items.find(
      (item) => item.pet.toString() === petId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ pet: petId, quantity });
    }

    await cart.save();
    await cart.populate("items.pet", "name price image");

    // 📨 send email to user that they added something to cart
    try {
      const user = await User.findById(userId);
      const subject = `🛒 You added ${pet.name} to your cart!`;
      const html = `
        <h2>Hi ${user.name || "there"}!</h2>
        <p>You just added <strong>${pet.name}</strong> to your PetPal cart.</p>
        <p>Don't keep your new friend waiting — complete your order soon!</p>
        <img src="${pet.image}" alt="${pet.name}" width="200" />
        <p><strong>Price:</strong> ₹${pet.price}</p>
        <br>
        <p>🐾 See you soon,<br>PetPal Team</p>
      `;
      await sendEmail(user.email, subject, html);
      console.log(`📧 Cart add email sent to ${user.email}`);
    } catch (mailErr) {
      console.error("❌ Failed to send cart email:", mailErr.message);
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      if (!item.pet) return sum;
      return sum + (item.pet.price || 0) * (item.quantity || 1);
    }, 0);

    res.status(200).json({
      success: true,
      message: `${pet.name} added to cart`,
      totalAmount,
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};


// 🛒 View cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.pet",
      "name price image"
    );
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// 🛒 Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { petId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.pet.toString() !== petId);
    await cart.save();
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};

// 🛒 Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
