// Common Prisma error codes
const PRISMA_ERRORS = {
  NOT_FOUND: "P2025",
  UNIQUE_CONSTRAINT: "P2002",
  FOREIGN_KEY: "P2003",
} as const;

// Common include patterns
export const PLAN_SELECT = { id: true, title: true, userId: true } as const;

export const LOCATION_SELECT_BASIC = {
  id: true,
  name: true,
  city: true,
  country: true,
} as const;

export const LOCATION_SELECT_FULL = {
  ...LOCATION_SELECT_BASIC,
  latitude: true,
  longitude: true,
} as const;

// Helper to handle Prisma errors
export function handlePrismaError(error: any, notFoundMessage: string): never {
  if (error.code === PRISMA_ERRORS.NOT_FOUND) {
    throw new Error(notFoundMessage);
  }
  if (error.code === PRISMA_ERRORS.UNIQUE_CONSTRAINT) {
    throw new Error("Resource already exists");
  }
  if (error.code === PRISMA_ERRORS.FOREIGN_KEY) {
    throw new Error("Referenced resource not found");
  }
  throw error;
}

// Helper to filter undefined values from update data
export function filterUndefined<T extends Record<string, any>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

// Helper to validate location belongs to plan
export async function validateLocationPlan(
  locationId: string,
  planId: string
): Promise<void> {
  const { prisma } = await import("@/prisma/prisma");
  const location = await prisma.location.findUnique({ where: { id: locationId } });
  
  if (!location || location.planId !== planId) {
    throw new Error("Location does not belong to the specified plan");
  }
}
