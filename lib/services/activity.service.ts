import { prisma } from "@/prisma/prisma";

export async function selectActivities(
  planId: string,
  activityIds: string[]
): Promise<boolean> {
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
