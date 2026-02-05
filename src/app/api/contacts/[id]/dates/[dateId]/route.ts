import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; dateId: string } }
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

  const dateEntry = await prisma.dateEntry.findFirst({
    where: { id: params.dateId, contactId: params.id },
  });

  if (!dateEntry) {
    return NextResponse.json({ error: "Date not found" }, { status: 404 });
  }

  await prisma.dateEntry.delete({
    where: { id: params.dateId },
  });

  return NextResponse.json({ success: true });
}
