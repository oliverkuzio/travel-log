import type { SelectLocation, SelectLocationLog, SelectLocationType, SelectTripWithLogs } from "~/lib/db/schema";
import type { CardPoint, LatLongItem, MapPoint, MapPointKind } from "~/lib/types";

import { isPendingRecord } from "~/lib/outbox-overlay";

type LocationWithOptionalType = SelectLocation & {
  type?: SelectLocationType | null;
  logs?: Pick<SelectLocationLog, "id">[];
};

export const DEFAULT_LOCATION_ICON = "tabler:map-pin-filled";
export const TRIP_ICON = "tabler:map";

export function createMapPointFromLocation(location: LocationWithOptionalType): MapPoint {
  return {
    id: location.id,
    kind: "location",
    name: location.name,
    description: location.description,
    lat: location.lat,
    long: location.long,
    icon: location.type?.icon,
    typeName: location.type?.name,
    coverImageKey: location.coverImageKey,
    visitCount: location.logs?.length,
    pending: isPendingRecord(location),
    to: { name: "dashboard-locations-slug", params: { slug: location.slug } },
  };
}

/**
 * A log is shown at its location, so it shares the location's id and kind. Hovering a log
 * therefore highlights its location's pin.
 */
export function createMapPointFromLocationLog(log: SelectLocationLog, location: LocationWithOptionalType): MapPoint {
  return {
    ...createMapPointFromLocation(location),
    name: log.name,
    description: log.description,
    dates: { startedAt: log.startedAt, endedAt: log.endedAt, withTime: true },
    pending: isPendingRecord(log),
    to: { name: "dashboard-locations-slug-id", params: { slug: location.slug, id: log.id } },
  };
}

/**
 * The centre of all the distinct locations visited on a trip, or null when it has no logs.
 */
export function getTripCoords(trip: Pick<SelectTripWithLogs, "logs">): LatLongItem | null {
  const locations = getTripLocations(trip);

  if (!locations.length) {
    return null;
  }

  return {
    lat: locations.reduce((sum, location) => sum + location.lat, 0) / locations.length,
    long: locations.reduce((sum, location) => sum + location.long, 0) / locations.length,
  };
}

export function getTripLocations(trip: Pick<SelectTripWithLogs, "logs">) {
  const locations = new Map<number, SelectTripWithLogs["logs"][number]["location"]>();

  trip.logs.forEach(log => locations.set(log.location.id, log.location));

  return [...locations.values()];
}

export function createMapPointFromTrip(trip: SelectTripWithLogs): CardPoint {
  return {
    id: trip.id,
    kind: "trip",
    name: trip.name,
    description: trip.description,
    icon: TRIP_ICON,
    dates: { startedAt: trip.startedAt, endedAt: trip.endedAt },
    ...getTripCoords(trip),
    coverImageKey: trip.coverImageKey,
    visitCount: getTripLocations(trip).length,
    pending: isPendingRecord(trip),
    to: { name: "dashboard-trips-slug", params: { slug: trip.slug } },
  };
}

export function hasCoords(point: CardPoint): point is MapPoint {
  return point.lat !== undefined && point.long !== undefined;
}

export function isPointSelected(item: Pick<CardPoint, "id" | "kind"> | null | undefined, selectedPoint: Pick<CardPoint, "id" | "kind"> | null | undefined) {
  if (!item || !selectedPoint)
    return false;
  return item.id === selectedPoint.id
    && item.kind === selectedPoint.kind;
}

// Full class names are listed so Tailwind can detect them.
const POINT_COLORS = {
  location: {
    text: "text-neutral",
    content: "text-neutral-content",
    bg: "bg-neutral",
    border: "border-neutral",
    tooltip: "tooltip-neutral",
    btn: "btn-neutral",
  },
  trip: {
    text: "text-secondary",
    content: "text-secondary-content",
    bg: "bg-secondary",
    border: "border-secondary",
    tooltip: "tooltip-secondary",
    btn: "btn-secondary",
  },
  selected: {
    text: "text-primary",
    content: "text-primary-content",
    bg: "bg-primary",
    border: "border-primary",
    tooltip: "tooltip-primary",
    btn: "btn-primary",
  },
} as const;

export type PointColors = (typeof POINT_COLORS)[keyof typeof POINT_COLORS];

/**
 * Locations use the neutral colour, trips the secondary colour, and the currently selected
 * (hovered, viewed or edited) point uses the primary colour.
 */
export function getPointColors(kind: MapPointKind, selected = false): PointColors {
  return selected ? POINT_COLORS.selected : POINT_COLORS[kind];
}
