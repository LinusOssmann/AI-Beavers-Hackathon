import { prisma } from "@/prisma/prisma";
import {
	PLAN_SELECT,
	LOCATION_SELECT_BASIC,
	LOCATION_SELECT_FULL,
	filterUndefined,
	handlePrismaError,
	validateLocationPlan,
} from "./utils";

interface GetActivitiesParams {
	userId?: string | null; // null/undefined = system access, string = user access
	planId?: string;
	locationId?: string;
	isSelected?: boolean;
	type?: string;
	limit?: number;
	offset?: number;
}

interface CreateActivityData {
	locationId: string;
	planId: string;
	name: string;
	type?: string | null;
	address?: string | null;
	price?: number | null;
	rating?: number | null;
	description?: string | null;
	duration?: number | null;
	isSelected?: boolean;
}

interface UpdateActivityData {
	name?: string;
	type?: string | null;
	address?: string | null;
	price?: number | null;
	rating?: number | null;
	description?: string | null;
	duration?: number | null;
	isSelected?: boolean;
	locationId?: string;
	planId?: string;
}

export class ActivityService {
	static async getActivities(params: GetActivitiesParams) {
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

		const [activities, total] = await Promise.all([
			prisma.activity.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
				include: {
					plan: { select: PLAN_SELECT },
					location: { select: LOCATION_SELECT_BASIC },
				},
			}),
			prisma.activity.count({ where }),
		]);

		return { activities, total };
	}

	static async getActivityById(id: string) {
		const activity = await prisma.activity.findUnique({
			where: { id },
			include: {
				plan: { select: PLAN_SELECT },
				location: { select: LOCATION_SELECT_FULL },
			},
		});

		if (!activity) throw new Error("Activity not found");
		return activity;
	}

	static async createActivity(data: CreateActivityData) {
		try {
			await validateLocationPlan(data.locationId, data.planId);

			return await prisma.activity.create({
				data: {
					locationId: data.locationId,
					planId: data.planId,
					name: data.name,
					type: data.type ?? null,
					address: data.address ?? null,
					price: data.price ?? null,
					rating: data.rating ?? null,
					description: data.description ?? null,
					duration: data.duration ?? null,
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

	static async updateActivity(id: string, data: UpdateActivityData) {
		try {
			const existing = await prisma.activity.findUnique({
				where: { id },
			});
			if (!existing) throw new Error("Activity not found");

			if (data.locationId || data.planId) {
				await validateLocationPlan(
					data.locationId ?? existing.locationId,
					data.planId ?? existing.planId,
				);
			}

			return await prisma.activity.update({
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
				error.message === "Activity not found"
			) {
				throw error;
			}
			handlePrismaError(error, "Activity not found");
		}
	}

	static async deleteActivity(id: string) {
		try {
			await prisma.activity.delete({ where: { id } });
		} catch (error: any) {
			handlePrismaError(error, "Activity not found");
		}
	}

	static async validateActivityOwnership(
		activityId: string,
		userId: string | null,
	) {
		if (userId === null) return true; // System access

		const activity = await prisma.activity.findFirst({
			where: {
				id: activityId,
				plan: { userId },
			},
		});
		return activity !== null;
	}
}
