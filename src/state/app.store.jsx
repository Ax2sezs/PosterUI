import { create } from "zustand";

export const useAppStore = create((set) => ({
    menus: [],
    brands: [],
    loading: true,
    currentDomain: localStorage.getItem("adminBrandDomain") || "",

    setMenus: (updater) =>
        set(state => ({
            menus: typeof updater === "function"
                ? updater(state.menus)
                : updater
        })),
    setBrands: (brands) => set({ brands }),
    setLoading: (loading) => set({ loading }),
    setCurrentDomain: (domain) => {
        localStorage.setItem("adminBrandDomain", domain);
        set({ currentDomain: domain });
    }
}));
