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
  reviews: Review[];
  recentInsights: ReviewInsight[];
  lastSyncedAt: string;
}

export interface WidgetSettings {
  layout: "grid" | "list" | "carousel" | "masonry" | "badge" | "floating";
  theme: "light" | "dark";
  primaryColor: string;
  showHeader: boolean;
  showRating: boolean;
  showReviews: boolean;
  showAiSummary: boolean;
  showDate: boolean;
  showAuthorPhoto: boolean;
  cardStyle: "flat" | "shadow" | "outline";
  borderRadius: number;
  fontSize: number;
}

export interface WidgetConfig {
  id: string;
  placeId: string;
  businessName: string;
  title: string;
  settings: WidgetSettings;
}



