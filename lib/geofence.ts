// Geofencing utilities for preventing cheating

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if user is within the allowed geofence radius
 */
export function isWithinGeofence(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  radiusMeters: number = 50
): boolean {
  const distance = calculateDistance(userLocation, targetLocation);
  return distance <= radiusMeters;
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Verify location for start point
 */
export async function verifyStartLocation(): Promise<{
  isValid: boolean;
  distance?: number;
  location?: Coordinates;
  error?: string;
}> {
  try {
    const userLocation = await getCurrentLocation();
    const startLocation: Coordinates = {
      latitude: Number(process.env.NEXT_PUBLIC_START_LAT) || 43.2566,
      longitude: Number(process.env.NEXT_PUBLIC_START_LNG) || 76.9286,
    };
    const radius = Number(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS) || 50;

    const distance = calculateDistance(userLocation, startLocation);
    const isValid = distance <= radius;

    return {
      isValid,
      distance,
      location: userLocation,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Location verification failed",
    };
  }
}

/**
 * Verify location for finish point
 */
export async function verifyFinishLocation(): Promise<{
  isValid: boolean;
  distance?: number;
  location?: Coordinates;
  error?: string;
}> {
  try {
    const userLocation = await getCurrentLocation();
    const finishLocation: Coordinates = {
      latitude: Number(process.env.NEXT_PUBLIC_FINISH_LAT) || 43.258,
      longitude: Number(process.env.NEXT_PUBLIC_FINISH_LNG) || 76.929,
    };
    const radius = Number(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS) || 50;

    const distance = calculateDistance(userLocation, finishLocation);
    const isValid = distance <= radius;

    return {
      isValid,
      distance,
      location: userLocation,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Location verification failed",
    };
  }
}
