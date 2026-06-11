import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        setProfileData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          zipCode: res.data.zipCode || "",
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfileData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          zipCode: user.zipCode || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put("/users/profile", profileData);
      const savedUser = res.data?.user;

      if (savedUser) {
        updateUser(savedUser);
        setProfileData({
          name: savedUser.name || "",
          email: savedUser.email || "",
          phone: savedUser.phone || "",
          address: savedUser.address || "",
          city: savedUser.city || "",
          state: savedUser.state || "",
          zipCode: savedUser.zipCode || "",
        });
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-12 h-12 border-4 border-pink-500 border-t-indigo-600 rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition"
                >
                  <Save className="w-4 h-4" /> Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:shadow-lg transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-pink-500" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-800 font-medium">{profileData.name}</p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-pink-500" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ) : (
                <p className="text-gray-800 font-medium">{profileData.email}</p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone className="w-4 h-4 text-pink-500" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-800 font-medium">
                  {profileData.phone || "Not provided"}
                </p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4 text-pink-500" /> Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-gray-800 font-medium">
                  {profileData.address || "Not provided"}
                </p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your city"
                />
              ) : (
                <p className="text-gray-800 font-medium">
                  {profileData.city || "Not provided"}
                </p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your state"
                />
              ) : (
                <p className="text-gray-800 font-medium">
                  {profileData.state || "Not provided"}
                </p>
              )}
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Zip Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="zipCode"
                  value={profileData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your zip code"
                />
              ) : (
                <p className="text-gray-800 font-medium">
                  {profileData.zipCode || "Not provided"}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
