/**
 * Transport selection for a plan.
 * The API marks one transport as selected per plan and clears others.
 */
import { prisma } from "@/prisma/prisma";

/** Marks the given transport as selected for the plan; clears others. Returns true if successful. */
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
    where: { id: transportId, location: { planId } },
  });
  if (!transport) return false;

  await prisma.$transaction([
    prisma.transport.updateMany({
      where: { location: { planId } },
      data: { isSelected: false },
    }),
    prisma.transport.update({
      where: { id: transportId },
      data: { isSelected: true },
    }),
  ]);
  return true;
}
