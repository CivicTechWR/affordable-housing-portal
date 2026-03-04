export interface ForwardGeocodeResult {
  latitude: number
  longitude: number
}

interface PhotonResponse {
  features?: {
    geometry?: {
      coordinates?: [number, number]
    }
  }[]
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
    const coordinates = body.features?.[0]?.geometry?.coordinates

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
    }
  } catch (error) {
    console.error(`Error calling Photon API: ${error}`)
    return null
  }
}
