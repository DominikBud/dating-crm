"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStageInfo } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  age: number | null;
  stage: string;
  city: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Dynamic import components to avoid SSR issues with Leaflet
function MapInner({ contacts }: { contacts: Contact[] }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    L: typeof import("leaflet");
  } | null>(null);

  useEffect(() => {
    async function loadMap() {
      const [reactLeaflet, L] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        L,
      });
    }
    loadMap();
  }, []);

  if (!MapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

  const mappableContacts = contacts.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  const defaultCenter: [number, number] =
    mappableContacts.length > 0
      ? [mappableContacts[0].latitude!, mappableContacts[0].longitude!]
      : [40.7128, -74.006];

  const createIcon = (stage: string) => {
    const colors: Record<string, string> = {
      just_met: "#3b82f6",
      chatting: "#a855f7",
      date_planned: "#f59e0b",
      dated: "#ec4899",
      hooked_up: "#ef4444",
      relationship: "#22c55e",
    };
    const color = colors[stage] || "#ec4899";

    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 30px;
        height: 30px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={mappableContacts.length > 0 ? 4 : 2}
      style={{ height: "100%", width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {mappableContacts.map((contact) => (
        <Marker
          key={contact.id}
          position={[contact.latitude!, contact.longitude!]}
          icon={createIcon(contact.stage)}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">
                {contact.name}
                {contact.age ? `, ${contact.age}` : ""}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "#9ca3af" }}
              >
                {getStageInfo(contact.stage).label}
              </p>
              {contact.city && (
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  {contact.city}
                </p>
              )}
              <Link
                href={`/dashboard/contacts/${contact.id}`}
                className="text-xs text-pink-400 hover:text-pink-300 mt-2 inline-block"
              >
                View Profile →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function MapView({ contacts }: { contacts: Contact[] }) {
  return <MapInner contacts={contacts} />;
}
