import axiosInstance from "./utils/axiosInstance";

export async function getWishlistFromServer() {
  try {
    const res = await axiosInstance.get("/wishlist");
    const items = res.data?.items || res.data?.wishlist?.items || [];
    return items;
  } catch (err) {
    console.error("Error fetching wishlist from server:", err?.response?.data || err.message);
    throw err;
  }
}
