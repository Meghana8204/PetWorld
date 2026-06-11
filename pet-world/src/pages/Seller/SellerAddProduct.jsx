import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// avoid linter false-positive for unused `motion` when used in JSX
void motion;
import toast from "react-hot-toast";
import axiosInstance from "../../api/utils/axiosInstance";

import { useNavigate } from "react-router-dom";

export default function SellerAddProduct({ editingPet = null, clearEditing = () => {} }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [petForm, setPetForm] = useState({
    name: "",
    category: "",
    price: "",
    offerPrice: "",
    description: "",
    image: "",
    // seller-provided specifications (array of { label, value })
    specifications: [{ label: "", value: "" }],
    inStock: true,
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // If editingPet is provided, pre-fill the form
    if (editingPet) {
      setPetForm({
        name: editingPet.name || "",
        category: editingPet.category || "",
        price: editingPet.price || "",
        offerPrice: editingPet.offerPrice || "",
        description: editingPet.description || "",
        image: editingPet.image || "",
        specifications: Array.isArray(editingPet.specifications) && editingPet.specifications.length
          ? editingPet.specifications
          : [{ label: "", value: "" }],
        inStock: editingPet.inStock ?? true,
        id: editingPet._id || editingPet.id || null,
      });
      setImages(editingPet.image ? [editingPet.image] : []);
    }
  }, [editingPet]);

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  /* ☁️ Upload Image to Cloudinary */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "petworld"); // Your Cloudinary unsigned preset

    try {
      setUploading(true);
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dujdjt4l7/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        const updated = [...images];
        // only keep a single image (index 0)
        updated[0] = data.secure_url;
        setImages(updated.slice(0, 1));
        setPetForm((prev) => ({ ...prev, image: data.secure_url }));
        toast.success("Image uploaded successfully 🐾");
      } else {
        toast.error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Image upload failed 🚫");
    } finally {
      setUploading(false);
    }
  };

  /* 🧾 Add New Product / Pet */
  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!petForm.image) return toast.error("Please upload an image first");

    try {
      // ensure specifications are valid array
      const payload = {
        ...petForm,
        specifications: Array.isArray(petForm.specifications)
          ? petForm.specifications.filter((s) => s.label || s.value)
          : [],
      };
      let res;
      // If editing, call update endpoint
      if (petForm.id) {
        res = await axiosInstance.put(`/sellers/my-pets/${petForm.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axiosInstance.post("/sellers/add-pet", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.success) {
        const verb = petForm.id ? "updated" : "added";
        toast.success(`Pet ${verb} successfully!`);
        setPetForm({
          name: "",
          category: "",
          price: "",
          offerPrice: "",
          description: "",
          image: "",
          specifications: [{ label: "", value: "" }],
          inStock: true,
        });
        setImages([]);
        // clear editing state if present and navigate back to products view
        clearEditing();
        navigate("/seller/dashboard?view=products", { replace: true });
      } else {
        toast.error(res.data.message || "Failed to save pet");
      }
    } catch (err) {
      console.error("❌ Error adding pet:", err);
      toast.error(err.response?.data?.message || "Failed to save pet");
    }
  };

  return (
    <motion.form
      onSubmit={handleAddPet}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="md:p-10 p-4 space-y-5 max-w-lg mx-auto bg-white/90 rounded-xl shadow-lg border border-gray-200"
    >
      <p className="text-xl font-semibold text-gray-700">🐕 Add New Product</p>

      {/* 📸 Image Upload Section */}
      <div>
        <p className="text-base font-medium">Product Images</p>
        <div className="flex items-center gap-3 mt-2">
          <label htmlFor={`image0`} className="flex items-center gap-3 cursor-pointer">
            <input
              accept="image/*"
              type="file"
              id={`image0`}
              hidden
              onChange={handleImageUpload}
            />
            <img
              className="max-w-24 cursor-pointer border rounded-lg"
              src={
                images[0] ||
                "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png"
              }
              alt="uploadArea"
              width={100}
              height={100}
            />
            <span className="text-sm text-gray-500">Click to upload</span>
          </label>
        </div>
        {uploading && (
          <p className="text-sm text-gray-500 mt-2 animate-pulse">
            Uploading image...
          </p>
        )}
      </div>

      {/* 🏷️ Product Name */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium" htmlFor="product-name">
          Product Name
        </label>
        <input
          id="product-name"
          type="text"
          placeholder="Type here"
          value={petForm.name}
          onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
          className="outline-none py-2 px-3 rounded border border-gray-400/50"
          required
        />
      </div>

      {/* 📝 Description */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium" htmlFor="product-description">
          Description
        </label>
        <textarea
          id="product-description"
          rows={4}
          placeholder="Type here"
          value={petForm.description}
          onChange={(e) =>
            setPetForm({ ...petForm, description: e.target.value })
          }
          className="outline-none py-2 px-3 rounded border border-gray-400/50 resize-none"
        ></textarea>
      </div>

      {/* 🐾 Category */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={petForm.category}
          onChange={(e) =>
            setPetForm({ ...petForm, category: e.target.value })
          }
          className="outline-none py-2 px-3 rounded border border-gray-400/50"
          required
        >
          <option value="">Select Category</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Fish">Fish</option>
        </select>
      </div>

      {/* 🧾 Specifications (Seller only) */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-medium">Specifications (optional)</label>
        {petForm.specifications.map((spec, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Label (e.g. Age, Color)"
              value={spec.label}
              onChange={(e) => {
                const updated = [...petForm.specifications];
                updated[idx] = { ...updated[idx], label: e.target.value };
                setPetForm({ ...petForm, specifications: updated });
              }}
              className="flex-1 py-2 px-3 rounded border border-gray-300"
            />
            <input
              type="text"
              placeholder="Value (e.g. 6 months)"
              value={spec.value}
              onChange={(e) => {
                const updated = [...petForm.specifications];
                updated[idx] = { ...updated[idx], value: e.target.value };
                setPetForm({ ...petForm, specifications: updated });
              }}
              className="flex-1 py-2 px-3 rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                const updated = petForm.specifications.filter((_, i) => i !== idx);
                setPetForm({ ...petForm, specifications: updated });
              }}
              className="px-3 py-2 bg-red-100 text-red-600 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setPetForm({
              ...petForm,
              specifications: [...petForm.specifications, { label: "", value: "" }],
            })
          }
          className="self-start px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
        >
          + Add specification
        </button>
      </div>

      {/* 💰 Price + Offer Price */}
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-price">
            Price
          </label>
          <input
            id="product-price"
            type="number"
            placeholder="0"
            value={petForm.price}
            onChange={(e) => setPetForm({ ...petForm, price: e.target.value })}
            className="outline-none py-2 px-3 rounded border border-gray-400/50"
            required
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="offer-price">
            Offer Price
          </label>
          <input
            id="offer-price"
            type="number"
            placeholder="0"
            value={petForm.offerPrice}
            onChange={(e) =>
              setPetForm({ ...petForm, offerPrice: e.target.value })
            }
            className="outline-none py-2 px-3 rounded border border-gray-400/50"
          />
        </div>
      </div>

      {/* 🟢 Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
      >
        {uploading ? "Uploading..." : petForm.id ? "Update Product" : "Add Product"}
      </button>
    </motion.form>
  );
}
