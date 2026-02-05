import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, userId },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  try {
    const data = await req.json();

    const dateEntry = await prisma.dateEntry.create({
      data: {
        date: new Date(data.date),
        location: data.location || null,
        notes: data.notes || null,
        rating: data.rating ? parseInt(data.rating) : null,
        contactId: params.id,
      },
    });

    // Update last contacted
    await prisma.contact.update({
      where: { id: params.id },
      data: { lastContacted: new Date(data.date) },
    });

    return NextResponse.json(dateEntry);
  } catch {
    return NextResponse.json(
      { error: "Failed to add date" },
      { status: 500 }
    );
  }
}
