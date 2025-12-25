import { prisma } from "../lib/prisma";
import { Review, ReviewInsight, ReviewSummary } from "../../../shared/types";
import { Prisma } from "@prisma/client";

export class ReviewStore {
  async persist(widgetId: string, reviews: Review[], insights: ReviewInsight[]) {
    // 1. Create or Update reviews
    for (const review of reviews) {
      await prisma.review.upsert({
        where: { id: review.id },
        update: {
          rating: review.rating,
          text: review.text,
          authorName: review.authorName,
          profilePhotoUrl: review.profilePhotoUrl,
          publishTime: new Date(review.time * 1000),
        },
        create: {
          id: review.id,
          widgetId: widgetId,
          rating: review.rating,
          text: review.text,
          authorName: review.authorName,
          profilePhotoUrl: review.profilePhotoUrl,
          publishTime: new Date(review.time * 1000),
        },
      });
    }

    // 2. Create or Update insights
    for (const insight of insights) {
      await prisma.reviewInsight.upsert({
        where: { reviewId: insight.reviewId },
        update: {
          sentiment: insight.sentiment,
          summary: insight.summary,
          highlights: insight.highlights as Prisma.InputJsonValue,
        },
        create: {
          reviewId: insight.reviewId,
          sentiment: insight.sentiment,
          summary: insight.summary,
          highlights: insight.highlights as Prisma.InputJsonValue,
        },
      });
    }
  }

  async loadSummary(widgetId: string): Promise<ReviewSummary | null> {
    const reviews = await prisma.review.findMany({
      where: { widgetId },
      include: {
        insight: true,
      },
    });

    if (reviews.length === 0) {
      return null;
    }

    const totalRating = reviews.reduce((acc: number, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const insights = reviews
      .filter((r) => r.insight)
      .map((r) => ({
        reviewId: r.id,
        sentiment: r.insight!.sentiment as any,
        summary: r.insight!.summary,
        highlights: r.insight!.highlights as string[],
      }));


    return {
      placeId: "N/A",
      totalReviews: reviews.length,
      averageRating,
      reviews: reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        time: Math.floor(r.publishTime.getTime() / 1000),
        relativeTimeDescription: "", // Could be calculated or stored
        profilePhotoUrl: r.profilePhotoUrl ?? undefined,
      })),
      recentInsights: insights.slice(0, 3),
      lastSyncedAt: new Date().toISOString(),
    };
  }
}


