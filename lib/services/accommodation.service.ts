import { prisma } from "@/prisma/prisma";
import {
	PLAN_SELECT,
	LOCATION_SELECT_BASIC,
	LOCATION_SELECT_FULL,
	filterUndefined,
	handlePrismaError,
	validateLocationPlan,
} from "./utils";

interface GetAccommodationsParams {
	userId?: string | null; // null/undefined = system access, string = user access
	planId?: string;
	locationId?: string;
	isSelected?: boolean;
	type?: string;
	limit?: number;
	offset?: number;
}

interface CreateAccommodationData {
	locationId: string;
	planId: string;
	name: string;
	type?: string | null;
	address?: string | null;
	price?: number | null;
	rating?: number | null;
	description?: string | null;
	checkIn?: Date | null;
	checkOut?: Date | null;
	isSelected?: boolean;
}

interface UpdateAccommodationData {
	name?: string;
	type?: string | null;
	address?: string | null;
	price?: number | null;
	rating?: number | null;
	description?: string | null;
	checkIn?: Date | null;
	checkOut?: Date | null;
	isSelected?: boolean;
	locationId?: string;
	planId?: string;
}

export class AccommodationService {
	static async getAccommodations(params: GetAccommodationsParams) {
		const { userId, planId, locationId, isSelected, type, limit, offset } =
			params;

		const where: Record<string, any> = {};

		// If userId provided (not null), enforce ownership via plan relationship
		if (userId !== null && userId !== undefined) {
			where.plan = { userId };
		}

		if (planId) where.planId = planId;
		if (locationId) where.locationId = locationId;
		if (isSelected !== undefined) where.isSelected = isSelected;
		if (type) where.type = { contains: type, mode: "insensitive" };

		const [accommodations, total] = await Promise.all([
			prisma.accommodation.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
				include: {
					plan: { select: PLAN_SELECT },
					location: { select: LOCATION_SELECT_BASIC },
				},
			}),
			prisma.accommodation.count({ where }),
		]);

		return { accommodations, total };
	}

	static async getAccommodationById(id: string) {
		const accommodation = await prisma.accommodation.findUnique({
			where: { id },
			include: {
				plan: { select: PLAN_SELECT },
				location: { select: LOCATION_SELECT_FULL },
			},
		});

		if (!accommodation) throw new Error("Accommodation not found");
		return accommodation;
	}

	static async createAccommodation(data: CreateAccommodationData) {
		try {
			await validateLocationPlan(data.locationId, data.planId);

			if (data.isSelected) {
				await prisma.accommodation.updateMany({
					where: { planId: data.planId, isSelected: true },
					data: { isSelected: false },
				});
			}

			return await prisma.accommodation.create({
				data: {
					locationId: data.locationId,
					planId: data.planId,
					name: data.name,
					type: data.type ?? null,
					address: data.address ?? null,
					price: data.price ?? null,
					rating: data.rating ?? null,
					description: data.description ?? null,
					checkIn: data.checkIn ?? null,
					checkOut: data.checkOut ?? null,
					isSelected: data.isSelected ?? false,
				},
				include: {
					plan: { select: PLAN_SELECT },
					location: { select: LOCATION_SELECT_BASIC },
				},
			});
		} catch (error: any) {
			if (
				error.message ===
				"Location does not belong to the specified plan"
			) {
				throw error;
			}
			handlePrismaError(error, "Plan or location not found");
		}
	}

	static async updateAccommodation(
		id: string,
		data: UpdateAccommodationData,
	) {
		try {
			const existing = await prisma.accommodation.findUnique({
				where: { id },
			});
			if (!existing) throw new Error("Accommodation not found");

			if (data.locationId || data.planId) {
				await validateLocationPlan(
					data.locationId ?? existing.locationId,
					data.planId ?? existing.planId,
				);
			}

			if (data.isSelected && !existing.isSelected) {
				await prisma.accommodation.updateMany({
					where: {
						planId: data.planId ?? existing.planId,
						isSelected: true,
						id: { not: id },
					},
					data: { isSelected: false },
				});
			}

			return await prisma.accommodation.update({
				where: { id },
				data: filterUndefined(data),
				include: {
					plan: { select: PLAN_SELECT },
					location: { select: LOCATION_SELECT_BASIC },
				},
			});
		} catch (error: any) {
			if (
				error.message ===
					"Location does not belong to the specified plan" ||
				error.message === "Accommodation not found"
			) {
				throw error;
			}
			handlePrismaError(error, "Accommodation not found");
		}
	}

	static async deleteAccommodation(id: string) {
		try {
			await prisma.accommodation.delete({ where: { id } });
		} catch (error: any) {
			handlePrismaError(error, "Accommodation not found");
		}
	}

	static async validateAccommodationOwnership(
		accommodationId: string,
		userId: string | null,
	) {
		if (userId === null) return true; // System access

		const accommodation = await prisma.accommodation.findFirst({
			where: {
				id: accommodationId,
				plan: { userId },
			},
		});
		return accommodation !== null;
	}
}
