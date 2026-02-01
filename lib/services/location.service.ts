/**
 * Location CRUD and selection for a plan.
 * The API creates locations, marks one as selected per plan, and fetches by id.
 */
import { prisma } from "@/prisma/prisma";

/** Returns the location id if it exists. */
export async function getLocationById(
  locationId: string
): Promise<{ id: string } | null> {
  return prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true },
  });
}

/** Creates a location for a plan and returns its id. */
export async function createLocation(params: {
  planId: string;
  name: string;
  country: string;
  city?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
  description?: string | null;
  reason: string;
  imageUrl: string;
}): Promise<string> {
  const {
    planId,
    name,
    country,
    city,
    coordinates,
    description,
    reason,
    imageUrl,
  } = params;
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { id: true },
  });
  if (!plan) {
    throw new Error("The plan wasn't found.");
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
      reason: reason,
      imageUrl: imageUrl,
      isSelected: false,
    },
  });
  return location.id;
}

/** Marks the given location as selected for the plan; clears others. Returns true if successful. */
export async function selectLocation(
  planId: string,
  locationId: string,
  userId: string | null
): Promise<boolean> {
  if (userId !== null) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return false;
  }
  const location = await prisma.location.findFirst({
    where: { id: locationId, planId },
  });
  if (!location) return false;

  await prisma.$transaction([
    prisma.location.updateMany({
      where: { planId },
      data: { isSelected: false },
    }),
    prisma.location.update({
      where: { id: locationId },
      data: { isSelected: true },
    }),
  ]);
  return true;
}
