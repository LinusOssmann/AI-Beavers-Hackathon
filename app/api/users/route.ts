import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get("email");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await UserService.getUsers({
      email: email ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ data: result.users, total: result.total });
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

    const user = await UserService.createUser({
      id,
      name,
      email,
      emailVerified,
      image,
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: any) {
    if (error.message === "User with this email already exists") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
