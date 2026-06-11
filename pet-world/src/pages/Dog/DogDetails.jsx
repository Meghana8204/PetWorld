import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// avoid linter false-positive
void motion;

import { ShoppingCart, ArrowLeft } from "lucide-react";

export default function DogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // normalize pet object so UI can rely on consistent keys
  const normalizeDog = (d) => {
    if (!d) return null;
    const copy = { ...d };
    copy.id = copy._id || copy.id;
    copy.title = copy.name || copy.title || "Dog";
    copy.type = copy.category || copy.type || "Unknown";

    // images: normalize to array
    if (!Array.isArray(copy.images)) {
      if (copy.image) copy.images = [copy.image];
      else if (copy.additionalImages) copy.images = Array.isArray(copy.additionalImages) ? copy.additionalImages : [];
      else copy.images = [];
    }

    // specifications: ensure array of {label,value}
    if (!Array.isArray(copy.specifications)) {
      copy.specifications = [];
    }

    return copy;
  };

  // 🐶 Fetch single dog details
  useEffect(() => {
    async function fetchDog() {
      try {
        const res = await axiosInstance.get(`/pets/${id}`);
        const data = res.data.pet;
        const normalized = normalizeDog(data);
        setDog(normalized);
        setThumbnail((normalized?.images?.[0]) || "");
      } catch (err) {
        console.error("❌ Error fetching dog details:", err);
        toast.error("Failed to load dog details 🐾");
      } finally {
        setLoading(false);
      }
    }
    fetchDog();
  }, [id]);

  // 🛒 ADD TO CART
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart 🔐");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const payload = {
        petId: dog._id || dog.id,
        quantity: 1,
      };

      await axiosInstance.post("/cart/add", payload);
      addToCart(dog._id || dog.id, {
        petId: dog._id || dog.id,
        name: dog.name,
        price: dog.offerPrice && dog.offerPrice > 0 ? dog.offerPrice : dog.price,
        image: dog.images?.[0],
        category: dog.category,
        quantity: 1,
      });
      toast.success(`${dog.name} added to cart 🐾`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart ❌");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading dog details...
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p>Dog not found 🐶</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = (dog.images || []).filter(Boolean);
  const descriptionList = dog.description
    ? dog.description.split(".").filter((d) => d.trim().length > 0)
    : ["No detailed description available."];

  return (
    <div className="max-w-6xl w-full px-6 py-8 mx-auto">
      {/* 🏠 Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span>/</span>
        <span> Dogs </span>
        <span>/</span>
        <span className="text-indigo-500 font-medium truncate max-w-[200px]">
          {dog.name}
        </span>
      </div>

      {/* 🐕 Dog Info Layout */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* 🖼 Image Section */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {images.map((img, index) => (
              <motion.div
                key={index}
                onClick={() => setThumbnail(img)}
                whileHover={{ scale: 1.05 }}
                className={`border ${
                  thumbnail === img ? "border-blue-500" : "border-gray-300"
                } rounded-lg overflow-hidden cursor-pointer w-20 h-20`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </motion.div>
            ))}
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-[400px]">
            <motion.img
              key={thumbnail}
              src={
                thumbnail ||
                "https://cdn-icons-png.flaticon.com/512/616/616408.png"
              }
              alt="Selected Dog"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* 📝 Details Section */}
        <div className="w-full md:w-1/2 text-sm">
          <h1 className="text-3xl font-semibold">{dog.name}</h1>
          <p className="text-gray-500 text-base mt-1">{dog.category}</p>

          <div className="mt-6">
            {dog.offerPrice && dog.offerPrice > 0 ? (
              <>
                <p className="text-gray-500/70 line-through">
                  MRP: ₹{dog.price}
                </p>
                <p className="text-2xl font-medium text-blue-600">
                  ₹{dog.offerPrice}
                </p>
              </>
            ) : (
              <p className="text-2xl font-medium text-blue-600">₹{dog.price}</p>
            )}
            <p className="text-gray-500/70">(Inclusive of all taxes)</p>
          </div>

          <div className="mt-6">
            <p className="text-base font-medium mb-2">About This Dog</p>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed">
              {descriptionList.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          </div>

          {/* 🔧 Specifications */}
          {Array.isArray(dog.specifications) && dog.specifications.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Specifications 📋
              </h3>
              <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm">
                {dog.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between border-b py-1">
                    <span className="font-medium">{spec.label || `Spec ${i + 1}`}</span>
                    <span>{spec.value || "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center mt-10 gap-4 text-base">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 disabled:opacity-50 transition rounded-lg"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                toast.success("Proceeding to checkout 🐶", {
                  id: "checkout-toast",
                });
                setTimeout(() => navigate("/checkout", { state: { dog } }), 1200);
              }}
              className="w-full py-3.5 font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition rounded-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Buy Now
            </motion.button>
          </div>
        </div>
      </div>

      {/* 🧸 Frequently Bought Together */}
      {/* Removed: related items section was using placeholder data */}
    </div>
  );
}
