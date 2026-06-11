const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;

export const RAZORPAY_KEY_ID =
  viteEnv?.VITE_RAZORPAY_KEY_ID || "rzp_test_ReWuobFH5H2jjx";
