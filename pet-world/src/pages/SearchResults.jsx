import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/utils/axiosInstance";
import ProductCard from "../components/ProductCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndFilter() {
      setLoading(true);
      try {
        // fetch approved pets and filter client-side by name
        const res = await axiosInstance.get("/pets/approved");
        const all = res.data?.pets || res.data || [];

        // Normalize image fields: some docs use `image` (string) while UI expects `images` array
        const normalized = (all || []).map((p) => {
          const copy = { ...p };
          if (!Array.isArray(copy.images)) {
            if (copy.image) copy.images = [copy.image];
            else copy.images = [];
          }
          return copy;
        });

        const qLower = q.toLowerCase();
        const filtered = normalized.filter((p) =>
          (p.name || "").toLowerCase().includes(qLower)
        );
        setPets(filtered);
      } catch (err) {
        console.error("Search fetch error:", err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAndFilter();
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search results for "{q}"</h1>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Searching...</p>
      ) : pets.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <ProductCard key={pet._id || pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
