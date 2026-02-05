"use client";

import Link from "next/link";
import { isReminderOverdue, getDaysSince } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  lastContacted: string | null;
  reminderDays: number | null;
}

export default function NotificationBar({
  contacts,
}: {
  contacts: Contact[];
}) {
  const overdueContacts = contacts.filter((c) =>
    isReminderOverdue(c.lastContacted, c.reminderDays)
  );

  if (overdueContacts.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <h3 className="text-sm font-semibold text-amber-400">
          Time to reach out! ({overdueContacts.length})
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {overdueContacts.map((c) => {
          const days = getDaysSince(c.lastContacted);
          return (
            <Link
              key={c.id}
              href={`/dashboard/contacts/${c.id}`}
              className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              <span className="text-sm text-amber-200">{c.name}</span>
              <span className="text-xs text-amber-400/70">
                {days !== null
                  ? days === 0
                    ? "today"
                    : `${days}d ago`
                  : "never messaged"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
