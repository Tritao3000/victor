"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signUp } from "@/lib/auth-client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations('Signup');
  const tc = useTranslations('Common');
  const [role, setRole] = useState<"CUSTOMER" | "SERVICE_PROVIDER">(
    "CUSTOMER",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signUp.email({
        name,
        email,
        password,
        callbackURL: role === "SERVICE_PROVIDER" ? "/onboarding" : "/",
        fetchOptions: {
          onSuccess: () => {
            if (role === "SERVICE_PROVIDER") {
              router.push("/onboarding");
            } else {
              router.push("/");
            }
          },
          onError: (ctx) => {
            setError(ctx.error.message || t('failedSignup'));
          },
        },
      });
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">{t('iWantTo')}</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "CUSTOMER" | "SERVICE_PROVIDER")
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">
                    {t('bookCustomer')}
                  </SelectItem>
                  <SelectItem value="SERVICE_PROVIDER">
                    {t('offerProvider')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{tc('fullName')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('namePlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{tc('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{tc('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                required
                minLength={8}
                disabled={isLoading}
              />
              <p className="text-xs text-storm">
                {t('passwordHint')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('creatingAccount') : tc('signUp')}
            </Button>
            <p className="text-center text-sm text-slate">
              {t('alreadyHaveAccount')}{" "}
              <Link
                href="/login"
                className="font-medium text-navy hover:text-navy-light"
              >
                {t('signIn')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
