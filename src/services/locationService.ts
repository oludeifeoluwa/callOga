export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NigerianLocationArea {
  state: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  popularTradeHub?: string;
}

// Major Nigerian metropolitan areas with precise coordinates
export const NIGERIAN_AREAS: NigerianLocationArea[] = [
  { state: 'Lagos', city: 'Lagos Island', area: 'Victoria Island', lat: 6.4281, lng: 3.4219, popularTradeHub: 'Saka Tinubu & Adeola Odeku' },
  { state: 'Lagos', city: 'Eti-Osa', area: 'Lekki Phase 1', lat: 6.4474, lng: 3.4842, popularTradeHub: 'Admiralty Way & Freedom Way' },
  { state: 'Lagos', city: 'Lagos Island', area: 'Ikoyi', lat: 6.4549, lng: 3.4357, popularTradeHub: 'Awolowo Road & Osborne' },
  { state: 'Lagos', city: 'Eti-Osa', area: 'Oniru', lat: 6.4352, lng: 3.4412, popularTradeHub: 'Palms & Palace Way' },
  { state: 'Lagos', city: 'Lagos Island', area: 'Marina / Onikan', lat: 6.4501, lng: 3.3985, popularTradeHub: 'Broad Street & Muson' },
  { state: 'Lagos', city: 'Ikeja', area: 'Ikeja GRA', lat: 6.5922, lng: 3.3551, popularTradeHub: 'Isaac John & Allen' },
  { state: 'Lagos', city: 'Ikeja', area: 'Alausa / CBD', lat: 6.6158, lng: 3.3578, popularTradeHub: 'Secretariat Road' },
  { state: 'Lagos', city: 'Mainland', area: 'Yaba', lat: 6.5173, lng: 3.3761, popularTradeHub: 'Tejuosho & Herbert Macaulay' },
  { state: 'Lagos', city: 'Surulere', area: 'Surulere / Stadium', lat: 6.4975, lng: 3.3592, popularTradeHub: 'Adeniran Ogunsanya & Bode Thomas' },
  { state: 'Lagos', city: 'Eti-Osa', area: 'Ajah / Sangotedo', lat: 6.4673, lng: 3.5684, popularTradeHub: 'Ajah Roundabout & Ilaje' },
  { state: 'Abuja (FCT)', city: 'Abuja Municipal', area: 'Wuse 2', lat: 9.0765, lng: 7.4723, popularTradeHub: 'Adetokunbo Ademola' },
  { state: 'Abuja (FCT)', city: 'Abuja Municipal', area: 'Maitama', lat: 9.0882, lng: 7.4934, popularTradeHub: 'Gana Street' },
  { state: 'Abuja (FCT)', city: 'Abuja Municipal', area: 'Garki 2', lat: 9.0345, lng: 7.4891, popularTradeHub: 'Emeka Anyaoku' },
  { state: 'Rivers', city: 'Port Harcourt', area: 'Old GRA', lat: 4.8156, lng: 7.0498, popularTradeHub: 'Forces Avenue' },
  { state: 'Oyo', city: 'Ibadan', area: 'Bodija', lat: 7.4243, lng: 3.9056, popularTradeHub: 'Favos & Housing Corp' }
];

// Default user position (Lekki Phase 1 / Victoria Island interface)
export const DEFAULT_CUSTOMER_LOCATION: NigerianLocationArea = NIGERIAN_AREAS[1];

/**
 * Calculates geographical distance between two points in Kilometers using the Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats distance in a consumer-friendly privacy-safe format
 * E.g. "0.8 km away", "1.4 km away", "2.7 km away"
 */
export function formatDistanceString(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) {
    return 'Nearby';
  }
  if (distanceKm < 0.2) {
    return 'Under 300m away';
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Generates official PostGIS spatial query string for Supabase / PostgreSQL database
 * Demonstrates PostGIS query structure as specified in Section 6.
 */
export function generatePostGisNearbyQuery(options: {
  lat: number;
  lng: number;
  radiusKm: number;
  tradeSlug?: string;
  verifiedOnly?: boolean;
}): string {
  const { lat, lng, radiusKm, tradeSlug, verifiedOnly } = options;
  const radiusMeters = radiusKm * 1000;

  return `
-- PostGIS Spatial Query: ST_DWithin on indexed Geography point
SELECT 
  ap.id,
  p.full_name,
  t.name as trade_name,
  ap.rating_average,
  ap.completed_jobs,
  ap.verification_status,
  ROUND((ST_Distance(
    ap.location_geom, 
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
  ) / 1000)::numeric, 1) AS distance_km
FROM artisan_profiles ap
JOIN profiles p ON ap.user_id = p.user_id
JOIN trades t ON ap.trade_id = t.id
WHERE ST_DWithin(
  ap.location_geom,
  ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
  ${radiusMeters}
)
${tradeSlug ? `AND t.slug = '${tradeSlug}'` : ''}
${verifiedOnly ? `AND ap.verification_status = 'verified'` : ''}
ORDER BY ap.location_geom <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography ASC
LIMIT 50;
  `.trim();
}
