import { prisma } from "@/prisma/prisma";

export async function selectTransport(
  planId: string,
  transportId: string,
  userId: string | null
): Promise<boolean> {
  if (userId !== null) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
    });
    if (!plan) return false;
  }
  const transport = await prisma.transport.findFirst({
    where: { id: transportId, planId },
  });
  if (!transport) return false;

  await prisma.$transaction([
    prisma.transport.updateMany({
      where: { planId },
      data: { isSelected: false },
    }),
    prisma.transport.update({
      where: { id: transportId },
      data: { isSelected: true },
    }),
  ]);
  return true;
}
