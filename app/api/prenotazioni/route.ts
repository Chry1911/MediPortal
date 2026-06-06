// app/api/prenotazioni/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  // TODO: implementare
  return NextResponse.json([]);
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  // TODO: implementare
  return NextResponse.json({}, { status: 201 });
}
