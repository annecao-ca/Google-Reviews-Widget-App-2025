import { prisma } from "../lib/prisma";
import { Review, ReviewInsight, ReviewSummary } from "../../../shared/types";
import { Prisma } from "@prisma/client";

export class ReviewStore {
  async persist(placeId: string, reviews: Review[], insights: ReviewInsight[], totalReviews?: number) {
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
          placeId: placeId,
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

  async loadSummary(placeId: string, settings?: any, googleTotalReviews?: number): Promise<ReviewSummary | null> {
    const minRating = settings?.minRating ?? 0;
    const sortBy = settings?.sortBy ?? "rating";

    const reviews = await prisma.review.findMany({
      where: {
        placeId,
        rating: { gte: minRating }
      },
      include: {
        insight: true,
      },
      orderBy: sortBy === "rating"
        ? [{ rating: "desc" }, { publishTime: "desc" }]
        : [{ publishTime: "desc" }]
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


    // Use Google's total reviews count if available, otherwise use local count
    const totalReviewsCount = googleTotalReviews ?? reviews.length;

    return {
      placeId: placeId,
      totalReviews: totalReviewsCount,
      averageRating,
      reviews: reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        time: Math.floor(r.publishTime.getTime() / 1000),
        relativeTimeDescription: "",
        profilePhotoUrl: r.profilePhotoUrl ?? undefined,
      })),
      recentInsights: insights.slice(0, 3),
      lastSyncedAt: new Date().toISOString(),
    };
  }
}


