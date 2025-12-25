import { Review } from "../../../shared/types";

export function normalizeGoogleReview(raw: any): Review {
  // Handle Places API (New) format
  const author = raw.authorAttribution;
  const textObj = raw.text;

  const authorName = author?.displayName || raw.author_name || raw.authorName || "Unknown";
  const text = textObj?.text || raw.text || "";
  const profilePhotoUrl = author?.photoUri || raw.profile_photo_url || raw.profilePhotoUrl;

  // Rating and Time
  const rating = Number(raw.rating || 0);

  // Time handling: New API uses ISO string 'publishTime', old API uses unix seconds 'time'
  let unixTime = 0;
  if (raw.publishTime) {
    unixTime = Math.floor(new Date(raw.publishTime).getTime() / 1000);
  } else {
    unixTime = Number(raw.time || Math.floor(Date.now() / 1000));
  }

  return {
    id: String(raw.name || raw.reviewId || raw.time || `${authorName}-${unixTime}`),
    authorName,
    rating,
    text,
    time: unixTime,
    relativeTimeDescription: raw.relativePublishTimeDescription || raw.relative_time_description || "",
    profilePhotoUrl: typeof profilePhotoUrl === "string" ? profilePhotoUrl : undefined,
    language: raw.language || textObj?.languageCode
  };
}

