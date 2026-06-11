// src/context/WishlistContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { getWishlistFromServer } from "../api/wishlistAPI";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    // Load from localStorage initially
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Refresh wishlist from backend (useful after add/remove to keep client in sync)
  const refreshWishlist = async () => {
    try {
      const items = await getWishlistFromServer();
      setWishlist(items);
    } catch {
      // fail silently - wishlist should still work offline via localStorage
    }
  };

  const addToWishlist = (pet) => {
    if (!wishlist.some((item) => item._id === pet._id)) {
      setWishlist((prev) => [...prev, pet]);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
