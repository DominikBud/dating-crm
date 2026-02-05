"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getStageInfo, formatDate, getDaysSince, isReminderOverdue } from "@/lib/utils";

interface DateEntry {
  id: string;
  date: string;
  location: string | null;
  notes: string | null;
  rating: number | null;
}

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
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  lastContacted: string | null;
  reminderDays: number | null;
  dates: DateEntry[];
  createdAt: string;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddDate, setShowAddDate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Date form
  const [dateForm, setDateForm] = useState({
    date: new Date().toISOString().split("T")[0],
    location: "",
    notes: "",
    rating: "",
  });

  const fetchContact = useCallback(async () => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setContact(data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [contactId, router]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    setDeleting(true);

    try {
      await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contacts/${contactId}/dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateForm),
      });

      if (res.ok) {
        setShowAddDate(false);
        setDateForm({
          date: new Date().toISOString().split("T")[0],
          location: "",
          notes: "",
          rating: "",
        });
        fetchContact();
      }
    } catch {
      // Error handling
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    try {
      await fetch(`/api/contacts/${contactId}/dates/${dateId}`, {
        method: "DELETE",
      });
      fetchContact();
    } catch {
      // Error handling
    }
  };

  const handleMarkContacted = async () => {
    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContacted: new Date().toISOString() }),
      });
      fetchContact();
    } catch {
      // Error handling
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!contact) return null;

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Edit {contact.name}
            </h1>
          </div>
          <button onClick={() => setEditing(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
        <div className="card">
          <ContactForm initialData={contact} isEditing />
        </div>
      </div>
    );
  }

  const stageInfo = getStageInfo(contact.stage);
  const daysSince = getDaysSince(contact.lastContacted);
  const overdue = isReminderOverdue(
    contact.lastContacted,
    contact.reminderDays
  );

  return (
    <div className="max-w-4xl">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pipeline
      </Link>

      {/* Reminder banner */}
      {overdue && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-amber-200 text-sm">
              You haven&apos;t messaged {contact.name} in{" "}
              {daysSince !== null ? `${daysSince} days` : "a while"}!
            </span>
          </div>
          <button onClick={handleMarkContacted} className="btn-primary text-sm py-1.5">
            Mark as Contacted
          </button>
        </div>
      )}

      {/* Profile header */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          {/* Photo */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0">
            {contact.imageUrl ? (
              <Image
                src={contact.imageUrl}
                alt={contact.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                {contact.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {contact.name}
                  {contact.age ? (
                    <span className="text-gray-500 font-normal ml-2">
                      {contact.age}
                    </span>
                  ) : null}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`stage-badge ${stageInfo.color}`}>
                    {stageInfo.label}
                  </span>
                  {contact.metAt && (
                    <span className="text-sm text-gray-500">
                      Met on {contact.metAt}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger text-sm"
                >
                  {deleting ? "..." : "Delete"}
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {contact.igHandle && (
                <a
                  href={`https://instagram.com/${contact.igHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  @{contact.igHandle}
                </a>
              )}
              {contact.phoneNumber && (
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contact.phoneNumber}
                </a>
              )}
              {(contact.city || contact.country) && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[contact.city, contact.country].filter(Boolean).join(", ")}
                </span>
              )}
              {daysSince !== null && (
                <span className={`text-sm ${overdue ? "text-amber-400" : "text-gray-500"}`}>
                  Last contacted:{" "}
                  {daysSince === 0 ? "Today" : `${daysSince} days ago`}
                </span>
              )}
            </div>

            {contact.notes && (
              <p className="text-sm text-gray-400 mt-4 bg-gray-800/50 rounded-lg p-3">
                {contact.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dates section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Dates ({contact.dates.length})
          </h2>
          <button
            onClick={() => setShowAddDate(!showAddDate)}
            className="btn-primary text-sm"
          >
            {showAddDate ? "Cancel" : "+ Add Date"}
          </button>
        </div>

        {/* Add date form */}
        {showAddDate && (
          <form
            onSubmit={handleAddDate}
            className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={dateForm.date}
                  onChange={(e) =>
                    setDateForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={dateForm.location}
                  onChange={(e) =>
                    setDateForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Where did you go?"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea
                value={dateForm.notes}
                onChange={(e) =>
                  setDateForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="input-field resize-none"
                rows={2}
                placeholder="How did it go?"
              />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  value={dateForm.rating}
                  onChange={(e) =>
                    setDateForm((p) => ({ ...p, rating: e.target.value }))
                  }
                  className="input-field w-20"
                  min="1"
                  max="5"
                />
              </div>
              <button type="submit" className="btn-primary text-sm mt-5">
                Save Date
              </button>
            </div>
          </form>
        )}

        {/* Date list */}
        {contact.dates.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            No dates logged yet
          </div>
        ) : (
          <div className="space-y-3">
            {contact.dates.map((d) => (
              <div
                key={d.id}
                className="flex items-start justify-between bg-gray-800/30 rounded-lg p-4 group"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-200">
                      {formatDate(d.date)}
                    </span>
                    {d.location && (
                      <span className="text-xs text-gray-500">
                        @ {d.location}
                      </span>
                    )}
                    {d.rating && (
                      <span className="text-xs text-amber-400">
                        {"*".repeat(d.rating)}
                      </span>
                    )}
                  </div>
                  {d.notes && (
                    <p className="text-xs text-gray-500 mt-1">{d.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteDate(d.id)}
                  className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex items-center gap-3">
        {!overdue && contact.reminderDays && (
          <button onClick={handleMarkContacted} className="btn-secondary text-sm">
            Mark as Contacted
          </button>
        )}
      </div>
    </div>
  );
}
