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
      textQuery: query,
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


