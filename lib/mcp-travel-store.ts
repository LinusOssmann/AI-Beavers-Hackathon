/**
 * MCP travel tools store backed by Prisma.
 * Activities and accommodations are persisted; clarifying questions remain in-memory (no DB model).
 */

import { prisma } from "@/prisma/prisma";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ActivityCandidate {
  id: string;
  travelPlanId: string;
  locationId: string;
  activityName: string;
  activityCoordinates: Coordinates;
  reason: string;
  priceEstimate: number;
}

export interface AccommodationCandidate {
  id: string;
  travelPlanId: string;
  locationId: string;
  accommodationName: string;
  accommodationType: string;
  accommodationCoordinates: Coordinates;
  reason: string;
  priceEstimatePerNight: number;
}

export interface ClarifyingQuestion {
  id: string;
  locationId: string;
  question: string;
}

export interface Destination {
  id: string;
  planId: string;
  name: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

const clarifyingQuestions: ClarifyingQuestion[] = [];

function nextId(): string {
  return crypto.randomUUID();
}

function coordsFromLocation(loc: { latitude: number | null; longitude: number | null } | null): Coordinates {
  if (!loc || loc.latitude == null || loc.longitude == null) {
    return { latitude: 0, longitude: 0 };
  }
  return { latitude: loc.latitude, longitude: loc.longitude };
}

export const travelStore = {
  async listActivityCandidates(locationId: string): Promise<ActivityCandidate[]> {
    const activities = await prisma.activity.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
      include: { 
        location: { 
          select: { 
            latitude: true, 
            longitude: true,
            planId: true 
          } 
        } 
      },
    });
    return activities.map((a) => ({
      id: a.id,
      travelPlanId: a.location.planId,
      locationId: a.locationId,
      activityName: a.name,
      activityCoordinates: coordsFromLocation(a.location),
      reason: a.reason,
      priceEstimate: a.price ?? 0,
    }));
  },

  async addActivityCandidate(
    locationId: string,
    activityName: string,
    _activityCoordinates: Coordinates,
    reason: string,
    priceEstimate: number
  ): Promise<string> {
    // Validate location exists
    const location = await prisma.location.findUnique({ 
      where: { id: locationId },
      select: { id: true }
    });
    if (!location) {
      throw new Error("Location not found");
    }
    
    const activity = await prisma.activity.create({
      data: {
        locationId,
        name: activityName,
        reason,
        price: priceEstimate,
        isSelected: false,
      },
    });
    return activity.id;
  },

  async listAccommodationCandidates(locationId: string): Promise<AccommodationCandidate[]> {
    const accommodations = await prisma.accommodation.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
      include: { 
        location: { 
          select: { 
            latitude: true, 
            longitude: true,
            planId: true 
          } 
        } 
      },
    });
    return accommodations.map((a) => ({
      id: a.id,
      travelPlanId: a.location.planId,
      locationId: a.locationId,
      accommodationName: a.name,
      accommodationType: a.type ?? "",
      accommodationCoordinates: coordsFromLocation(a.location),
      reason: a.description ?? "",
      priceEstimatePerNight: a.price ?? 0,
    }));
  },

  async addAccommodationCandidate(
    locationId: string,
    accommodationName: string,
    accommodationType: string,
    _accommodationCoordinates: Coordinates,
    reason: string,
    priceEstimatePerNight: number
  ): Promise<string> {
    // Validate location exists
    const location = await prisma.location.findUnique({ 
      where: { id: locationId },
      select: { id: true }
    });
    if (!location) {
      throw new Error("Location not found");
    }
    
    const accommodation = await prisma.accommodation.create({
      data: {
        locationId,
        name: accommodationName,
        type: accommodationType,
        description: reason,
        price: priceEstimatePerNight,
        isSelected: false,
      },
    });
    return accommodation.id;
  },

  addClarifyingQuestion(locationId: string, question: string): string {
    const id = nextId();
    clarifyingQuestions.push({ id, locationId, question });
    return id;
  },

  async addDestination(
    planId: string,
    name: string,
    country: string,
    city?: string,
    coordinates?: Coordinates,
    description?: string
  ): Promise<string> {
    // Validate plan exists
    const plan = await prisma.plan.findUnique({ 
      where: { id: planId },
      select: { id: true }
    });
    if (!plan) {
      throw new Error("Plan not found");
    }
    
    const location = await prisma.location.create({
      data: {
        planId,
        name,
        country,
        city: city ?? null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        description: description ?? null,
        isSelected: false,
      },
    });
    return location.id;
  },
};
