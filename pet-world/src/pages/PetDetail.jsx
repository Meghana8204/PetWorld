import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { RAZORPAY_KEY_ID } from "../config/payment";
import getErrorMessage from "../utils/getErrorMessage";

// silence motion unused warning
void motion;

export default function PetDetail() {
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Normalize pet data for consistent UI
  const normalizePet = (p) => {
    if (!p) return null;
    const copy = { ...p };
    copy.id = copy._id || copy.id;
    copy.title = copy.name || copy.title || "Pet";
    copy.type = copy.category || copy.type || "Unknown";

    if (!Array.isArray(copy.images)) {
      if (copy.image) copy.images = [copy.image];
      else if (copy.additionalImages)
        copy.images = Array.isArray(copy.additionalImages)
          ? copy.additionalImages
          : [];
      else copy.images = [];
    }

    if (!Array.isArray(copy.specifications)) {
      copy.specifications = Array.isArray(copy.specifications)
        ? copy.specifications
        : [];
    }

    return copy;
  };

  const initialPet = normalizePet(location.state?.pet ?? null);
  const [pet, setPet] = useState(initialPet);
  const [loading, setLoading] = useState(!initialPet);
  const [addingToCart, setAddingToCart] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch pet details if not passed via navigation
  useEffect(() => {
    if (pet) return;

    async function fetchPet() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/pets/${id}`);
        const data = res.data.pet;
        if (!data) throw new Error("Pet not found");

        setPet(normalizePet(data));
      } catch (err) {
        console.error("❌ Error fetching pet details:", err);
        toast.error("Failed to load pet details");
      } finally {
        setLoading(false);
      }
    }

    fetchPet();
  }, [id, pet]);

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
        petId: pet._id || pet.id,
        quantity: 1,
      };

      await axiosInstance.post("/cart/add", payload);
      // addToCart expects (id, product) - use pet._id as the cart key
      addToCartContext(pet._id || pet.id, {
        petId: pet._id || pet.id,
        name: pet.name || pet.title,
        price:
          pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price,
        image: pet.images?.[0] || pet.image,
        category: pet.category || pet.type,
        quantity: 1,
      });
      toast.success(`${pet.title} added to cart 🐾`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart ❌");
    } finally {
      setAddingToCart(false);
    }
  };

  // 💳 BUY NOW (Razorpay Checkout)
  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to checkout 🔐");
      navigate("/login");
      return;
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create order on backend
      const amount =
        pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price;

      const { data } = await axiosInstance.post("/payments/create-order", {
        amount,
      });

      if (!data?.success || !data?.order?.id) {
        throw new Error("Failed to create Razorpay order");
      }

      const { order, keyId } = data;

      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "PetZone",
        description: `Purchase of ${pet.title}`,
        image:
          "https://cdn-icons-png.flaticon.com/512/616/616408.png",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axiosInstance.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              petId: pet._id || pet.id,
              amount: order.amount / 100,
            });

            toast.success("Payment successful 🎉");
            navigate("/order-success", { state: { pet } });
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment verification failed ❌");
          }
        },
        prefill: {
          name: user.name || "Pet Lover",
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(getErrorMessage(err, "Failed to process payment"));
    } finally {
      setProcessingPayment(false);
    }
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading pet details...
      </div>
    );
  }

  // ❌ No pet found
  if (!pet) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p>Pet not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = (pet.images || []).filter(Boolean);
  const descriptionList = pet.description
    ? pet.description.split(".").filter((d) => d.trim().length > 0)
    : ["No detailed description available."];

  // 🐶 UI Layout
  return (
    <div className="max-w-6xl w-full px-6 py-8 mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <span>/</span>
        <span>{pet.type}</span>
        <span>/</span>
        <span className="text-indigo-500 font-medium truncate max-w-[200px]">
          {pet.title}
        </span>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left - Images */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {images.map((img, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="border border-gray-300 rounded-lg overflow-hidden cursor-pointer w-20 h-20"
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
              src={
                images[0] ||
                "https://cdn-icons-png.flaticon.com/512/616/616408.png"
              }
              alt={pet.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Right - Details */}
        <div className="w-full md:w-1/2 text-sm">
          <h1 className="text-3xl font-semibold">{pet.title}</h1>
          <p className="text-gray-500 text-base mt-1">
            {pet.category || pet.type}
          </p>

          <div className="mt-6">
            {pet.offerPrice && pet.offerPrice > 0 ? (
              <>
                <p className="text-gray-500/70 line-through">
                  MRP: ₹{pet.price}
                </p>
                <p className="text-2xl font-medium text-blue-600">
                  ₹{pet.offerPrice}
                </p>
              </>
            ) : (
              <p className="text-2xl font-medium text-blue-600">₹{pet.price}</p>
            )}
            <p className="text-gray-500/70">(Inclusive of all taxes)</p>
          </div>

          <div className="mt-6">
            <p className="text-base font-medium mb-2">About This Pet</p>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed">
              {descriptionList.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          {Array.isArray(pet.specifications) &&
            pet.specifications.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Specifications 📋
                </h3>
                <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm">
                  {pet.specifications.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b py-1"
                    >
                      <span className="font-medium">
                        {s.label || `Spec ${i + 1}`}
                      </span>
                      <span>{s.value || "N/A"}</span>
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
              className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-lg"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              disabled={processingPayment}
              className="w-full py-3.5 font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition rounded-lg flex items-center justify-center gap-2"
            >
              {processingPayment ? "Processing..." : "Buy Now"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
    );
  }
