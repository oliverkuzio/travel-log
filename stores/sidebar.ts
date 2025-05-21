import type { SidebarItem } from "~/lib/types";

export const useSidebarStore = defineStore("useSidebarStore", () => {
  const sidebarMainItems = ref<SidebarItem[]>([]);
  const sidebarSubItems = ref<SidebarItem[]>([]);
  const loading = ref(false);

  return {
    loading,
    sidebarMainItems,
    sidebarSubItems,
  };
});
