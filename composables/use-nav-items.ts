import type { SidebarItem } from "~/lib/types";

/**
 * The dashboard navigation, shared by the desktop sidebar and the mobile dock.
 */
export function useNavItems() {
  const authStore = useAuthStore();
  const route = useRoute();

  const mainItems = computed(() => {
    const items: SidebarItem[] = [{
      id: "link-dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "tabler:layout-dashboard",
    }, {
      id: "link-dashboard-trips",
      label: "Trips",
      href: "/dashboard/trips",
      icon: TRIP_ICON,
      // iconColor: getPointColors("trip").text,
      matchPrefix: true,
    }, {
      id: "link-dashboard-locations",
      label: "Locations",
      href: "/dashboard/locations",
      icon: "tabler:map-pins",
      // iconColor: getPointColors("location").text,
      matchPrefix: true,
    }];

    if (authStore.isAdmin) {
      items.push({
        id: "link-dashboard-types",
        label: "Location Types",
        href: "/dashboard/types",
        icon: "tabler:category",
        matchPrefix: true,
      });
    }

    return items;
  });

  const signOutItem: SidebarItem = {
    id: "link-sign-out",
    label: "Sign Out",
    href: "/sign-out",
    icon: "tabler:logout-2",
  };

  // Nested routes (e.g. /dashboard/trips/my-trip for /dashboard/trips) also count when matchPrefix is set.
  function isActive(item: SidebarItem) {
    return route.path === item.href
      || (item.matchPrefix && route.path.startsWith(`${item.href}/`));
  }

  return {
    mainItems,
    signOutItem,
    isActive,
  };
}
