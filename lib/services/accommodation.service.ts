/**
 * Accommodation listing and selection for a location.
 * The API lists accommodations by location, creates new ones, and marks one as selected per plan.
 */
import { prisma } from "@/prisma/prisma";

export interface AccommodationListItem {
  id: string;
  travelPlanId: string;
  locationId: string;
  accommodationName: string;
  accommodationType: string;
  accommodationCoordinates: { latitude: number; longitude: number };
  reason: string;
  priceEstimatePerNight: number;
}

/** Returns accommodations for a location, ordered by creation date. */
export async function listAccommodationsByLocation(
  locationId: string
): Promise<AccommodationListItem[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: { locationId },
    orderBy: { createdAt: "desc" },
    include: {
      location: {
        select: { planId: true, latitude: true, longitude: true },
      },
    },
  });
  return accommodations.map((a) => ({
    id: a.id,
    travelPlanId: a.location.planId,
    locationId: a.locationId,
    accommodationName: a.name,
    accommodationType: a.type ?? "",
    accommodationCoordinates: {
      latitude: a.location.latitude ?? 0,
      longitude: a.location.longitude ?? 0,
    },
    reason: a.reason ?? "",
    priceEstimatePerNight: a.price ?? 0,
  }));
}

/** Creates an accommodation for a location and returns its id. */
export async function createAccommodation(
  locationId: string,
  accommodationName: string,
  accommodationType: string,
  reason: string,
  priceEstimatePerNight: number,
  imageUrl: string
): Promise<string> {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true, planId: true },
  });
  if (!location) {
    throw new Error("The location wasn't found.");
  }
  const accommodation = await prisma.accommodation.create({
    data: {
      location: { connect: { id: locationId } },
      name: accommodationName,
      type: accommodationType,
      reason: reason,
      imageUrl: imageUrl,
      price: priceEstimatePerNight,
      isSelected: false,
    },
  });
  return accommodation.id;
}

/** Marks the given accommodation as selected for the plan; clears others. Returns true if successful. */
export async function selectAccommodation(
  planId: string,
  accommodationId: string,
  userId: string | null
): Promise<boolean> {
  if (userId !== null) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return false;
  }
  const accommodation = await prisma.accommodation.findFirst({
    where: { id: accommodationId, location: { planId } },
  });
  if (!accommodation) return false;

  await prisma.$transaction([
    prisma.accommodation.updateMany({
      where: { location: { planId } },
      data: { isSelected: false },
    }),
    prisma.accommodation.update({
      where: { id: accommodationId },
      data: { isSelected: true },
    }),
  ]);
  return true;
}
