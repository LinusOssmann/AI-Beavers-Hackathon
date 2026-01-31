import { prisma } from "@/prisma/prisma";
import { filterUndefined, handlePrismaError } from "./utils";

interface GetUsersParams {
  email?: string;
  limit?: number;
  offset?: number;
}

interface CreateUserData {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string | null;
}

export class UserService {
  static async getUsers(params: GetUsersParams) {
    const { email, limit, offset } = params;

    const where = email
      ? { email: { contains: email, mode: "insensitive" as const } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async createUser(data: CreateUserData) {
    try {
      return await prisma.user.create({
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified ?? false,
          image: data.image ?? null,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("User with this email already exists");
      }
      throw error;
    }
  }

  static async updateUser(id: string, data: UpdateUserData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: filterUndefined(data),
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("User with this email already exists");
      }
      handlePrismaError(error, "User not found");
    }
  }

  static async deleteUser(id: string) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error: any) {
      handlePrismaError(error, "User not found");
    }
  }
}
