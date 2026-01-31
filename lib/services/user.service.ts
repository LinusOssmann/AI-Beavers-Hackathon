import { prisma } from "@/prisma/prisma";

interface ContextDataItem {
  question: string;
  answer: string;
}

export async function updateUserContextData(
  userId: string,
  data: ContextDataItem[]
): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { contextData: true },
  });
  if (!existing) return false;

  const contextData = (existing.contextData as Record<string, unknown>) ?? {};
  await prisma.user.update({
    where: { id: userId },
    data: {
      contextData: { ...contextData, data },
      contextUpdatedAt: new Date(),
    },
  });
  return true;
}
