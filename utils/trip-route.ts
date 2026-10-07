import type { SelectLocationLogWithLocation } from "~/lib/db/schema";

type Coord = [number, number];

const EARTH_RADIUS_KM = 6371;
// Legs shorter than this are drawn straight; longer ones follow the great circle so flights curve.
const ARC_MIN_KM = 150;
const ARC_KM_PER_POINT = 50;
const ARC_MIN_POINTS = 16;
const ARC_MAX_POINTS = 128;

const toRadians = (degrees: number) => degrees * Math.PI / 180;
const toDegrees = (radians: number) => radians * 180 / Math.PI;

/**
 * The points along the great circle between two [long, lat] coordinates. Longitudes are unwrapped
 * past ±180 so the line crosses the antimeridian the short way instead of spanning the whole map.
 */
export function greatCircle(from: Coord, to: Coord): Coord[] {
  const [lon1, lat1] = [toRadians(from[0]), toRadians(from[1])];
  const [lon2, lat2] = [toRadians(to[0]), toRadians(to[1])];

  // Haversine central angle.
  const a = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  const angle = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  const distance = angle * EARTH_RADIUS_KM;

  const points: Coord[] = [];

  if (distance < ARC_MIN_KM) {
    points.push(from, to);
  }
  else {
    const steps = Math.min(ARC_MAX_POINTS, Math.max(ARC_MIN_POINTS, Math.round(distance / ARC_KM_PER_POINT)));

    // Spherical linear interpolation between the two points as unit vectors.
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const weightA = Math.sin((1 - fraction) * angle) / Math.sin(angle);
      const weightB = Math.sin(fraction * angle) / Math.sin(angle);
      const x = weightA * Math.cos(lat1) * Math.cos(lon1) + weightB * Math.cos(lat2) * Math.cos(lon2);
      const y = weightA * Math.cos(lat1) * Math.sin(lon1) + weightB * Math.cos(lat2) * Math.sin(lon2);
      const z = weightA * Math.sin(lat1) + weightB * Math.sin(lat2);

      points.push([toDegrees(Math.atan2(y, x)), toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
    }
  }

  // MapLibre draws longitudes outside ±180 fine, so keep each point within 180° of the previous one.
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1]![0];
    let long = points[i]![0];

    while (long - previous > 180) long -= 360;
    while (long - previous < -180) long += 360;
    points[i] = [long, points[i]![1]];
  }

  return points;
}

/**
 * The route taken through a trip's logs, in the order they started: one line per leg between
 * consecutive stops. Back-to-back logs at the same location count as a single stop.
 */
export function getTripRoute(logs: SelectLocationLogWithLocation[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const stops = sortByDate(logs, "asc").filter((log, index, sorted) => log.locationId !== sorted[index - 1]?.locationId);

  return {
    type: "FeatureCollection",
    features: stops.slice(1).map((stop, index) => {
      const previous = stops[index]!;

      return {
        type: "Feature",
        properties: { index },
        geometry: {
          type: "LineString",
          coordinates: greatCircle(
            [previous.location.long, previous.location.lat],
            [stop.location.long, stop.location.lat],
          ),
        },
      };
    }),
  };
}
