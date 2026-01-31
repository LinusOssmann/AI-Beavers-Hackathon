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

export async function createActivity(
  locationId: string,
  activityName: string,
  reason: string,
  priceEstimate: number
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
      plan: { connect: { id: location.planId } },
      location: { connect: { id: locationId } },
      name: activityName,
      reason,
      price: priceEstimate,
      isSelected: false,
    },
  });
  return activity.id;
}

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
    where: { id: { in: activityIds }, planId },
  });
  if (count !== activityIds.length) return false;

  await prisma.activity.updateMany({
    where: { id: { in: activityIds }, planId },
    data: { isSelected: true },
  });
  return true;
}
