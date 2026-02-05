import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center bg-gray-900 rounded-xl">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default async function MapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const contacts = await prisma.contact.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      age: true,
      stage: true,
      city: true,
      imageUrl: true,
      latitude: true,
      longitude: true,
    },
  });

  const withLocation = contacts.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Map View</h1>
          <p className="text-gray-500 mt-1">
            {withLocation.length} of {contacts.length} contacts on the map
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">Just Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-500">Chatting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-500">Date Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-xs text-gray-500">Dated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Hooked Up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Relationship</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-gray-800">
        {withLocation.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
            <svg
              className="w-16 h-16 text-gray-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              No locations yet
            </h3>
            <p className="text-gray-600 text-sm">
              Add latitude & longitude to your contacts to see them on the map
            </p>
          </div>
        ) : (
          <MapView contacts={contacts} />
        )}
      </div>
    </div>
  );
}
