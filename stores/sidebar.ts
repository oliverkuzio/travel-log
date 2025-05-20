import type { RouteLocationRaw } from "vue-router";

import type { MapPoint } from "~/lib/types";

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
  to?: RouteLocationRaw;
  mapPoint?: MapPoint | null;
};

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
