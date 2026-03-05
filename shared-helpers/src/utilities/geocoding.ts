export interface ForwardGeocodeResult {
  latitude: number
  longitude: number
  street?: string
  city?: string
  state?: string
  zipCode?: string
  countryCode?: string
  country?: string
}

interface PhotonResponse {
  features?: PhotonFeature[]
}

interface PhotonFeature {
  properties?: PhotonFeatureProperties
  geometry?: {
    coordinates?: [number, number]
  }
}

interface PhotonFeatureProperties {
  name?: string
  street?: string
  housenumber?: string
  city?: string
  district?: string
  county?: string
  state?: string
  postcode?: string
  countrycode?: string
  country?: string
}

const US_STATE_NAME_TO_CODE: Record<string, string> = {
  ALABAMA: "AL",
  ALASKA: "AK",
  ARIZONA: "AZ",
  ARKANSAS: "AR",
  CALIFORNIA: "CA",
  COLORADO: "CO",
  CONNECTICUT: "CT",
  DELAWARE: "DE",
  FLORIDA: "FL",
  GEORGIA: "GA",
  HAWAII: "HI",
  IDAHO: "ID",
  ILLINOIS: "IL",
  INDIANA: "IN",
  IOWA: "IA",
  KANSAS: "KS",
  KENTUCKY: "KY",
  LOUISIANA: "LA",
  MAINE: "ME",
  MARYLAND: "MD",
  MASSACHUSETTS: "MA",
  MICHIGAN: "MI",
  MINNESOTA: "MN",
  MISSISSIPPI: "MS",
  MISSOURI: "MO",
  MONTANA: "MT",
  NEBRASKA: "NE",
  NEVADA: "NV",
  "NEW HAMPSHIRE": "NH",
  "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM",
  "NEW YORK": "NY",
  "NORTH CAROLINA": "NC",
  "NORTH DAKOTA": "ND",
  OHIO: "OH",
  OKLAHOMA: "OK",
  OREGON: "OR",
  PENNSYLVANIA: "PA",
  "RHODE ISLAND": "RI",
  "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD",
  TENNESSEE: "TN",
  TEXAS: "TX",
  UTAH: "UT",
  VERMONT: "VT",
  VIRGINIA: "VA",
  WASHINGTON: "WA",
  "WEST VIRGINIA": "WV",
  WISCONSIN: "WI",
  WYOMING: "WY",
  "DISTRICT OF COLUMBIA": "DC",
}

const CANADA_PROVINCE_NAME_TO_CODE: Record<string, string> = {
  ALBERTA: "AB",
  "BRITISH COLUMBIA": "BC",
  MANITOBA: "MB",
  "NEW BRUNSWICK": "NB",
  "NEWFOUNDLAND AND LABRADOR": "NL",
  "NORTHWEST TERRITORIES": "NT",
  "NOVA SCOTIA": "NS",
  NUNAVUT: "NU",
  ONTARIO: "ON",
  "PRINCE EDWARD ISLAND": "PE",
  QUEBEC: "QC",
  SASKATCHEWAN: "SK",
  YUKON: "YT",
}

const getStreet = (properties?: PhotonFeatureProperties) => {
  if (!properties) {
    return undefined
  }

  if (properties.housenumber && properties.street) {
    return `${properties.housenumber} ${properties.street}`
  }

  return properties.name || properties.street
}

const getCity = (properties?: PhotonFeatureProperties) => {
  if (!properties) {
    return undefined
  }

  return properties.city || properties.district || properties.county
}

const normalizeCountryCode = (countryCode?: string) => {
  if (!countryCode) {
    return undefined
  }

  return countryCode.toUpperCase()
}

const normalizeState = (state?: string, countryCode?: string) => {
  if (!state) {
    return undefined
  }

  const trimmedState = state.trim()
  if (!trimmedState) {
    return undefined
  }

  if (/^[A-Za-z]{2}$/.test(trimmedState)) {
    return trimmedState.toUpperCase()
  }

  const normalizedStateName = trimmedState.replace(/\./g, "").replace(/\s+/g, " ").toUpperCase()
  const normalizedCountryCode = countryCode?.toUpperCase()

  if (
    normalizedCountryCode === "US" ||
    (!normalizedCountryCode && US_STATE_NAME_TO_CODE[normalizedStateName])
  ) {
    return US_STATE_NAME_TO_CODE[normalizedStateName] ?? trimmedState
  }

  if (
    normalizedCountryCode === "CA" ||
    (!normalizedCountryCode && CANADA_PROVINCE_NAME_TO_CODE[normalizedStateName])
  ) {
    return CANADA_PROVINCE_NAME_TO_CODE[normalizedStateName] ?? trimmedState
  }

  return trimmedState
}

export const forwardGeocode = async (query: string): Promise<ForwardGeocodeResult | null> => {
  if (!query?.trim()) {
    return null
  }

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
    )

    if (!response.ok) {
      console.error(`Error calling Photon API: ${response.status} ${response.statusText}`)
      return null
    }

    const body = (await response.json()) as PhotonResponse
    const topResult = body.features?.[0]
    const coordinates = topResult?.geometry?.coordinates

    if (!coordinates || coordinates.length < 2) {
      return null
    }

    const [longitude, latitude] = coordinates

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null
    }

    const countryCode = normalizeCountryCode(topResult.properties?.countrycode)

    return {
      latitude,
      longitude,
      street: getStreet(topResult.properties),
      city: getCity(topResult.properties),
      state: normalizeState(topResult.properties?.state, countryCode),
      zipCode: topResult.properties?.postcode,
      countryCode,
      country: topResult.properties?.country,
    }
  } catch (error) {
    console.error(`Error calling Photon API: ${error}`)
    return null
  }
}
