"use client";

import { useState, useCallback } from "react";
import ContactCard from "./ContactCard";
import { STAGES } from "@/lib/utils";

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

export default function Pipeline({
  contacts: initialContacts,
}: {
  contacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, contactId: string) => {
      e.dataTransfer.setData("contactId", contactId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, stage: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverStage !== stage) {
        setDragOverStage(stage);
      }
    },
    [dragOverStage]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newStage: string) => {
      e.preventDefault();
      setDragOverStage(null);

      const contactId = e.dataTransfer.getData("contactId");
      if (!contactId) return;

      const contact = contacts.find((c) => c.id === contactId);
      if (!contact || contact.stage === newStage) return;

      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, stage: newStage } : c))
      );

      // Persist
      try {
        const res = await fetch(`/api/contacts/${contactId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        if (!res.ok) {
          // Revert on failure
          setContacts((prev) =>
            prev.map((c) =>
              c.id === contactId ? { ...c, stage: contact.stage } : c
            )
          );
        }
      } catch {
        // Revert on error
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId ? { ...c, stage: contact.stage } : c
          )
        );
      }
    },
    [contacts]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-10rem)]">
      {STAGES.map((stage) => {
        const stageContacts = contacts.filter((c) => c.stage === stage.value);

        return (
          <div
            key={stage.value}
            className={`flex-shrink-0 w-80 rounded-xl transition-colors duration-200 ${
              dragOverStage === stage.value
                ? "bg-gray-800/80 ring-2 ring-brand-500/30"
                : "bg-gray-900/50"
            }`}
            onDragOver={(e) => handleDragOver(e, stage.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.value)}
          >
            {/* Column header */}
            <div className="p-4 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`stage-badge ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-mono">
                  {stageContacts.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-3">
              {stageContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-700 text-sm">
                  <p>No contacts</p>
                  <p className="text-xs mt-1">Drag cards here</p>
                </div>
              ) : (
                stageContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    draggable
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
