"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { STAGES, MET_AT_OPTIONS } from "@/lib/utils";

interface ContactData {
  id?: string;
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
  reminderDays: number | null;
}

export default function ContactForm({
  initialData,
  isEditing = false,
}: {
  initialData?: ContactData;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageUrl || ""
  );

  const [form, setForm] = useState({
    name: initialData?.name || "",
    age: initialData?.age?.toString() || "",
    igHandle: initialData?.igHandle || "",
    phoneNumber: initialData?.phoneNumber || "",
    metAt: initialData?.metAt || "",
    imageUrl: initialData?.imageUrl || "",
    stage: initialData?.stage || "just_met",
    city: initialData?.city || "",
    country: initialData?.country || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    notes: initialData?.notes || "",
    reminderDays: initialData?.reminderDays?.toString() || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch {
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      const url = isEditing
        ? `/api/contacts/${initialData?.id}`
        : "/api/contacts";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const contact = await res.json();
      router.push(`/dashboard/contacts/${contact.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image upload */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-dashed border-gray-700 hover:border-brand-500 cursor-pointer transition-colors group"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-brand-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-[10px] mt-1">Photo</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div>
          <h3 className="text-sm font-medium text-gray-300">Profile Photo</h3>
          <p className="text-xs text-gray-500 mt-1">
            Click to upload a photo
          </p>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Her name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="input-field"
            placeholder="Age"
            min="18"
            max="99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instagram Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              @
            </span>
            <input
              type="text"
              name="igHandle"
              value={form.igHandle}
              onChange={handleChange}
              className="input-field pl-8"
              placeholder="instagram"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="input-field"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Stage & Where met */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stage
          </label>
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="input-field"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Where You Met
          </label>
          <select
            name="metAt"
            value={form.metAt}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select...</option>
            {MET_AT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Where She&apos;s From</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="input-field"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="input-field"
              placeholder="Country"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Latitude (for map pin)
            </label>
            <input
              type="number"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              className="input-field"
              placeholder="40.7128"
              step="any"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Longitude (for map pin)
            </label>
            <input
              type="number"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              className="input-field"
              placeholder="-74.0060"
              step="any"
            />
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Reminder (days)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Get reminded to message her every X days
        </p>
        <input
          type="number"
          name="reminderDays"
          value={form.reminderDays}
          onChange={handleChange}
          className="input-field max-w-xs"
          placeholder="e.g. 3"
          min="1"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="input-field resize-none"
          placeholder="Anything you want to remember about her..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Contact"
            : "Add Contact"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
