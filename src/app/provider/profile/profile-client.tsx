"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceProvider, ServiceType } from "@prisma/client";

type ProfileClientProps = {
  provider: ServiceProvider;
};

export function ProfileClient({ provider }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    name: provider.name,
    phone: provider.phone,
    bio: provider.bio || "",
    serviceTypes: provider.serviceTypes,
    specialties: provider.specialties.join(", "),
    serviceRadius: provider.serviceRadius,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          serviceTypes: formData.serviceTypes,
          specialties: formData.specialties
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
          serviceRadius: Number(formData.serviceRadius),
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function toggleServiceType(type: ServiceType) {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Profile Settings</h1>
          <p className="mt-2 text-slate">
            Update your professional profile information
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell customers about your experience and expertise..."
                  rows={4}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">
              Service Details
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Service Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="plumbing"
                      checked={formData.serviceTypes.includes("PLUMBING")}
                      onCheckedChange={() => toggleServiceType("PLUMBING")}
                    />
                    <Label htmlFor="plumbing" className="font-normal">
                      Plumbing
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="electrical"
                      checked={formData.serviceTypes.includes("ELECTRICAL")}
                      onCheckedChange={() => toggleServiceType("ELECTRICAL")}
                    />
                    <Label htmlFor="electrical" className="font-normal">
                      Electrical
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="specialties">
                  Specialties (comma-separated)
                </Label>
                <Input
                  id="specialties"
                  type="text"
                  value={formData.specialties}
                  onChange={(e) =>
                    setFormData({ ...formData, specialties: e.target.value })
                  }
                  placeholder="e.g., leak repair, drain cleaning, outlet installation"
                />
              </div>

              <div>
                <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  value={formData.serviceRadius}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceRadius: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              Verification Status
            </h2>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  provider.verificationStatus === "VERIFIED"
                    ? "bg-green-100 text-green-800"
                    : provider.verificationStatus === "PENDING_VERIFICATION"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {provider.verificationStatus.replace("_", " ")}
              </div>
              {provider.licenseNumber && (
                <span className="text-sm text-slate">
                  License: {provider.licenseNumber}
                </span>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-navy hover:bg-navy-light"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
