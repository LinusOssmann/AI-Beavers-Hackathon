import { prisma } from "@/prisma/prisma";

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
