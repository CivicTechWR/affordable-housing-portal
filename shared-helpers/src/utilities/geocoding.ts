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

  return properties.street || properties.name
}

const getCity = (properties?: PhotonFeatureProperties) => {
  if (!properties) {
    return undefined
  }

  return properties.city || properties.district
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
    normalizedCountryCode === "CA" ||
    (!normalizedCountryCode && CANADA_PROVINCE_NAME_TO_CODE[normalizedStateName])
  ) {
    return CANADA_PROVINCE_NAME_TO_CODE[normalizedStateName] ?? trimmedState
  }

  return trimmedState
}

export const forwardGeocode = async (query: string): Promise<ForwardGeocodeResult> => {
  if (!query?.trim()) {
    throw new Error("Query cannot be empty")
  }

  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
  )

  if (!response.ok) {
    throw new Error(`Error calling Photon API: ${response.status} ${response.statusText}`)
  }

  const body = (await response.json()) as PhotonResponse
  const topResult = body.features?.[0]
  const coordinates = topResult?.geometry?.coordinates

  if (!coordinates || coordinates.length < 2) {
    throw new Error("No coordinates found")
  }

  const [longitude, latitude] = coordinates

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates")
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
}
