/**
 * Activity listing and selection for a location.
 * The API lists activities by location, creates new ones, and marks selected activities per plan.
 */
import { prisma } from "@/prisma/prisma";

export interface ActivityListItem {
  id: string;
  travelPlanId: string;
  locationId: string;
  activityName: string;
  activityCoordinates: { latitude: number; longitude: number };
  reason: string;
  priceEstimate: number;
}

/** Returns activities for a location, ordered by creation date. */
export async function listActivitiesByLocation(
  locationId: string
): Promise<ActivityListItem[]> {
  const activities = await prisma.activity.findMany({
    where: { locationId },
    orderBy: { createdAt: "desc" },
    include: {
      location: {
        select: { planId: true, latitude: true, longitude: true },
      },
    },
  });
  return activities.map((a) => ({
    id: a.id,
    travelPlanId: a.location.planId,
    locationId: a.locationId,
    activityName: a.name,
    activityCoordinates: {
      latitude: a.location.latitude ?? 0,
      longitude: a.location.longitude ?? 0,
    },
    reason: a.reason ?? "",
    priceEstimate: a.price ?? 0,
  }));
}

/** Creates an activity for a location and returns its id. */
export async function createActivity(
  locationId: string,
  activityName: string,
  reason: string,
  priceEstimate: number,
  imageUrl: string
): Promise<string> {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true, planId: true },
  });
  if (!location) {
    throw new Error("The location wasn't found.");
  }
  const activity = await prisma.activity.create({
    data: {
      location: { connect: { id: locationId } },
      name: activityName,
      reason,
      imageUrl: imageUrl,
      price: priceEstimate,
      isSelected: false,
    },
  });
  return activity.id;
}

/** Marks the given activities as selected for the plan. Returns true if all ids exist for the plan. */
export async function selectActivities(
  planId: string,
  activityIds: string[],
  userId: string | null
): Promise<boolean> {
  if (userId !== null) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return false;
  }
  const count = await prisma.activity.count({
    where: { id: { in: activityIds }, location: { planId } },
  });
  if (count !== activityIds.length) return false;

  await prisma.activity.updateMany({
    where: { id: { in: activityIds }, location: { planId } },
    data: { isSelected: true },
  });
  return true;
}
