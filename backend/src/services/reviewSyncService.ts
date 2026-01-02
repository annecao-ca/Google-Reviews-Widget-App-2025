import { fetchReviewsFromGoogle } from "./googleReviews";
import { summarizeReviews } from "./reviewSummarizer";
import { ReviewStore } from "./reviewStore";
import { ReviewSummary, ReviewInsight, Review } from "../../../shared/types";

export class ReviewSyncService {
  private readonly store = new ReviewStore();

  constructor(
    private placeId: string,
    private apiKey: string,
    private widgetId: string
  ) { }

  async sync(): Promise<{ syncedReviews: number; insightsGenerated: number; totalReviews?: number }> {
    console.log(`[ReviewSyncService] Starting sync for widget: ${this.widgetId}, placeId: ${this.placeId}`);
    const { reviews, totalReviews } = await fetchReviewsFromGoogle(this.placeId, this.apiKey);
    console.log(`[ReviewSyncService] Fetched ${reviews.length} reviews from Google${totalReviews ? `, total reviews: ${totalReviews}` : ''}`);

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
    await this.store.persist(this.placeId, reviews, insights, totalReviews);
    console.log(`[ReviewSyncService] Sync completed successfully`);

    return {
      syncedReviews: reviews.length,
      insightsGenerated: insights.length,
      totalReviews,
    };
  }

  async getSummary(settings?: any): Promise<ReviewSummary | null> {
    console.log(`[ReviewSyncService] Loading summary for placeId: ${this.placeId} with settings:`, settings);
    // Fetch latest total reviews from Google API
    let googleTotalReviews: number | undefined;
    try {
      const { totalReviews } = await fetchReviewsFromGoogle(this.placeId, this.apiKey);
      googleTotalReviews = totalReviews;
    } catch (err) {
      console.warn(`[ReviewSyncService] Failed to fetch total reviews from Google, using cached value:`, err);
    }
    return this.store.loadSummary(this.placeId, settings, googleTotalReviews);
  }
}


