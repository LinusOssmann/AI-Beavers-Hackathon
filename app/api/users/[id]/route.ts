import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await UserService.getUserById(id);
    return NextResponse.json({ data: user });
  } catch (error: any) {
    if (error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, emailVerified, image } = await request.json();

    const user = await UserService.updateUser(id, {
      name,
      email,
      emailVerified,
      image,
    });

    return NextResponse.json({ data: user });
  } catch (error: any) {
    if (error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (error.message === "User with this email already exists") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await UserService.deleteUser(id);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    if (error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
