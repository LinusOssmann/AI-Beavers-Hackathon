import { prisma } from "@/prisma/prisma";

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
    where: { id: accommodationId, planId },
  });
  if (!accommodation) return false;

  await prisma.$transaction([
    prisma.accommodation.updateMany({
      where: { planId },
      data: { isSelected: false },
    }),
    prisma.accommodation.update({
      where: { id: accommodationId },
      data: { isSelected: true },
    }),
  ]);
  return true;
}
