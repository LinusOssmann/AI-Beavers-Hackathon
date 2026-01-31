import { prisma } from "@/prisma/prisma";

export async function getLocationById(
  locationId: string
): Promise<{ id: string } | null> {
  return prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true },
  });
}

export async function createLocation(
  planId: string,
  name: string,
  country: string,
  city?: string | null,
  coordinates?: { latitude: number; longitude: number } | null,
  description?: string | null
): Promise<string> {
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
      isSelected: false,
    },
  });
  return location.id;
}

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
