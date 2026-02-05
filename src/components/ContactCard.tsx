"use client";

import Link from "next/link";
import Image from "next/image";
import { getStageInfo, getDaysSince, isReminderOverdue } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  age: number | null;
  igHandle: string | null;
  phoneNumber: string | null;
  metAt: string | null;
  imageUrl: string | null;
  stage: string;
  city: string | null;
  country: string | null;
  lastContacted: string | null;
  reminderDays: number | null;
  dates: { id: string }[];
}

export default function ContactCard({
  contact,
  draggable = false,
  onDragStart,
}: {
  contact: Contact;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, contactId: string) => void;
}) {
  const stageInfo = getStageInfo(contact.stage);
  const daysSince = getDaysSince(contact.lastContacted);
  const overdue = isReminderOverdue(contact.lastContacted, contact.reminderDays);

  return (
    <Link href={`/dashboard/contacts/${contact.id}`}>
      <div
        draggable={draggable}
        onDragStart={(e) => onDragStart?.(e, contact.id)}
        className={`card hover:border-gray-700 transition-all duration-200 cursor-pointer group ${
          overdue ? "ring-1 ring-amber-500/50" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
            {contact.imageUrl ? (
              <Image
                src={contact.imageUrl}
                alt={contact.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                {contact.name[0]?.toUpperCase()}
              </div>
            )}
            {overdue && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-gray-900" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-100 truncate group-hover:text-brand-400 transition-colors">
                {contact.name}
              </h3>
              {contact.age && (
                <span className="text-xs text-gray-500">{contact.age}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`stage-badge text-[10px] ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
              {contact.metAt && (
                <span className="text-[10px] text-gray-600">
                  via {contact.metAt}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {contact.city && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {contact.city}
                </span>
              )}
              {contact.dates.length > 0 && (
                <span>{contact.dates.length} date{contact.dates.length !== 1 ? "s" : ""}</span>
              )}
              {daysSince !== null && (
                <span className={overdue ? "text-amber-400" : ""}>
                  {daysSince === 0 ? "Today" : `${daysSince}d ago`}
                </span>
              )}
            </div>
          </div>

          {/* Quick actions indicator */}
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {contact.igHandle && (
              <span className="text-[10px] text-purple-400">IG</span>
            )}
            {contact.phoneNumber && (
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
