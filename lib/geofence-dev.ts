// DEV MODE: Disable geofencing for testing
// Replace lib/geofence.ts imports with this file to skip location checks

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  return 0; // Always return 0 distance in dev mode
}

export function isWithinGeofence(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  radiusMeters: number = 50
): boolean {
  return true; // Always within geofence in dev mode
}

export async function getCurrentLocation(): Promise<Coordinates> {
  // Mock location at Health Stairs
  return {
    latitude: 43.2566,
    longitude: 76.9286,
  };
}

export async function verifyStartLocation(): Promise<{
  isValid: boolean;
  distance?: number;
  location?: Coordinates;
  error?: string;
}> {
  console.log("🧪 DEV MODE: Skipping geofence check");
  return {
    isValid: true,
    distance: 0,
    location: { latitude: 43.2566, longitude: 76.9286 },
  };
}

export async function verifyFinishLocation(): Promise<{
  isValid: boolean;
  distance?: number;
  location?: Coordinates;
  error?: string;
}> {
  console.log("🧪 DEV MODE: Skipping geofence check");
  return {
    isValid: true,
    distance: 0,
    location: { latitude: 43.2580, longitude: 76.9290 },
  };
}
