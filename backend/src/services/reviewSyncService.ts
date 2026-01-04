import { fetchReviewsFromGoogle } from "./googleReviews";
import { summarizeReviews } from "./reviewSummarizer";
import { ReviewStore } from "./reviewStore";
import { ReviewSummary, ReviewInsight } from "../../../shared/types";
import { prisma } from "../lib/prisma";

export class ReviewSyncService {
  private readonly store = new ReviewStore();

  constructor(
    private placeId: string,
    private apiKey: string,
    private widgetId: string
  ) { }

  async sync(): Promise<{ syncedReviews: number; insightsGenerated: number }> {
    console.log(`[ReviewSyncService] Starting sync for widget: ${this.widgetId}, placeId: ${this.placeId}`);
    const { reviews, rating, userRatingCount } = await fetchReviewsFromGoogle(this.placeId, this.apiKey);
    console.log(`[ReviewSyncService] Fetched ${reviews.length} reviews from Google`);
    console.log(`[ReviewSyncService] Google rating: ${rating}, total reviews: ${userRatingCount}`);

    // Update Widget with Google rating and review count
    const { WidgetStore } = await import("./widgetStore");
    const widgetStore = new WidgetStore();
    try {
      await widgetStore.updatePlaceStats(this.widgetId, rating, userRatingCount);
      console.log(`[ReviewSyncService] Updated widget with Google stats: rating=${rating}, count=${userRatingCount}`);
    } catch (err) {
      console.error("[ReviewSyncService] Failed to update widget stats:", err);
    }

    let insights: ReviewInsight[] = [];
    try {
      if (reviews.length > 0) {
        console.log(`[ReviewSyncService] Generating AI insights for ${reviews.length} reviews...`);
        insights = await summarizeReviews(reviews, this.apiKey);
        console.log(`[ReviewSyncService] Generated ${insights.length} insights`);
      }
    } catch (err) {
      console.error("[ReviewSyncService] AI Summarization failed:", err);
    }

    console.log(`[ReviewSyncService] Persisting ${reviews.length} reviews to DB using placeId: ${this.placeId}...`);
    await this.store.persist(this.placeId, reviews, insights);
    console.log(`[ReviewSyncService] Sync completed successfully`);

    return {
      syncedReviews: reviews.length,
      insightsGenerated: insights.length,
    };
  }

  async getSummary(settings?: any): Promise<ReviewSummary | null> {
    console.log(`[ReviewSyncService] Loading summary for placeId: ${this.placeId} with settings:`, settings);
    // Get widget to get Google rating and review count
    const { WidgetStore } = await import("./widgetStore");
    const widgetStore = new WidgetStore();
    const widget = await prisma.widget.findUnique({
      where: { id: this.widgetId },
      select: { googleRating: true, googleReviewCount: true }
    });
    
    return this.store.loadSummary(this.placeId, settings, widget?.googleRating, widget?.googleReviewCount);
  }
}


