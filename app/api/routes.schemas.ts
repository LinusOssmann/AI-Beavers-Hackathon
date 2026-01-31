import { z } from "zod";

/** POST /api/users/data */
export const dataPayloadSchema = z.object({
  userId: z.string().min(1),
  data: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

/** POST /api/plans */
export const createPlanSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
});

/** POST /api/plans/[planId]/select/location */
export const selectLocationSchema = z.object({
  locationId: z.string().min(1),
});

/** POST /api/plans/[planId]/select/transport */
export const selectTransportSchema = z.object({
  transportId: z.string().min(1),
});

/** POST /api/plans/[planId]/select/accommodation */
export const selectAccommodationSchema = z.object({
  accommodationId: z.string().min(1),
});

/** POST /api/plans/[planId]/select/activities */
export const selectActivitiesSchema = z.object({
  activityIds: z.array(z.string().min(1)).min(1),
});
