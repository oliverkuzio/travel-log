import type { RouteLocationRaw } from "vue-router";

import type { UserWithId } from "./auth";

declare module "h3" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface H3EventContext {
    user?: UserWithId;
  }
}

export type LatLongItem = {
  lat: number;
  long: number;
};

export type MapPointKind = "trip" | "location";

export type CardPoint = {
  id: number;
  kind: MapPointKind;
  name: string;
  description: string | null;
  icon?: string | null;
  to?: RouteLocationRaw;
  toLabel?: string;
  // When the trip or log took place, shown on the map. Logs include the time of day.
  dates?: {
    startedAt: number;
    endedAt: number;
    withTime?: boolean;
  };
} & Partial<LatLongItem>;

export type MapPoint = CardPoint & LatLongItem;

export type SelectOption = {
  value: number;
  label: string;
};

export type HeadingMenuItem = {
  label: string;
  icon: string;
  to?: RouteLocationRaw;
  onClick?: () => void;
  danger?: boolean;
};

export type NominatimResult = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
};

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  iconColor?: string;
  matchPrefix?: boolean;
};

export type SortOrder = "asc" | "desc";

// A resized cover photo to upload, or "remove" to clear the existing one.
export type CoverImageChange = Blob | "remove";
