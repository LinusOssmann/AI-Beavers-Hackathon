import { prisma } from "@/prisma/prisma";
import { PLAN_SELECT, filterUndefined, handlePrismaError } from "./utils";

interface GetLocationsParams {
	userId?: string | null; // null/undefined = system access, string = user access
	planId?: string;
	isSelected?: boolean;
	country?: string;
	city?: string;
	limit?: number;
	offset?: number;
}

interface CreateLocationData {
	planId: string;
	name: string;
	city?: string | null;
	country: string;
	latitude?: number | null;
	longitude?: number | null;
	description?: string | null;
	isSelected?: boolean;
}

interface UpdateLocationData {
	name?: string;
	city?: string | null;
	country?: string;
	latitude?: number | null;
	longitude?: number | null;
	description?: string | null;
	isSelected?: boolean;
}

export class LocationService {
	static async getLocations(params: GetLocationsParams) {
		const { userId, planId, isSelected, country, city, limit, offset } =
			params;

		const where: Record<string, any> = {};

		// If userId provided (not null), enforce ownership via plan relationship
		if (userId !== null && userId !== undefined) {
			where.plan = { userId };
		}

		if (planId) where.planId = planId;
		if (isSelected !== undefined) where.isSelected = isSelected;
		if (country) where.country = { contains: country, mode: "insensitive" };
		if (city) where.city = { contains: city, mode: "insensitive" };

		const [locations, total] = await Promise.all([
			prisma.location.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
				include: { plan: { select: PLAN_SELECT } },
			}),
			prisma.location.count({ where }),
		]);

		return { locations, total };
	}

	static async getLocationById(id: string) {
		const location = await prisma.location.findUnique({
			where: { id },
			include: {
				plan: { select: PLAN_SELECT },
				accommodations: true,
				activities: true,
				transports: true,
			},
		});

		if (!location) throw new Error("Location not found");
		return location;
	}

	static async createLocation(data: CreateLocationData) {
		try {
			if (data.isSelected) {
				await prisma.location.updateMany({
					where: { planId: data.planId, isSelected: true },
					data: { isSelected: false },
				});
			}

			return await prisma.location.create({
				data: {
					planId: data.planId,
					name: data.name,
					country: data.country,
					city: data.city ?? null,
					latitude: data.latitude ?? null,
					longitude: data.longitude ?? null,
					description: data.description ?? null,
					isSelected: data.isSelected ?? false,
				},
				include: { plan: { select: PLAN_SELECT } },
			});
		} catch (error: any) {
			handlePrismaError(error, "Plan not found");
		}
	}

	static async updateLocation(id: string, data: UpdateLocationData) {
		try {
			const existing = await prisma.location.findUnique({
				where: { id },
			});
			if (!existing) throw new Error("Location not found");

			if (data.isSelected && !existing.isSelected) {
				await prisma.location.updateMany({
					where: {
						planId: existing.planId,
						isSelected: true,
						id: { not: id },
					},
					data: { isSelected: false },
				});
			}

			return await prisma.location.update({
				where: { id },
				data: filterUndefined(data),
				include: { plan: { select: PLAN_SELECT } },
			});
		} catch (error: any) {
			handlePrismaError(error, "Location not found");
		}
	}

	static async deleteLocation(id: string) {
		try {
			await prisma.location.delete({ where: { id } });
		} catch (error: any) {
			handlePrismaError(error, "Location not found");
		}
	}

	static async validateLocationOwnership(
		locationId: string,
		userId: string | null,
	) {
		if (userId === null) return true; // System access

		const location = await prisma.location.findFirst({
			where: {
				id: locationId,
				plan: { userId },
			},
		});
		return location !== null;
	}
}
