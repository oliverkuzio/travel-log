import type { SidebarItem } from "~/lib/types";

export const useSidebarStore = defineStore("useSidebarStore", () => {
  const sidebarSubItems = ref<SidebarItem[]>([]);
  const loading = ref(false);

  return {
    loading,
    sidebarSubItems,
  };
});
