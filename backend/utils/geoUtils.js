/**
 * Geo Utilities for GroundFix
 * Haversine distance, duplicate detection, and proximity calculation
 */

/**
 * Calculates the great-circle distance between two points on Earth in meters
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance into a human-readable string (e.g., "350 m" or "1.4 km")
 * @param {number} meters 
 * @returns {string}
 */
function formatDistance(meters) {
  if (meters === undefined || meters === null || isNaN(meters)) return 'Unknown';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Checks if a new location is within duplicate threshold of an existing location (default 100 meters)
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @param {number} thresholdMeters 
 * @returns {boolean}
 */
function isNearbyDuplicate(lat1, lon1, lat2, lon2, thresholdMeters = 100) {
  const dist = calculateDistanceMeters(lat1, lon1, lat2, lon2);
  return dist <= thresholdMeters;
}

module.exports = {
  calculateDistanceMeters,
  formatDistance,
  isNearbyDuplicate
};
