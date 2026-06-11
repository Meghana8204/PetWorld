// 📁 src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

/* ========================================================
   🛒 CART CONTEXT
   Provides full shopping cart logic (add, remove, totals)
======================================================== */

// ✅ Create Context and export
export const CartContext = createContext();

// ✅ Custom hook (recommended usage)
export const useCart = () => useContext(CartContext);

// ⚡ Load cart from localStorage before render (Lazy init)
const getStoredCart = () => {
  try {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn("Failed to parse cart from localStorage:", error);
    return {};
  }
};

/* ========================================================
   🧩 CART PROVIDER COMPONENT
======================================================== */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getStoredCart);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =============================
     🧮 Calculate totals whenever cart updates
  ============================= */
  const calculateTotals = (cartData) => {
    let items = 0;
    let price = 0;

    Object.values(cartData).forEach((item) => {
      items += item.quantity;
      price += item.price * item.quantity;
    });

    setTotalItems(items);
    setTotalPrice(price);
  };

  /* =============================
     🔁 Sync cart with localStorage
  ============================= */
  useEffect(() => {
    calculateTotals(cart);
    localStorage.setItem("cart", JSON.stringify(cart));
    setLoading(false);
  }, [cart]);

  /* =============================
     ➕ Add item to cart
  ============================= */
  const addToCart = (id, product) => {
    setCart((prev) => {
      const existing = prev[id];
      return {
        ...prev,
        [id]: {
          ...product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  /* =============================
     ➖ Remove one quantity
  ============================= */
  const removeFromCart = (id) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;

      const updated = { ...prev };
      if (existing.quantity > 1) {
        updated[id] = { ...existing, quantity: existing.quantity - 1 };
      } else {
        delete updated[id];
      }

      return updated;
    });
  };

  /* =============================
     🔢 Update quantity manually
  ============================= */
  const updateQuantity = (id, newQuantity) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;

      // remove item if quantity <= 0
      if (newQuantity <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }

      return {
        ...prev,
        [id]: { ...existing, quantity: newQuantity },
      };
    });
  };

  /* =============================
     ❌ Delete item completely
  ============================= */
  const deleteItem = (id) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  /* =============================
     🧹 Clear the entire cart
  ============================= */
  const clearCart = () => {
    setCart({});
    localStorage.removeItem("cart");
  };

  /* =============================
     ⚙️ Context value provided
  ============================= */
  const value = {
    cart,
    totalItems,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    deleteItem,
    clearCart,
  };

  /* =============================
     🧩 Render Provider
  ============================= */
  return (
    <CartContext.Provider value={value}>
      {!loading && children}
    </CartContext.Provider>
  );
};
