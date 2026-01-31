/**
 * MCP travel tools store backed by Prisma.
 * Activities and accommodations are persisted; clarifying questions remain in-memory (no DB model).
 */

import { prisma } from "@/prisma/prisma";
import { validateLocationPlan } from "./services/utils";

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
  travelPlanId: string;
  question: string;
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
  async listActivityCandidates(travelPlanId: string): Promise<ActivityCandidate[]> {
    const activities = await prisma.activity.findMany({
      where: { planId: travelPlanId },
      orderBy: { createdAt: "desc" },
      include: { location: { select: { latitude: true, longitude: true } } },
    });
    return activities.map((a) => ({
      id: a.id,
      travelPlanId: a.planId,
      locationId: a.locationId,
      activityName: a.name,
      activityCoordinates: coordsFromLocation(a.location),
      reason: a.reason,
      priceEstimate: a.price ?? 0,
    }));
  },

  async addActivityCandidate(
    travelPlanId: string,
    locationId: string,
    activityName: string,
    _activityCoordinates: Coordinates,
    reason: string,
    priceEstimate: number
  ): Promise<string> {
    await validateLocationPlan(locationId, travelPlanId);
    const activity = await prisma.activity.create({
      data: {
        planId: travelPlanId,
        locationId,
        name: activityName,
        reason,
        price: priceEstimate,
        isSelected: false,
      },
    });
    return activity.id;
  },

  async listAccommodationCandidates(travelPlanId: string): Promise<AccommodationCandidate[]> {
    const accommodations = await prisma.accommodation.findMany({
      where: { planId: travelPlanId },
      orderBy: { createdAt: "desc" },
      include: { location: { select: { latitude: true, longitude: true } } },
    });
    return accommodations.map((a) => ({
      id: a.id,
      travelPlanId: a.planId,
      locationId: a.locationId,
      accommodationName: a.name,
      accommodationType: a.type ?? "",
      accommodationCoordinates: coordsFromLocation(a.location),
      reason: a.description ?? "",
      priceEstimatePerNight: a.price ?? 0,
    }));
  },

  async addAccommodationCandidate(
    travelPlanId: string,
    locationId: string,
    accommodationName: string,
    accommodationType: string,
    _accommodationCoordinates: Coordinates,
    reason: string,
    priceEstimatePerNight: number
  ): Promise<string> {
    await validateLocationPlan(locationId, travelPlanId);
    const accommodation = await prisma.accommodation.create({
      data: {
        planId: travelPlanId,
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

  addClarifyingQuestion(travelPlanId: string, question: string): string {
    const id = nextId();
    clarifyingQuestions.push({ id, travelPlanId, question });
    return id;
  },
};
