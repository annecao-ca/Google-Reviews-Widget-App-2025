import fetch from "cross-fetch";

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

export async function resolvePlaceIdFromText(
  query: string,
  apiKey: string
): Promise<PlaceSuggestion[] | null> {
  // --- Handle Google Maps URLs ---
  let effectiveQuery = query.trim();

  // Example: https://www.google.com/maps/place/FIRST+NAILS/@50.7035167,-113...
  if (effectiveQuery.startsWith("http")) {
    try {
      const url = new URL(effectiveQuery);

      // 1. Handle /maps/place/Business+Name/...
      if (url.pathname.includes("/maps/place/")) {
        const match = url.pathname.match(/\/maps\/place\/([^/]+)/);
        if (match && match[1]) {
          effectiveQuery = decodeURIComponent(match[1].replace(/\+/g, " "));
        }
      }
      // 2. Handle /maps/search/Business+Name/...
      else if (url.pathname.includes("/maps/search/")) {
        const match = url.pathname.match(/\/maps\/search\/([^/]+)/);
        if (match && match[1]) {
          effectiveQuery = decodeURIComponent(match[1].replace(/\+/g, " "));
        }
      }
      // 3. Handle query parameters (e.g., ?q=Business+Name)
      else if (url.searchParams.get("q")) {
        effectiveQuery = url.searchParams.get("q") || effectiveQuery;
      }

      console.log(`[placeResolver] Processed URL into query: "${effectiveQuery}"`);
    } catch (e) {
      console.warn("[placeResolver] Failed to parse URL, using raw query:", effectiveQuery);
    }
  }

  // Use Places API (New) - required by Google
  const url = "https://places.googleapis.com/v1/places:searchText";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
    },
    body: JSON.stringify({
      textQuery: effectiveQuery,
      maxResultCount: 5
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorData: any = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      // If not JSON, use raw text
    }

    console.error(`[placeResolver] HTTP ${res.status}:`, errorText);

    // Provide helpful error messages
    if (res.status === 403) {
      const reason = errorData?.error?.details?.[0]?.reason || errorData?.error?.status;
      if (reason === "API_KEY_SERVICE_BLOCKED" || errorData?.error?.status === "PERMISSION_DENIED") {
        throw new Error(
          "Places API (New) chưa được bật hoặc API key không có quyền. " +
          "Vui lòng: 1) Vào Google Cloud Console → APIs & Services → Library → tìm 'Places API (New)' và bật nó. " +
          "2) Kiểm tra API key có bị restrict quá chặt không."
        );
      }
    }

    throw new Error(
      `Google Places API (New) failed: ${res.status} ${res.statusText}. ` +
      `Chi tiết: ${errorData?.error?.message || errorText}`
    );
  }

  const data = await res.json();

  if (!data.places || !Array.isArray(data.places) || !data.places.length) {
    console.log(`[placeResolver] No places found for query: "${query}"`);
    return null;
  }

  return data.places.map((place: any) => ({
    placeId: place.id,
    name: place.displayName?.text || place.displayName || "Unknown",
    address: place.formattedAddress || "Address not available"
  }));
}


