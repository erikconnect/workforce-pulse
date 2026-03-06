// Montgomery, AL — Civil Rights Heritage Landmarks
// Sources: National Park Service, Equal Justice Initiative, public records

export interface Landmark {
  id: string
  name: string
  lat: number
  lng: number
  year: number
  significance: string
  category: "civil-rights" | "historic" | "memorial"
}

export const MONTGOMERY_LANDMARKS: Landmark[] = [
  {
    id: "rosa-parks-museum",
    name: "Rosa Parks Museum",
    lat: 32.3769,
    lng: -86.3080,
    year: 2000,
    significance:
      "Located where Rosa Parks was arrested in 1955, sparking the Montgomery Bus Boycott.",
    category: "civil-rights",
  },
  {
    id: "dexter-ave-church",
    name: "Dexter Avenue King Memorial Baptist Church",
    lat: 32.3770,
    lng: -86.3010,
    year: 1877,
    significance:
      "Where Dr. Martin Luther King Jr. pastored and organized the Bus Boycott in 1955–1956.",
    category: "civil-rights",
  },
  {
    id: "freedom-rides-museum",
    name: "Freedom Rides Museum",
    lat: 32.3792,
    lng: -86.3110,
    year: 2011,
    significance:
      "Housed in the former Greyhound station where Freedom Riders were met with violence in 1961.",
    category: "civil-rights",
  },
  {
    id: "civil-rights-memorial",
    name: "Civil Rights Memorial Center",
    lat: 32.3769,
    lng: -86.3040,
    year: 1989,
    significance:
      "Designed by Maya Lin, honoring those who died during the Civil Rights Movement.",
    category: "memorial",
  },
  {
    id: "peace-justice-memorial",
    name: "National Memorial for Peace and Justice",
    lat: 32.3724,
    lng: -86.3065,
    year: 2018,
    significance:
      "The nation's first memorial dedicated to victims of lynching, created by the Equal Justice Initiative.",
    category: "memorial",
  },
  {
    id: "legacy-museum",
    name: "The Legacy Museum: From Enslavement to Mass Incarceration",
    lat: 32.3764,
    lng: -86.3103,
    year: 2018,
    significance:
      "Built on a site where enslaved people were warehoused, documenting the history of racial injustice.",
    category: "memorial",
  },
  {
    id: "holt-street-church",
    name: "Holt Street Baptist Church",
    lat: 32.3655,
    lng: -86.3002,
    year: 1908,
    significance:
      "Where the first mass meeting of the Bus Boycott was held on December 5, 1955.",
    category: "civil-rights",
  },
  {
    id: "state-capitol",
    name: "Alabama State Capitol",
    lat: 32.3771,
    lng: -86.2999,
    year: 1851,
    significance:
      "Endpoint of the 1965 Selma-to-Montgomery marches; where the Voting Rights Act was born.",
    category: "historic",
  },
  {
    id: "court-square-fountain",
    name: "Court Square Fountain",
    lat: 32.3779,
    lng: -86.3082,
    year: 1885,
    significance:
      "Historic gathering place near the site of Montgomery's slave market, now a Civil Rights landmark.",
    category: "historic",
  },
  {
    id: "first-white-house",
    name: "First White House of the Confederacy",
    lat: 32.3767,
    lng: -86.3004,
    year: 1835,
    significance:
      "The executive residence of Jefferson Davis in 1861, now a museum of Civil War history.",
    category: "historic",
  },
  {
    id: "greyhound-station",
    name: "Greyhound Bus Station (1961)",
    lat: 32.3793,
    lng: -86.3108,
    year: 1951,
    significance:
      "Where Freedom Riders arrived on May 20, 1961, facing violent opposition that drew national attention.",
    category: "civil-rights",
  },
  {
    id: "tuskegee-airmen-memorial",
    name: "Tuskegee Airmen Memorial",
    lat: 32.3831,
    lng: -86.3610,
    year: 1998,
    significance:
      "Honors the Tuskegee Airmen who trained at nearby airfields, breaking racial barriers in WWII aviation.",
    category: "memorial",
  },
  {
    id: "alabama-state-university",
    name: "Alabama State University",
    lat: 32.3647,
    lng: -86.2956,
    year: 1867,
    significance:
      "Founded for African Americans; students organized sit-ins at the State Capitol lunch counter in 1960.",
    category: "civil-rights",
  },
]
