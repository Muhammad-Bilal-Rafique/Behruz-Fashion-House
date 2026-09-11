import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";

export interface CartItem {
  id: string; // Composite unique key: `${productId}-${size}`
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number; // discountedPrice (actual selling price)
  maxStock?: number; // Size-level maximum available inventory
}

export interface CartStoreState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart. If same product and size exists, increases quantity up to maxStock
      addItem: (newItem) => {
        const itemId = `${newItem.productId}-${newItem.size}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === itemId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const existing = updated[existingIndex];
          const maxStock = newItem.maxStock !== undefined ? newItem.maxStock : (existing.maxStock ?? 999);
          const requestedQty = existing.quantity + (newItem.quantity > 0 ? newItem.quantity : 1);
          const clampedQty = Math.min(requestedQty, maxStock);

          updated[existingIndex] = {
            ...existing,
            quantity: clampedQty,
            price: newItem.price, // update with latest selling price
            image: newItem.image || existing.image,
            maxStock,
          };
          set({ items: updated });
        } else {
          const maxStock = newItem.maxStock !== undefined ? newItem.maxStock : 999;
          const requestedQty = newItem.quantity > 0 ? newItem.quantity : 1;
          const clampedQty = Math.min(requestedQty, maxStock);

          set({
            items: [
              ...currentItems,
              {
                ...newItem,
                id: itemId,
                quantity: clampedQty,
                maxStock,
              },
            ],
          });
        }
      },

      // Remove specific cart item by composite ID
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      // Update quantity with minimum guard of 1 and maxStock upper bound
      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i.id === id);
        const maxStock = item?.maxStock ?? 999;
        const safeQuantity = Math.max(1, Math.min(Math.floor(quantity), maxStock));

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: safeQuantity } : i
          ),
        });
      },

      // Increase quantity by 1 (up to maxStock)
      increaseQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        const maxStock = item.maxStock ?? 999;
        if (item.quantity >= maxStock) return;

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, maxStock) } : i
          ),
        });
      },

      // Decrease quantity by 1 (minimum 1, never below 1)
      decreaseQuantity: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          ),
        });
      },

      // Empty all items from the cart
      clearCart: () => {
        set({ items: [] });
      },

      // Derived total quantity across all items
      getTotalQuantity: () => {
        return get().items.reduce(
          (total, item) => total + (Number(item.quantity) || 1),
          0
        );
      },

      // Derived subtotal using discounted price * quantity
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1),
          0
        );
      },
    }),
    {
      name: "behruz_cart_storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/**
 * Custom hook to safely access Zustand cart state without SSR hydration mismatch errors.
 */
export function useCartHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const store = useCartStore();

  return {
    ...store,
    hasHydrated,
    // Return empty defaults before hydration to prevent mismatch
    items: hasHydrated ? store.items : [],
    totalQuantity: hasHydrated ? store.getTotalQuantity() : 0,
    subtotal: hasHydrated ? store.getSubtotal() : 0,
  };
}
