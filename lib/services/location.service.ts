import { prisma } from "@/prisma/prisma";

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
