export const STAGES = [
  { value: "just_met", label: "Just Met", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  { value: "chatting", label: "Chatting", color: "bg-purple-500/20 text-purple-400 border border-purple-500/30" },
  { value: "date_planned", label: "Date Planned", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  { value: "dated", label: "Dated", color: "bg-pink-500/20 text-pink-400 border border-pink-500/30" },
  { value: "hooked_up", label: "Hooked Up", color: "bg-red-500/20 text-red-400 border border-red-500/30" },
  { value: "relationship", label: "Relationship", color: "bg-green-500/20 text-green-400 border border-green-500/30" },
] as const;

export const MET_AT_OPTIONS = [
  "Tinder",
  "Bumble",
  "Hinge",
  "Instagram",
  "Bar / Club",
  "Through Friends",
  "Work / School",
  "Street",
  "Coffee Shop",
  "Gym",
  "Other",
] as const;

export function getStageInfo(stage: string) {
  return STAGES.find((s) => s.value === stage) ?? STAGES[0];
}

export function getDaysSince(date: Date | string | null): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isReminderOverdue(
  lastContacted: Date | string | null,
  reminderDays: number | null
): boolean {
  if (!reminderDays) return false;
  const days = getDaysSince(lastContacted);
  if (days === null) return reminderDays > 0;
  return days >= reminderDays;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
