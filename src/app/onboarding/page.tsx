"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const PLUMBING_SPECIALTIES = [
  "Leak Repair",
  "Drain Cleaning",
  "Water Heater Installation",
  "Pipe Installation",
  "Toilet Repair",
  "Faucet Installation",
  "Sump Pump Services",
  "Gas Line Services",
];

const ELECTRICAL_SPECIALTIES = [
  "Outlet Installation",
  "Light Fixture Installation",
  "Circuit Breaker Repair",
  "Ceiling Fan Installation",
  "Electrical Panel Upgrade",
  "Wiring Repair",
  "Generator Installation",
  "Smart Home Installation",
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export default function OnboardingPage() {
  const router = useRouter();
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

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Complete Your Provider Profile
          </CardTitle>
          <CardDescription>
            Tell us about your services so customers can find you
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
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell customers about your experience and expertise..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label>Service Types *</Label>
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
                    Plumbing
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
                    Electrical
                  </label>
                </div>
              </div>
            </div>

            {availableSpecialties.length > 0 && (
              <div className="space-y-3">
                <Label>Specialties (select all that apply)</Label>
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
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="San Francisco"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select name="state" required disabled={isLoading}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceRadius">Service Radius (miles) *</Label>
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
              <p className="text-xs text-gray-500">
                How far are you willing to travel for jobs?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="Your professional license number"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Required for verification (optional now, but needed before
                accepting jobs)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || serviceTypes.length === 0}
            >
              {isLoading ? "Completing setup..." : "Complete Setup"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
