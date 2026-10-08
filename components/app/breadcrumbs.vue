<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

type Crumb = {
  label: string;
  to?: RouteLocationRaw;
  icon?: string;
};

const route = useRoute();
const { currentTrip } = storeToRefs(useTripsStore());
const { currentLocation, currentLocationLog } = storeToRefs(useLocationsStore());

// Shown in place of a record's name while it loads.
const LOADING_LABEL = "…";

/**
 * The trail from the current section (trips, locations or location types) to the current page, worked out
 * from the route name. Every crumb but the last links back up.
 */
const crumbs = computed(() => {
  const name = route.name?.toString() || "";
  const slug = route.params.slug;
  const id = route.params.id;
  const trail: Crumb[] = [];

  if (name.startsWith("dashboard-trips")) {
    trail.push({ label: "Trips", to: "/dashboard/trips", icon: TRIP_ICON });

    if (name === "dashboard-trips-add") {
      trail.push({ label: "Add trip" });
    }
    else if (name.startsWith("dashboard-trips-slug")) {
      trail.push({
        label: currentTrip.value?.name ?? LOADING_LABEL,
        to: { name: "dashboard-trips-slug", params: { slug } },
      });

      if (name === "dashboard-trips-slug-add") {
        trail.push({ label: "Add log" });
      }
      else if (name === "dashboard-trips-slug-edit") {
        trail.push({ label: "Edit" });
      }
    }
  }
  else if (name.startsWith("dashboard-locations")) {
    trail.push({ label: "Locations", to: "/dashboard/locations", icon: "tabler:map-pins" });

    if (name === "dashboard-locations-add") {
      trail.push({ label: "Add location" });
    }
    else if (name === "dashboard-locations-import") {
      trail.push({ label: "Import" });
    }
    else if (name.startsWith("dashboard-locations-slug")) {
      trail.push({
        label: currentLocation.value?.name ?? LOADING_LABEL,
        to: { name: "dashboard-locations-slug", params: { slug } },
      });

      if (name === "dashboard-locations-slug-add") {
        trail.push({ label: "Add log" });
      }
      else if (name === "dashboard-locations-slug-edit") {
        trail.push({ label: "Edit" });
      }
      else if (name.startsWith("dashboard-locations-slug-id")) {
        trail.push({
          label: currentLocationLog.value?.name ?? LOADING_LABEL,
          to: { name: "dashboard-locations-slug-id", params: { slug, id } },
        });

        if (name === "dashboard-locations-slug-id-edit") {
          trail.push({ label: "Edit" });
        }
        else if (name === "dashboard-locations-slug-id-images") {
          trail.push({ label: "Images" });
        }
      }
    }
  }
  else if (name.startsWith("dashboard-types")) {
    trail.push({ label: "Location types", to: "/dashboard/types", icon: "tabler:category" });

    if (name === "dashboard-types-add") {
      trail.push({ label: "Add location type" });
    }
    else if (name === "dashboard-types-slug-edit") {
      trail.push({ label: "Edit" });
    }
  }

  // The current page isn't a link.
  const last = trail.at(-1);
  if (last) {
    last.to = undefined;
  }

  return trail;
});
</script>

<template>
  <nav class="breadcrumbs text-sm mb-2 py-0" aria-label="Breadcrumbs">
    <ul>
      <li v-for="(crumb, index) in crumbs" :key="index">
        <NuxtLink
          v-if="crumb.to"
          :to="crumb.to"
          class="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          <Icon
            v-if="crumb.icon"
            :name="crumb.icon"
            size="16"
          />
          <span class="truncate max-w-40">{{ crumb.label }}</span>
        </NuxtLink>
        <span
          v-else
          class="inline-flex items-center gap-1"
          aria-current="page"
        >
          <Icon
            v-if="crumb.icon"
            :name="crumb.icon"
            size="16"
          />
          <span class="truncate max-w-40">{{ crumb.label }}</span>
        </span>
      </li>
    </ul>
  </nav>
</template>
