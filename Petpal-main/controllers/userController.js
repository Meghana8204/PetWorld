import User from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, phone, address, city, state, zipCode } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone?.trim() || "";
    user.address = address?.trim() || "";
    user.city = city?.trim() || "";
    user.state = state?.trim() || "";
    user.zipCode = zipCode?.trim() || "";

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
