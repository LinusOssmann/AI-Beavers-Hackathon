import { NextRequest, NextResponse } from "next/server"
import { searchCitiesAPI } from "@/lib/services/city.service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.url ? new URL(request.url) : { searchParams: new URLSearchParams() }
    const query = searchParams.get("q")
    const limitParam = searchParams.get("limit")
    
    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      )
    }

    // Validate minimum query length
    if (query.length < 2) {
      return NextResponse.json(
        { cities: [] },
        { status: 200 }
      )
    }

    // Parse and validate limit
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 20) : 10

    // Search cities
    const cities = await searchCitiesAPI(query, limit)

    return NextResponse.json(
      { cities },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("Error in /api/cities/search:", error)
    return NextResponse.json(
      { error: "Failed to search cities", cities: [] },
      { status: 500 }
    )
  }
}
