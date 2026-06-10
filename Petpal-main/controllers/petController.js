// controllers/petController.js
import Pet from "../models/petModel.js";
import Seller from "../models/sellerModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createNotification } from "./notificationController.js";

/* ============================================================
   🧑‍💼 SELLER: Add Pet / Product / Food / Toy
============================================================ */
export const addPet = async (req, res) => {
  try {
    const { name, category, price, description, offerPrice, inStock, specifications } = req.body;

    // Image can come from Cloudinary upload middleware OR direct URL
    const imageUrl = req.file?.path || req.body.image;
    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }

    const pet = await Pet.create({
      name,
      category,
      price,
      offerPrice: offerPrice || 0,
      description: description || "",
      inStock: inStock ?? true,
      image: imageUrl,
      seller: req.user._id,
      status: "pending",
      specifications: Array.isArray(specifications) ? specifications : [],
    });

    // 🔔 Notify seller that product is submitted
    await createNotification(
      req.user._id,
      "product",
      "📦 Product Submitted",
      `Your product "${name}" has been submitted for admin review`,
      pet._id.toString(),
      "pet"
    );

    res.status(201).json({
      success: true,
      message: "Pet added successfully! Waiting for admin approval 🕓",
      pet,
    });
  } catch (error) {
    console.error("❌ Error adding pet:", error.message);
    res.status(500).json({ message: "Error adding pet", error: error.message });
  }
};

/* ============================================================
   👩‍💻 ADMIN: Approve or Reject Pet Listing
============================================================ */
export const reviewPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const pet = await Pet.findById(id).populate("seller");
    if (!pet) return res.status(404).json({ message: "Item not found" });

    if (action === "approve") {
      pet.status = "approved";
      pet.rejectionReason = "";

      // ✅ Send approval email
      const approveMessage = `
        <h2>Hi ${pet.seller.name},</h2>
        <p>Your item "<strong>${pet.name}</strong>" has been <strong>approved</strong> 🎉</p>
        <p>It is now live and visible to users on the PetPal platform.</p>
        <br/>
        <p>🐾 Warm regards,<br/>PetPal Admin Team</p>
      `;

      await sendEmail(pet.seller.email, "🎉 PetPal Item Approved!", approveMessage);

      // 🔔 Notify seller that product is approved
      await createNotification(
        pet.seller._id,
        "product",
        "✅ Product Approved",
        `Your product "${pet.name}" has been approved and is now live!`,
        pet._id.toString(),
        "pet"
      );
    } else if (action === "reject") {
      pet.status = "rejected";
      pet.rejectionReason = reason || "Not approved by admin";

      // ❌ Send rejection email
      const rejectMessage = `
        <h2>Hi ${pet.seller.name},</h2>
        <p>We're sorry! Your item "<strong>${pet.name}</strong>" has been <strong>rejected</strong>.</p>
        <p><b>Reason:</b> ${pet.rejectionReason}</p>
        <p>Please review and resubmit your listing with improvements.</p>
        <br/>
        <p>🐾 Regards,<br/>PetPal Admin Team</p>
      `;

      await sendEmail(pet.seller.email, "❌ PetPal Item Rejected", rejectMessage);

      // 🔔 Notify seller that product is rejected
      await createNotification(
        pet.seller._id,
        "product",
        "❌ Product Rejected",
        `Your product "${pet.name}" was rejected. Reason: ${reason || "Not approved by admin"}`,
        pet._id.toString(),
        "pet"
      );
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'." });
    }

    await pet.save();
    res.status(200).json({
      success: true,
      message: `Item ${action}d successfully`,
      pet,
    });
  } catch (error) {
    console.error("❌ Error reviewing pet:", error.message);
    res.status(500).json({ message: "Error reviewing pet", error: error.message });
  }
};

/* ============================================================
   👤 USERS: Get All Approved Pets (with optional category)
============================================================ */
export const getApprovedPets = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "approved" };

    // ✅ Case-insensitive category filter
    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    const pets = await Pet.find(filter)
      .populate("seller", "name email shopName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pets.length,
      pets,
    });
  } catch (error) {
    console.error("❌ Error fetching approved pets:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching approved pets",
      error: error.message,
    });
  }
};

/* ============================================================
   🧑‍💼 SELLER: Get Their Uploaded Pets
============================================================ */
export const getSellerPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id })
      .select("name category price offerPrice status rejectionReason image createdAt inStock specifications")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pets,
    });
  } catch (error) {
    console.error("❌ Error fetching seller pets:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching seller items",
      error: error.message,
    });
  }
};

/* ============================================================
   🧑‍💼 SELLER: Update or Delete Their Pet
============================================================ */
export const updateSellerPet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // only owner can update
    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this pet" });
    }

    const { name, category, price, description, offerPrice, inStock, specifications } = req.body;

    // Image can come from Cloudinary upload middleware OR direct URL
    const imageUrl = req.file?.path || req.body.image;

    // apply updates
    if (name) pet.name = name;
    if (category) pet.category = category;
    if (price !== undefined) pet.price = price;
    if (offerPrice !== undefined) pet.offerPrice = offerPrice;
    if (description !== undefined) pet.description = description;
    if (inStock !== undefined) pet.inStock = inStock;
    if (imageUrl) pet.image = imageUrl;
    if (Array.isArray(specifications)) pet.specifications = specifications;

    await pet.save();
    res.status(200).json({ success: true, message: "Pet updated", pet });
  } catch (error) {
    console.error("❌ Error updating pet:", error.message);
    res.status(500).json({ message: "Error updating pet", error: error.message });
  }
};

export const deleteSellerPet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this pet" });
    }

    await Pet.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Pet deleted" });
  } catch (error) {
    console.error("❌ Error deleting pet:", error.message);
    res.status(500).json({ message: "Error deleting pet", error: error.message });
  }
};

export const getApprovedPetsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { status: "approved" };
    if (category) query.category = category;

    const pets = await Pet.find(query).populate("seller", "name email");
    res.status(200).json({ success: true, count: pets.length, pets });
  } catch (error) {
    console.error("❌ Error fetching approved pets:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching approved pets", error: error.message });
  }
};

export const getPetById = async (req, res) => {
  try {
    // populate seller basic info so frontend can show seller name/shop if needed
    let pet = await Pet.findById(req.params.id).populate("seller", "name shopName");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // ensure specifications is always an array in the response
    const petObj = pet.toObject ? pet.toObject() : pet;
    petObj.specifications = Array.isArray(petObj.specifications) ? petObj.specifications : [];

    res.status(200).json({ pet: petObj });
  } catch (error) {
    console.error("❌ Error fetching pet:", error);
    res.status(500).json({ message: "Server error while fetching pet" });
  }
};