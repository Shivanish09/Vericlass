/**
 * Geolocation and Geofencing utilities
 */

// Earth's radius in meters
const EARTH_RADIUS_METERS = 6371000;

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function isWithinGeofence(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): { isInside: boolean; distanceMeters: number } {
  const distanceMeters = calculateDistanceMeters(
    userLat,
    userLng,
    targetLat,
    targetLng
  );
  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1) {
    return 'Inside classroom (< 1 m)';
  }
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} meters`;
  }
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}
