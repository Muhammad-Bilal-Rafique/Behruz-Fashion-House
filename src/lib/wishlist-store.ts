import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";
import type { ShopProduct } from "@/components/shop/shop-card";

export interface WishlistItem extends ShopProduct {
  addedAt: string;
}

export interface WishlistStoreState {
  items: WishlistItem[];
  addItem: (product: ShopProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ShopProduct) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalCount: () => number;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item._id === product._id);
        if (!exists) {
          const newItem: WishlistItem = {
            ...product,
            description: product.description || "",
            addedAt: new Date().toISOString(),
          };
          set({ items: [newItem, ...currentItems] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item._id !== productId),
        });
      },

      toggleItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item._id === product._id);

        if (exists) {
          set({
            items: currentItems.filter((item) => item._id !== product._id),
          });
          return false; // Removed
        } else {
          const newItem: WishlistItem = {
            ...product,
            description: product.description || "",
            addedAt: new Date().toISOString(),
          };
          set({ items: [newItem, ...currentItems] });
          return true; // Added
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item._id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "behruz_wishlist_storage",
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
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/**
 * Custom hook to safely access Zustand wishlist state without SSR hydration mismatches.
 */
export function useWishlistHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const store = useWishlistStore();

  return {
    ...store,
    hasHydrated,
    items: hasHydrated ? store.items : [],
    totalCount: hasHydrated ? store.getTotalCount() : 0,
    isInWishlist: (productId: string) =>
      hasHydrated ? store.isInWishlist(productId) : false,
  };
}
