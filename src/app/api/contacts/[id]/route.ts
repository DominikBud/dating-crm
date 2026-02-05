import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, userId },
    include: {
      dates: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const existing = await prisma.contact.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  try {
    const data = await req.json();

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        age: data.age !== undefined ? (data.age ? parseInt(data.age) : null) : undefined,
        igHandle: data.igHandle !== undefined ? data.igHandle || null : undefined,
        phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber || null : undefined,
        metAt: data.metAt !== undefined ? data.metAt || null : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl || null : undefined,
        stage: data.stage !== undefined ? data.stage : undefined,
        city: data.city !== undefined ? data.city || null : undefined,
        country: data.country !== undefined ? data.country || null : undefined,
        latitude: data.latitude !== undefined ? (data.latitude ? parseFloat(data.latitude) : null) : undefined,
        longitude: data.longitude !== undefined ? (data.longitude ? parseFloat(data.longitude) : null) : undefined,
        notes: data.notes !== undefined ? data.notes || null : undefined,
        reminderDays: data.reminderDays !== undefined ? (data.reminderDays ? parseInt(data.reminderDays) : null) : undefined,
        lastContacted: data.lastContacted ? new Date(data.lastContacted) : undefined,
      },
      include: { dates: true },
    });

    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const existing = await prisma.contact.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
