import { NextRequest, NextResponse } from "next/server";
import { getClientById } from "@/lib/store";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await getClientById(token);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      whatsapp: client.whatsapp,
    },
  });
}
