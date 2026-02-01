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
