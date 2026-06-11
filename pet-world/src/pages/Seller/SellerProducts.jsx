// src/pages/Seller/SellerProducts.jsx
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SellerProducts() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const token = localStorage.getItem("token");
  const fetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPets() {
      if (fetched.current) return;
      fetched.current = true;
      try {
        const res = await axiosInstance.get("/sellers/my-pets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPets(res.data?.pets || []);
      } catch (err) {
        console.error("❌ Error fetching pets:", err);
        toast.error("Failed to load your pets 🐾");
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await axiosInstance.delete(`/sellers/my-pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Product deleted");
        setPets((p) => p.filter((x) => x._id !== id && x.id !== id));
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (pet) => {
    // navigate to dashboard and pass pet in location state; SellerDashboard will consume it
    navigate("/seller/dashboard", { state: { pet } });
  };

  // client-side filtering
  const filtered = pets.filter((p) => {
    const matchesQuery = !query || (p.name || "").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="w-full bg-white/90 rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="pb-4 text-lg font-semibold text-gray-700">My Pets / Products</h2>

      {loading ? (
        <p className="text-gray-500 text-center py-10 animate-pulse">Loading your pets...</p>
      ) : (
        <>
          <div className="flex gap-3 items-center mb-4">
            <input
              type="search"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 rounded border w-60"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded border"
            >
              <option value="">All categories</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse">
              <thead className="text-gray-900 text-sm text-left bg-gray-100">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pet</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold hidden md:block">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {filtered.length > 0 ? (
                  filtered.map((pet, index) => (
                    <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <img
                          src={pet.image || "https://via.placeholder.com/80x80?text=🐾"}
                          alt={pet.name || "Pet"}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                        <span className="truncate font-medium text-gray-800">{pet.name || "Unnamed Pet"}</span>
                      </td>
                      <td className="px-4 py-3">{pet.category || "—"}</td>
                      <td className="px-4 py-3 max-sm:hidden">₹{pet.price || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            pet.status === "approved"
                              ? "bg-green-100 text-green-600"
                              : pet.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {pet.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleEdit(pet)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(pet._id || pet.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-400 py-8">
                      No pets listed yet 🐕
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
