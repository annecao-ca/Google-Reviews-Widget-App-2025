export interface Review {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    time: number;
    relativeTimeDescription: string;
    profilePhotoUrl?: string;
    language?: string;
}
export interface ReviewInsight {
    reviewId: string;
    sentiment: "positive" | "neutral" | "negative";
    summary: string;
    highlights: string[];
}
export interface ReviewSummary {
    placeId: string;
    totalReviews: number;
    averageRating: number;
    recentInsights: ReviewInsight[];
    lastSyncedAt: string;
}
