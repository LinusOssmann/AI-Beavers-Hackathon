import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get("email");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const where = email
      ? { email: { contains: email, mode: "insensitive" as const } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit ? Number(limit) : undefined,
        skip: offset ? Number(offset) : undefined,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data: users, total });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, name, email, emailVerified, image } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        emailVerified: emailVerified ?? false,
        image: image ?? null,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
