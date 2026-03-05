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

    return {
      latitude,
      longitude,
      street: getStreet(topResult.properties),
      city: getCity(topResult.properties),
      state: topResult.properties?.state,
      zipCode: topResult.properties?.postcode,
      countryCode: normalizeCountryCode(topResult.properties?.countrycode),
      country: topResult.properties?.country,
    }
  } catch (error) {
    console.error(`Error calling Photon API: ${error}`)
    return null
  }
}
