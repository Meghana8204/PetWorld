import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ pet }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col">
      <Link to={`/pets/${pet._id}`} className="flex-grow">
        <img
          src={pet.images?.[0] || "/placeholder.png"}
          alt={pet.name}
          className="h-48 w-full object-cover rounded-lg"
        />
        <h2 className="mt-3 font-semibold text-lg truncate">{pet.name}</h2>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2">
          {pet.description?.slice(0, 60) || "No description available."}
        </p>
      </Link>

      <div className="flex items-center justify-between mt-auto">
        <span className="font-bold text-blue-700 text-lg">
          ₹{pet.price?.toFixed(2) || "N/A"}
        </span>
        <button
          onClick={() => addToCart(pet._id, pet)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
