import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Pipeline from "@/components/Pipeline";
import NotificationBar from "@/components/NotificationBar";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

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

  const serialized = contacts.map((c) => ({
    ...c,
    lastContacted: c.lastContacted?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    dates: c.dates.map((d) => ({
      ...d,
      date: d.date.toISOString(),
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-gray-500 mt-1">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/contacts/new" className="btn-primary">
          + Add Girl
        </Link>
      </div>

      {/* Notifications */}
      <NotificationBar contacts={serialized} />

      {/* Pipeline */}
      {contacts.length === 0 ? (
        <div className="card text-center py-16">
          <svg
            className="w-16 h-16 text-gray-700 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            No contacts yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding girls to your pipeline
          </p>
          <Link href="/dashboard/contacts/new" className="btn-primary">
            + Add Your First Contact
          </Link>
        </div>
      ) : (
        <Pipeline contacts={serialized} />
      )}
    </div>
  );
}
