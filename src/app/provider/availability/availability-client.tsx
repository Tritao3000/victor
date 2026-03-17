"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServiceProvider } from "@prisma/client";

type AvailabilityClientProps = {
  provider: ServiceProvider;
};

type WeeklyHours = {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
};

const defaultHours = {
  enabled: false,
  start: "09:00",
  end: "17:00",
};

export function AvailabilityClient({ provider }: AvailabilityClientProps) {
  const [isActive, setIsActive] = useState(provider.isActive);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(
    (provider.availableHours as WeeklyHours) || {
      monday: { ...defaultHours, enabled: true },
      tuesday: { ...defaultHours, enabled: true },
      wednesday: { ...defaultHours, enabled: true },
      thursday: { ...defaultHours, enabled: true },
      friday: { ...defaultHours, enabled: true },
      saturday: { ...defaultHours },
      sunday: { ...defaultHours },
    },
  );
  const [saving, setSaving] = useState(false);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive,
          availableHours: weeklyHours,
        }),
      });

      if (!response.ok) throw new Error("Failed to update availability");

      alert("Availability updated successfully!");
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability");
    } finally {
      setSaving(false);
    }
  }

  function updateDayHours(
    day: keyof WeeklyHours,
    field: "enabled" | "start" | "end",
    value: boolean | string,
  ) {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Availability Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your working hours and availability status
          </p>
        </div>

        {/* Active Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Availability Status
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Toggle to accept or pause new booking requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Weekly Hours */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Working Hours
          </h2>
          <div className="space-y-4">
            {days.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2 w-32">
                  <Checkbox
                    id={`${day}-enabled`}
                    checked={weeklyHours[day].enabled}
                    onCheckedChange={(checked) =>
                      updateDayHours(day, "enabled", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${day}-enabled`}
                    className="text-sm font-medium capitalize"
                  >
                    {day}
                  </Label>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-start`} className="text-sm">
                      From
                    </Label>
                    <input
                      id={`${day}-start`}
                      type="time"
                      value={weeklyHours[day].start}
                      onChange={(e) =>
                        updateDayHours(day, "start", e.target.value)
                      }
                      disabled={!weeklyHours[day].enabled}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-end`} className="text-sm">
                      To
                    </Label>
                    <input
                      id={`${day}-end`}
                      type="time"
                      value={weeklyHours[day].end}
                      onChange={(e) =>
                        updateDayHours(day, "end", e.target.value)
                      }
                      disabled={!weeklyHours[day].enabled}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
