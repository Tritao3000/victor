"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLUMBING_SPECIALTIES,
  ELECTRICAL_SPECIALTIES,
  PT_DISTRICTS,
} from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations('Onboarding');
  const tc = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const availableSpecialties = [
    ...(serviceTypes.includes("PLUMBING") ? PLUMBING_SPECIALTIES : []),
    ...(serviceTypes.includes("ELECTRICAL") ? ELECTRICAL_SPECIALTIES : []),
  ];

  function handleServiceTypeToggle(serviceType: string) {
    setServiceTypes((prev) =>
      prev.includes(serviceType)
        ? prev.filter((t) => t !== serviceType)
        : [...prev, serviceType],
    );
  }

  function handleSpecialtyToggle(specialty: string) {
    setSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      phone: formData.get("phone") as string,
      bio: formData.get("bio") as string,
      serviceTypes,
      specialties,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      serviceRadius: parseInt(formData.get("serviceRadius") as string),
      licenseNumber: formData.get("licenseNumber") as string,
    };

    try {
      const response = await fetch("/api/provider/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Redirect to Stripe Connect onboarding
      const stripeRes = await fetch("/api/provider/stripe-connect", {
        method: "POST",
      });

      if (stripeRes.ok) {
        const { url } = await stripeRes.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }

      // Fallback to dashboard if Stripe Connect fails
      router.push("/provider/dashboard");
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('bioLabel')}</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder={t('bioPlaceholder')}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('serviceTypes')}</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="plumbing"
                    checked={serviceTypes.includes("PLUMBING")}
                    onCheckedChange={() => handleServiceTypeToggle("PLUMBING")}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="plumbing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tc('plumbing')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="electrical"
                    checked={serviceTypes.includes("ELECTRICAL")}
                    onCheckedChange={() =>
                      handleServiceTypeToggle("ELECTRICAL")
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="electrical"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tc('electrical')}
                  </label>
                </div>
              </div>
            </div>

            {availableSpecialties.length > 0 && (
              <div className="space-y-3">
                <Label>{t('specialtiesLabel')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableSpecialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={specialty}
                        checked={specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={specialty}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('cityLabel')}</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder={t('cityPlaceholder')}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">{t('districtLabel')}</Label>
                <Select name="state" required disabled={isLoading}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder={t('districtPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PT_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceRadius">{t('radiusLabel')}</Label>
              <Input
                id="serviceRadius"
                name="serviceRadius"
                type="number"
                min="5"
                max="100"
                defaultValue="25"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-storm">
                {t('radiusHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">{t('licenseLabel')}</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder={t('licensePlaceholder')}
                disabled={isLoading}
              />
              <p className="text-xs text-storm">
                {t('licenseHint')}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || serviceTypes.length === 0}
            >
              {isLoading ? t('completing') : t('completeSetup')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
