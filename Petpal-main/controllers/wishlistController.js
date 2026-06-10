import Wishlist from "../models/wishlistModel.js";
import Pet from "../models/petModel.js";

// ❤️ Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { petId } = req.body;
    const userId = req.user._id;

    const pet = await Pet.findById(petId);
    if (!pet || pet.status !== "approved") {
      return res.status(404).json({ message: "Pet not found or not approved" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) wishlist = new Wishlist({ user: userId, items: [] });

    // Prevent duplicates
    const alreadyAdded = wishlist.items.some(
      (item) => item.toString() === petId
    );
    if (alreadyAdded) {
      return res.status(400).json({ message: "Pet already in wishlist" });
    }

    wishlist.items.push(petId);
    await wishlist.save();

    await wishlist.populate("items", "name price image category");

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error: error.message });
  }
};

// ❤️ Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "items",
      "name price image"
    );
    res.json(wishlist || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};

// ❤️ Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { petId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter((id) => id.toString() !== petId);
    await wishlist.save();

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};
