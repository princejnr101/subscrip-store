import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getClientByEmail } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = await getClientByEmail(email);
    if (!client) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, client.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        whatsapp: client.whatsapp,
      },
      token: client.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
