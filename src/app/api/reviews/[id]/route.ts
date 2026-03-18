import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { providerRating, providerComment, isFlagged, flagReason } = body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Provider rating: must be the provider of the booking
    if (providerRating !== undefined) {
      if (review.booking.provider?.user?.id !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized to rate as provider" },
          { status: 403 },
        );
      }

      if (providerRating < 1 || providerRating > 5) {
        return NextResponse.json(
          { error: "Provider rating must be between 1-5" },
          { status: 400 },
        );
      }
    }

    // Flagging: must be the customer who wrote the review
    if (isFlagged !== undefined) {
      if (review.customerId !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized to flag this review" },
          { status: 403 },
        );
      }
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(providerRating !== undefined && { providerRating }),
        ...(providerComment !== undefined && { providerComment }),
        ...(isFlagged !== undefined && { isFlagged }),
        ...(flagReason !== undefined && { flagReason }),
      },
      include: {
        customer: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}
