/**
 * Types for city search (GeoDB / RapidAPI).
 * City is the app shape; GeoCityResponse is the raw API response.
 */
export interface City {
  name: string
  country: string
}

export interface GeoCityResponse {
  data: Array<{
    id: number
    city: string
    country: string
    countryCode: string
    region?: string
  }>
  metadata?: {
    currentOffset: number
    totalCount: number
  }
}
