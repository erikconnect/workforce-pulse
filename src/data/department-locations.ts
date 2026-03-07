// Montgomery, AL — Department-to-location mapping
// Maps city department names to known building lat/lng for job pin placement

export interface DepartmentLocation {
  department: string
  lat: number
  lng: number
  address: string
}

export const DEPARTMENT_LOCATIONS: DepartmentLocation[] = [
  { department: "Police", lat: 32.3773, lng: -86.3091, address: "320 N Ripley St" },
  { department: "Fire", lat: 32.3780, lng: -86.3038, address: "953 S Perry St" },
  { department: "EMS", lat: 32.3780, lng: -86.3038, address: "953 S Perry St" },
  { department: "911", lat: 32.3773, lng: -86.3091, address: "320 N Ripley St" },
  { department: "City Hall", lat: 32.3779, lng: -86.3064, address: "103 N Perry St" },
  { department: "Public Works", lat: 32.3810, lng: -86.3155, address: "701 N Perry St" },
  { department: "Parks & Recreation", lat: 32.3748, lng: -86.2988, address: "1010 Forest Ave" },
  { department: "IT", lat: 32.3779, lng: -86.3064, address: "103 N Perry St" },
  { department: "Finance", lat: 32.3779, lng: -86.3064, address: "103 N Perry St" },
  { department: "Human Resources", lat: 32.3779, lng: -86.3064, address: "103 N Perry St" },
  { department: "Engineering", lat: 32.3810, lng: -86.3155, address: "701 N Perry St" },
  { department: "Planning", lat: 32.3779, lng: -86.3064, address: "103 N Perry St" },
  { department: "Health", lat: 32.3730, lng: -86.3002, address: "3060 Mobile Hwy" },
  { department: "Library", lat: 32.3810, lng: -86.3006, address: "245 High St" },
]

/**
 * Find the lat/lng for a city department name (case-insensitive partial match).
 * Falls back to City Hall if no match found.
 */
export function findDepartmentLocation(dept: string): { lat: number; lng: number } {
  const lower = dept.toLowerCase()
  const match = DEPARTMENT_LOCATIONS.find((d) =>
    lower.includes(d.department.toLowerCase()) || d.department.toLowerCase().includes(lower)
  )
  return match
    ? { lat: match.lat, lng: match.lng }
    : { lat: 32.3779, lng: -86.3064 } // default: City Hall
}
