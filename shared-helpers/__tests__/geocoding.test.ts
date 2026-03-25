import { forwardGeocode } from "../src/utilities/geocoding"

describe("forwardGeocode", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it("returns normalized coordinates and address fields from photon response", async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [-122.40273, 37.79516] },
              properties: {
                street: "Montgomery Street",
                housenumber: "600",
                city: "San Francisco",
                state: "California",
                postcode: "94111",
                countrycode: "us",
                country: "United States",
              },
            },
          ],
        }),
    } as Response)
    global.fetch = mockFetch

    const result = await forwardGeocode("600 Montgomery St, San Francisco, CA 94111")

    expect(result).toEqual({
      latitude: 37.79516,
      longitude: -122.40273,
      street: "600 Montgomery Street",
      city: "San Francisco",
      state: "California",
      zipCode: "94111",
      countryCode: "US",
      country: "United States",
    })
  })

  it("falls back to name when street/housenumber are not available", async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [-113.9839888, 48.5036734] },
              properties: {
                name: "Grinnell Drive",
                city: "West Glacier",
                state: "Montana",
                postcode: "59936",
              },
            },
          ],
        }),
    } as Response)
    global.fetch = mockFetch

    const result = await forwardGeocode("64 Grinnell Dr, West Glacier, MT 59936")

    expect(result).toEqual({
      latitude: 48.5036734,
      longitude: -113.9839888,
      street: "Grinnell Drive",
      city: "West Glacier",
      state: "Montana",
      zipCode: "59936",
      countryCode: undefined,
      country: undefined,
    })
  })

  it("prefers street over name when housenumber is missing", async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [-77.0365, 38.8977] },
              properties: {
                name: "The White House",
                street: "Pennsylvania Ave NW",
                city: "Washington",
                state: "District of Columbia",
                postcode: "20500",
              },
            },
          ],
        }),
    } as Response)
    global.fetch = mockFetch

    const result = await forwardGeocode("1600 Pennsylvania Ave, Washington, DC 20500")

    expect(result).toEqual({
      latitude: 38.8977,
      longitude: -77.0365,
      street: "Pennsylvania Ave NW",
      city: "Washington",
      state: "District of Columbia",
      zipCode: "20500",
      countryCode: undefined,
      country: undefined,
    })
  })

  it("normalizes Canadian province names when country code is Canada", async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [-80.5204, 43.4643] },
              properties: {
                street: "King Street North",
                housenumber: "200",
                city: "Waterloo",
                state: "Ontario",
                postcode: "N2J 2Y8",
                countrycode: "ca",
                country: "Canada",
              },
            },
          ],
        }),
    } as Response)
    global.fetch = mockFetch

    const result = await forwardGeocode("200 King St N, Waterloo, ON N2J 2Y8")

    expect(result).toEqual({
      latitude: 43.4643,
      longitude: -80.5204,
      street: "200 King Street North",
      city: "Waterloo",
      state: "ON",
      zipCode: "N2J 2Y8",
      countryCode: "CA",
      country: "Canada",
    })
  })

  it("throws when no geocode feature is returned", async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    } as Response)
    global.fetch = mockFetch

    await expect(forwardGeocode("not a real address")).rejects.toThrow("No coordinates found")
  })
})
