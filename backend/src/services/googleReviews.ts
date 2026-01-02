import fetch from "cross-fetch";
import { Review } from "../../../shared/types";
import { normalizeGoogleReview } from "../models/review";

// Use Places API (New)
const MAX_PAGE_COUNT = 3;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(
  placeId: string,
  apiKey: string,
  pageToken?: string
): Promise<{ reviews: Review[]; nextPageToken?: string; totalReviews?: number }> {
  // Places API (New) endpoint - get place details with reviews
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews,id,displayName,userRatingCount,rating"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData: any = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      // If not JSON, use raw text
    }
    
    console.error(`[googleReviews] HTTP ${response.status}:`, errorText);
    
    // Provide helpful error message
    if (response.status === 403) {
      throw new Error(
        "Places API (New) chưa được bật hoặc API key không có quyền. " +
        "Vui lòng kiểm tra Places API (New) đã được enable chưa."
      );
    }
    
    throw new Error(
      `Google Places API (New) error: ${response.status} ${response.statusText}. ` +
      `Chi tiết: ${errorData?.error?.message || errorText}`
    );
  }

  const payload = await response.json();
  
  // Places API (New) structure - reviews might be in different format
  let rawReviews: Array<Record<string, unknown>> = [];
  
  if (Array.isArray(payload.reviews)) {
    rawReviews = payload.reviews;
  } else if (payload.reviews?.reviews && Array.isArray(payload.reviews.reviews)) {
    rawReviews = payload.reviews.reviews;
  }
  
  const reviews = rawReviews.map(normalizeGoogleReview);
  
  // Get total reviews count from Google API
  const totalReviews = payload.userRatingCount || payload.ratingSummary?.userRatingCount || undefined;
  
  return {
    reviews,
    nextPageToken: undefined, // Places API (New) pagination handled differently
    totalReviews: totalReviews ? Number(totalReviews) : undefined
  };
}

export async function fetchReviewsFromGoogle(placeId: string, apiKey: string): Promise<{ reviews: Review[]; totalReviews?: number }> {
  const reviews: Review[] = [];
  let totalReviews: number | undefined;
  
  try {
    const { reviews: pageReviews, totalReviews: fetchedTotal } = await fetchPage(placeId, apiKey);
    reviews.push(...pageReviews);
    totalReviews = fetchedTotal;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    throw error;
  }

  return { reviews, totalReviews };
}

