import { prisma } from "@/prisma/prisma";

export async function selectTransport(
  planId: string,
  transportId: string
): Promise<boolean> {
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
