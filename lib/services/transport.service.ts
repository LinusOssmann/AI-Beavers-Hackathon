import { prisma } from "@/prisma/prisma";
import {
  PLAN_SELECT,
  LOCATION_SELECT_BASIC,
  LOCATION_SELECT_FULL,
  filterUndefined,
  handlePrismaError,
  validateLocationPlan,
} from "./utils";

interface GetTransportsParams {
  planId?: string;
  locationId?: string;
  isSelected?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

interface CreateTransportData {
  locationId: string;
  planId: string;
  type: string;
  name?: string | null;
  from?: string | null;
  to?: string | null;
  price?: number | null;
  departure?: Date | null;
  arrival?: Date | null;
  description?: string | null;
  isSelected?: boolean;
}

interface UpdateTransportData {
  type?: string;
  name?: string | null;
  from?: string | null;
  to?: string | null;
  price?: number | null;
  departure?: Date | null;
  arrival?: Date | null;
  description?: string | null;
  isSelected?: boolean;
  locationId?: string;
  planId?: string;
}

export class TransportService {
  static async getTransports(params: GetTransportsParams) {
    const { planId, locationId, isSelected, type, limit, offset } = params;

    const where: Record<string, any> = {};
    if (planId) where.planId = planId;
    if (locationId) where.locationId = locationId;
    if (isSelected !== undefined) where.isSelected = isSelected;
    if (type) where.type = { contains: type, mode: "insensitive" };

    const [transports, total] = await Promise.all([
      prisma.transport.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          plan: { select: PLAN_SELECT },
          location: { select: LOCATION_SELECT_BASIC },
        },
      }),
      prisma.transport.count({ where }),
    ]);

    return { transports, total };
  }

  static async getTransportById(id: string) {
    const transport = await prisma.transport.findUnique({
      where: { id },
      include: {
        plan: { select: PLAN_SELECT },
        location: { select: LOCATION_SELECT_FULL },
      },
    });

    if (!transport) throw new Error("Transport not found");
    return transport;
  }

  static async createTransport(data: CreateTransportData) {
    try {
      await validateLocationPlan(data.locationId, data.planId);

      if (data.isSelected) {
        await prisma.transport.updateMany({
          where: { planId: data.planId, isSelected: true },
          data: { isSelected: false },
        });
      }

      return await prisma.transport.create({
        data: {
          locationId: data.locationId,
          planId: data.planId,
          type: data.type,
          name: data.name ?? null,
          from: data.from ?? null,
          to: data.to ?? null,
          price: data.price ?? null,
          departure: data.departure ?? null,
          arrival: data.arrival ?? null,
          description: data.description ?? null,
          isSelected: data.isSelected ?? false,
        },
        include: {
          plan: { select: PLAN_SELECT },
          location: { select: LOCATION_SELECT_BASIC },
        },
      });
    } catch (error: any) {
      if (error.message === "Location does not belong to the specified plan") {
        throw error;
      }
      handlePrismaError(error, "Plan or location not found");
    }
  }

  static async updateTransport(id: string, data: UpdateTransportData) {
    try {
      const existing = await prisma.transport.findUnique({ where: { id } });
      if (!existing) throw new Error("Transport not found");

      if (data.locationId || data.planId) {
        await validateLocationPlan(
          data.locationId ?? existing.locationId,
          data.planId ?? existing.planId
        );
      }

      if (data.isSelected && !existing.isSelected) {
        await prisma.transport.updateMany({
          where: {
            planId: data.planId ?? existing.planId,
            isSelected: true,
            id: { not: id },
          },
          data: { isSelected: false },
        });
      }

      return await prisma.transport.update({
        where: { id },
        data: filterUndefined(data),
        include: {
          plan: { select: PLAN_SELECT },
          location: { select: LOCATION_SELECT_BASIC },
        },
      });
    } catch (error: any) {
      if (
        error.message === "Location does not belong to the specified plan" ||
        error.message === "Transport not found"
      ) {
        throw error;
      }
      handlePrismaError(error, "Transport not found");
    }
  }

  static async deleteTransport(id: string) {
    try {
      await prisma.transport.delete({ where: { id } });
    } catch (error: any) {
      handlePrismaError(error, "Transport not found");
    }
  }
}
