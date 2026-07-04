import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient, getClientByEmail } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, password } = body;

    if (!name || !email || !whatsapp || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await getClientByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const client = await createClient({
      name,
      email: email.toLowerCase(),
      whatsapp,
      passwordHash,
    });

    return NextResponse.json(
      {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          whatsapp: client.whatsapp,
        },
        token: client.id,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
