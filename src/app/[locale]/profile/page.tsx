"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const t = useTranslations('Profile');
  const tc = useTranslations('Common');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{tc('loading')}</p>
      </div>
    );
  }

  const user = session.user;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
    };

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('updateError'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
              <CardDescription>
                {t('description')}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              {tc('signOut')}
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                {t('updateSuccess')}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{tc('email')}</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-mist"
              />
              <p className="text-xs text-storm">{t('emailHint')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{tc('fullName')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name || ""}
                disabled={!isEditing || isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{tc('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={(user as any).phone || ""}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{tc('address')}</Label>
              <Input
                id="address"
                name="address"
                type="text"
                defaultValue={(user as any).address || ""}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{tc('city')}</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={(user as any).city || ""}
                  disabled={!isEditing || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{tc('state')}</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  maxLength={2}
                  placeholder={t('statePlaceholder')}
                  defaultValue={(user as any).state || ""}
                  disabled={!isEditing || isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">{tc('zipCode')}</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                maxLength={10}
                defaultValue={(user as any).zipCode || ""}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="rounded-md bg-navy/5 p-3 text-sm text-navy">
              <strong>{t('role')}</strong>{" "}
              {(user as any).role === "SERVICE_PROVIDER"
                ? t('serviceProvider')
                : tc('customer')}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                {t('editProfile')}
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? tc('saving') : tc('save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  {tc('cancel')}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
