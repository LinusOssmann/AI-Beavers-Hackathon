import getBody from "@/app/api/lib/getBody";
import { dataPayloadSchema } from "@/app/api/routes.schemas";
import { updateUserContextData } from "@/lib/services/user.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await getBody(request, dataPayloadSchema);
    if (body instanceof NextResponse) return body;

    const { userId, data } = body;

    const ok = await updateUserContextData(userId, data);
    if (!ok) {
      return NextResponse.json(
        { error: "The user wasn't found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error saving that data." },
      { status: 500 }
    );
  }
}
