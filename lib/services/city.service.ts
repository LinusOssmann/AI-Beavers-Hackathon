/**
 * City search via GeoDB (RapidAPI).
 * Caches results in memory for 5 minutes and exposes a React-cached search for RSC.
 */
import { cache } from "react"
import type { City, GeoCityResponse } from "@/types/city"

const GEODB_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities"
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ""

// Cache city search results for 5 minutes
const citySearchCache = new Map<string, { data: City[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

function getCacheKey(query: string, limit: number): string {
  return `${query.toLowerCase()}-${limit}`
}

function getCachedResult(query: string, limit: number): City[] | null {
  const key = getCacheKey(query, limit)
  const cached = citySearchCache.get(key)
  
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL
  if (isExpired) {
    citySearchCache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedResult(query: string, limit: number, data: City[]): void {
  const key = getCacheKey(query, limit)
  citySearchCache.set(key, { data, timestamp: Date.now() })
  
  // Clean up old cache entries (keep max 100 entries)
  if (citySearchCache.size > 100) {
    const firstKey = citySearchCache.keys().next().value
    if (firstKey) citySearchCache.delete(firstKey)
  }
}

/** Fetches cities from GeoDB by name prefix; uses cache when available. */
export async function searchCitiesAPI(
  query: string,
  limit: number = 10
): Promise<City[]> {
  // Validate query
  if (!query || query.length < 2) {
    return []
  }

  // Check cache first
  const cached = getCachedResult(query, limit)
  if (cached) {
    return cached
  }

  // Check if API key is configured
  if (!RAPIDAPI_KEY) {
    console.warn("RAPIDAPI_KEY not configured, returning empty results")
    return []
  }

  try {
    const url = new URL(GEODB_API_URL)
    url.searchParams.set("namePrefix", query)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("minPopulation", "50000") // Filter to cities with decent size
    url.searchParams.set("sort", "-population") // Largest cities first

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes at Next.js level too
    })

    if (!response.ok) {
      console.error(`GeoDB API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data: GeoCityResponse = await response.json()
    
    // Transform to our City format
    const cities: City[] = data.data.map((item) => ({
      name: item.city,
      country: item.country,
    }))

    // Cache the results
    setCachedResult(query, limit, cities)

    return cities
  } catch (error) {
    console.error("Error fetching cities from GeoDB:", error)
    return []
  }
}

/** React Server Component cached version of searchCitiesAPI. */
export const searchCities = cache(searchCitiesAPI)

/** Returns a display string like "City, Country". */
export function formatCityName(city: City): string {
  return `${city.name}, ${city.country}`
}

/** Maps cities to display strings for dropdown options. */
export function formatCitiesForDropdown(cities: City[]): string[] {
  return cities.map(formatCityName)
}
