import { ReviewSummary, WidgetConfig } from "@shared/types";

declare global {
  interface Window {
    __GWR_BACKEND_BASE?: string;
  }
}

export interface WidgetOptions {
  containerId: string;
  backendUrl?: string;
  widgetId: string;
}

export async function renderGoogleReviewWidget(options: WidgetOptions) {
  const { containerId, backendUrl: providedBackend, widgetId } = options;
  const container = document.getElementById(containerId);
  if (!container) return;

  const backendUrl = providedBackend ?? window.__GWR_BACKEND_BASE ?? "http://localhost:5001";

  container.innerHTML = `<div class="gwr-loading">Loading reviews...</div>`;

  try {
    const widgetRes = await fetch(`${backendUrl}/api/widgets/${widgetId}`);
    if (!widgetRes.ok) throw new Error("Failed to load widget config");
    const { widget }: { widget: WidgetConfig } = await widgetRes.json();

    const summaryRes = await fetch(`${backendUrl}/api/widgets/${widgetId}/summary`);
    if (!summaryRes.ok) throw new Error("Failed to load reviews");
    const summary: ReviewSummary = await summaryRes.json();

    const { settings } = widget;

    container.innerHTML = `
      <div class="gwr-widget gwr-theme-${settings.theme} gwr-layout-${settings.layout} gwr-style-${settings.cardStyle}" 
           style="--gwr-primary: ${settings.primaryColor}; --gwr-radius: ${settings.borderRadius}px; --gwr-fs: ${settings.fontSize}px;">
        
        ${settings.showHeader ? `
          <header class="gwr-header">
            <div class="gwr-header-main">
              <div class="gwr-google-logo">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div class="gwr-header-info">
                <h3>${widget.title}</h3>
                <div class="gwr-header-rating">
                  ${settings.showRating ? `
                    <span class="gwr-rating-value">${summary.averageRating.toFixed(1)}</span>
                    <div class="gwr-stars">
                      ${renderStars(summary.averageRating, 16)}
                    </div>
                  ` : ""}
                  <span class="gwr-total-count">${summary.totalReviews} ${summary.totalReviews === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${widget.placeId}" target="_blank" class="gwr-write-btn">
              Write a Review
            </a>
          </header>
        ` : ""}

        ${false && settings.showAiSummary && summary.recentInsights.length > 0 ? `
          <div class="gwr-ai-summary">
            <div class="gwr-ai-badge">AI Analysis</div>
            <p>${summary.recentInsights[0].summary}</p>
          </div>
        ` : ""}

        <div class="gwr-reviews-container">
          ${summary.reviews.map(review => {
            // Create Google Maps link to the place (reviews section)
            const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${widget.placeId}`;
            return `
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="gwr-review-card-link">
              <div class="gwr-review-card">
                <div class="gwr-review-header">
                  ${settings.showAuthorPhoto ? `<img src="${review.profilePhotoUrl || 'https://www.gravatar.com/avatar/000?d=mp'}" class="gwr-author-img" />` : ""}
                  <div class="gwr-author-info">
                    <div class="gwr-author-name">
                      ${review.authorName}
                      <span class="gwr-verified-badge">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      </span>
                    </div>
                    <div class="gwr-review-meta">
                      <div class="gwr-stars-small">${renderStars(review.rating, 12)}</div>
                      ${settings.showDate ? `<span class="gwr-date">${new Date(review.time * 1000).toLocaleDateString()}</span>` : ""}
                    </div>
                  </div>
                  <div class="gwr-google-icon-sml">
                     <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                </div>
                <p class="gwr-review-text">${review.text || "No feedback text provided."}</p>
              </div>
            </a>
          `;
          }).join("")}
        </div>

        <footer class="gwr-footer">
          Powered by Review Studio
        </footer>
      </div>
    `;

    injectStyles();
  } catch (error) {
    container.innerHTML = `<div class="gwr-error">Error: ${(error as Error).message}</div>`;
  }
}

function renderStars(rating: number, size: number) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.floor(rating) ? "#FFC107" : "#E0E0E0";
    stars += `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }
  return stars;
}

function injectStyles() {
  if (document.getElementById("gwr-styles-v2")) return;
  const style = document.createElement("style");
  style.id = "gwr-styles-v2";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    .gwr-widget {
      font-family: 'Inter', -apple-system, sans-serif;
      border-radius: var(--gwr-radius);
      overflow: hidden;
      font-size: var(--gwr-fs);
    }

    .gwr-theme-light { background: #fff; color: #1a1a1b; }
    .gwr-theme-dark { background: #15171c; color: #f5f5f5; }

    .gwr-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(128,128,128,0.1); }
    .gwr-header-main { display: flex; gap: 16px; align-items: center; }
    .gwr-header-info h3 { margin: 0; font-weight: 800; font-size: 1.25em; }
    .gwr-header-rating { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .gwr-rating-value { font-weight: 800; }
    .gwr-total-count { font-size: 0.8em; opacity: 0.5; font-weight: 600; text-transform: uppercase; }

    .gwr-write-btn {
      padding: 10px 20px;
      background: var(--gwr-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--gwr-radius);
      font-weight: 700;
      font-size: 0.9em;
      box-shadow: 0 4px 12px var(--gwr-primary)40;
    }

    .gwr-ai-summary { margin: 24px; padding: 20px; background: var(--gwr-primary)10; border-radius: var(--gwr-radius); border: 1px solid var(--gwr-primary)20; }
    .gwr-ai-badge { display: inline-block; padding: 2px 8px; background: var(--gwr-primary); color: white; border-radius: 4px; font-size: 0.7em; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
    .gwr-ai-summary p { margin: 0; font-weight: 600; line-height: 1.4; }

    .gwr-reviews-container { 
      padding: 24px; 
      display: grid; 
      gap: 20px; 
    }

    .gwr-layout-grid { }
    .gwr-layout-grid .gwr-reviews-container { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .gwr-layout-list .gwr-reviews-container { grid-template-columns: 1fr; }
    .gwr-layout-carousel .gwr-reviews-container { display: flex; overflow-x: auto; scrollbar-width: none; }
    .gwr-layout-carousel .gwr-review-card { flex: 0 0 300px; }

    .gwr-review-card-link {
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .gwr-review-card-link:hover {
      transform: translateY(-2px);
    }
    .gwr-review-card-link:hover .gwr-review-card {
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .gwr-review-card {
      padding: 20px;
      border-radius: var(--gwr-radius);
      border: 1px solid rgba(128,128,128,0.1);
      background: rgba(128,128,128,0.02);
      cursor: pointer;
    }
    .gwr-style-shadow .gwr-review-card { box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    
    .gwr-review-header { display: flex; gap: 12px; align-items: center; position: relative; }
    .gwr-author-img { width: 44px; height: 44px; border-radius: 50%; }
    .gwr-author-info { flex: 1; }
    .gwr-author-name { font-weight: 700; display: flex; align-items: center; gap: 4px; }
    .gwr-verified-badge { color: #4285F4; }
    .gwr-review-meta { display: flex; items-center: center; gap: 8px; margin-top: 2px; }
    .gwr-date { font-size: 0.8em; opacity: 0.5; }
    .gwr-google-icon-sml { position: absolute; top: 0; right: 0; opacity: 0.2; }

    .gwr-review-text { margin: 16px 0 0; line-height: 1.6; opacity: 0.8; }

    .gwr-footer { padding: 16px; text-align: center; font-size: 0.7em; font-weight: 700; opacity: 0.3; text-transform: uppercase; }
  `;
  document.head.appendChild(style);
}

if (typeof window !== "undefined") {
  (window as any).renderGoogleReviewWidget = renderGoogleReviewWidget;
}
