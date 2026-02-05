import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const contacts = await prisma.contact.findMany({
    where: { userId },
    include: {
      dates: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const data = await req.json();

    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        age: data.age ? parseInt(data.age) : null,
        igHandle: data.igHandle || null,
        phoneNumber: data.phoneNumber || null,
        metAt: data.metAt || null,
        imageUrl: data.imageUrl || null,
        stage: data.stage || "just_met",
        city: data.city || null,
        country: data.country || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        notes: data.notes || null,
        reminderDays: data.reminderDays ? parseInt(data.reminderDays) : null,
        lastContacted: data.lastContacted
          ? new Date(data.lastContacted)
          : new Date(),
        userId,
      },
      include: { dates: true },
    });

    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
