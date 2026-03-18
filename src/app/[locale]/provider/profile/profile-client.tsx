"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("ProviderProfileSettings");
  const tc = useTranslations("Common");
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

      alert(t("updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t("updateError"));
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
          <h1 className="text-3xl font-bold text-charcoal">{t("title")}</h1>
          <p className="mt-2 text-slate">{t("description")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">
              {t("basicInfo")}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{tc("fullName")}</Label>
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
                <Label htmlFor="phone">{tc("phone")}</Label>
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
                  placeholder={t("bioPlaceholder")}
                  rows={4}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">
              {t("serviceDetails")}
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">{t("serviceTypes")}</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="plumbing"
                      checked={formData.serviceTypes.includes("PLUMBING")}
                      onCheckedChange={() => toggleServiceType("PLUMBING")}
                    />
                    <Label htmlFor="plumbing" className="font-normal">
                      {tc("plumbing")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="electrical"
                      checked={formData.serviceTypes.includes("ELECTRICAL")}
                      onCheckedChange={() => toggleServiceType("ELECTRICAL")}
                    />
                    <Label htmlFor="electrical" className="font-normal">
                      {tc("electrical")}
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="specialties">{t("specialtiesLabel")}</Label>
                <Input
                  id="specialties"
                  type="text"
                  value={formData.specialties}
                  onChange={(e) =>
                    setFormData({ ...formData, specialties: e.target.value })
                  }
                  placeholder={t("specialtiesPlaceholder")}
                />
              </div>

              <div>
                <Label htmlFor="serviceRadius">
                  {t("serviceRadiusLabel")}
                </Label>
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
              {t("verificationStatus")}
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
                  {t("licenseLabel")} {provider.licenseNumber}
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
              {saving ? tc("saving") : tc("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
