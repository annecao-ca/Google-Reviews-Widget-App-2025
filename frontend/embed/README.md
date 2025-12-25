# Embed Widget

This folder stores the embeddable widget logic and loader snippet. Build the TypeScript `src/widget.ts` with `npm run build` if you need declarations.

### Usage

1. Host the compiled bundle (e.g., `dist/widget.js`) alongside `embed.js`.
2. Add the following snippet to customer websites:

```html
<div id="google-reviews-widget"></div>
<script src="https://your-cdn.example.com/widget.js" async></script>
<script defer src="https://your-cdn.example.com/embed.js" data-container-id="google-reviews-widget" data-backend="https://app.example.com"></script>
```

3. Customize colors via `data-*` attributes or modify `theme` inline.

`renderGoogleReviewWidget` is also exposed on `window` for clients who want custom initialization.

