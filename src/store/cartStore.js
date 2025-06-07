import { create } from 'zustand';

export const useCart = create((set, get) => ({
  items: [],

  add: (product) =>
    set((state) => {
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        // tăng số lượng nếu đã có
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: product.quantity || 1 }] };
    }),

  remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clear: () => set({ items: [] }),
}));
