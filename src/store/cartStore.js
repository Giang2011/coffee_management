import { create } from 'zustand';
import { getCart, addToCart, updateCartItem, removeCartItem } from '@/api/user/cart';

export const useCart = create((set, get) => ({
  items: [],

  fetch: async () => {
    const { data } = await getCart();
    set({ items: Array.isArray(data) ? data : (data.cart || []) });
  },

  add: async (item) => {
    // item should be { product_id, quantity }
    await addToCart({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity) || 1,
    });
    const { data } = await getCart();
    set({ items: Array.isArray(data) ? data : (data.cart || []) });
  },

  update: async (id, quantity) => {
    await updateCartItem(id, { quantity });
    const { data } = await getCart();
    set({ items: Array.isArray(data) ? data : (data.cart || []) });
  },

  remove: async (id) => {
    await removeCartItem(id);
    const { data } = await getCart();
    set({ items: Array.isArray(data) ? data : (data.cart || []) });
  },

  clear: async () => {
    // Remove all items one by one (or implement a clear API if available)
    const { data } = await getCart();
    const items = Array.isArray(data) ? data : (data.cart || []);
    for (const item of items) {
      await removeCartItem(item.id);
    }
    set({ items: [] });
  },
}));
