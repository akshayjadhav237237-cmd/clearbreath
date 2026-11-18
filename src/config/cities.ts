/** Geographic coordinate specification for supported metropolitan cities. */
export interface CityCoordinate {
  readonly id: string;
  readonly name: string;
  readonly state: string;
  readonly latitude: number;
  readonly longitude: number;
}

/** Verified static coordinates (2 decimal places) for 12 major Indian cities. */
export const CITIES: readonly CityCoordinate[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi-NCR',
    latitude: 28.61,
    longitude: 77.21,
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    latitude: 28.46,
    longitude: 77.03,
  },
  {
    id: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    latitude: 28.53,
    longitude: 77.39,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.08,
    longitude: 72.88,
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    latitude: 18.52,
    longitude: 73.86,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    latitude: 22.57,
    longitude: 88.36,
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    latitude: 26.85,
    longitude: 80.95,
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    latitude: 25.6,
    longitude: 85.14,
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.02,
    longitude: 72.57,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.97,
    longitude: 77.59,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.08,
    longitude: 80.27,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.38,
    longitude: 78.49,
  },
];

/** Map indexing cities by lowercase identifier string. */
export const CITIES_BY_ID: ReadonlyMap<string, CityCoordinate> = new Map(
  CITIES.map((c) => [c.id, c])
);

/** Finds city coordinates by unique identifier. */
export function getCityById(id: string): CityCoordinate | undefined {
  return CITIES_BY_ID.get(id.toLowerCase());
}
