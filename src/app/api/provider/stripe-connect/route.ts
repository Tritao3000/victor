import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

/**
 * POST — Create or resume Stripe Connect onboarding for a provider.
 * Returns a Stripe Account Link URL that the provider visits to complete onboarding.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { serviceProvider: true },
    });

    if (!user?.serviceProvider) {
      return NextResponse.json(
        { error: "Not a service provider" },
        { status: 403 },
      );
    }

    const provider = user.serviceProvider;
    let stripeAccountId = provider.stripeConnectedAccountId;

    // Create connected account if one doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "PT",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          victorProviderId: provider.id,
          victorUserId: user.id,
        },
      });

      stripeAccountId = account.id;

      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: { stripeConnectedAccountId: account.id },
      });
    }

    // Create account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/provider/dashboard?stripe_refresh=true`,
      return_url: `${appUrl}/provider/dashboard?stripe_onboarded=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe Connect link:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect onboarding link" },
      { status: 500 },
    );
  }
}

/**
 * GET — Check Stripe Connect onboarding status for a provider.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { serviceProvider: true },
    });

    if (!user?.serviceProvider) {
      return NextResponse.json(
        { error: "Not a service provider" },
        { status: 403 },
      );
    }

    const provider = user.serviceProvider;

    if (!provider.stripeConnectedAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      });
    }

    // Fetch latest status from Stripe
    const account = await stripe.accounts.retrieve(
      provider.stripeConnectedAccountId,
    );

    const onboardingComplete =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;

    // Sync status if it changed
    if (onboardingComplete !== provider.stripeOnboardingComplete) {
      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: { stripeOnboardingComplete: onboardingComplete },
      });
    }

    return NextResponse.json({
      connected: true,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    console.error("Error checking Stripe Connect status:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe Connect status" },
      { status: 500 },
    );
  }
}
