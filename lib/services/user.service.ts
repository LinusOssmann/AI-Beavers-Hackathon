/**
 * User context and preferences.
 * The API updates the user's context data (e.g. onboarding Q&A) stored on the user record.
 */
import { prisma } from "@/prisma/prisma";

interface ContextDataItem {
  question: string;
  answer: string;
}

/** Merges the given Q&A pairs into the user's context data. Returns false if the user is not found. */
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
      // @ts-expect-error - This should be fixed.
      contextData: { ...contextData, data },
      contextUpdatedAt: new Date(),
    },
  });
  return true;
}
