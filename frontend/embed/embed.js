(function () {
  const script = document.currentScript;
  const containerId = script?.getAttribute("data-container-id") ?? "google-reviews-widget";
  const backendUrl = script?.getAttribute("data-backend");
  const widgetId = script?.getAttribute("data-widget-id") || undefined;
  const theme = {
    primary: script?.getAttribute("data-primary"),
    background: script?.getAttribute("data-background"),
    accent: script?.getAttribute("data-accent")
  };

  const options = {
    containerId,
    backendUrl,
    title: script?.getAttribute("data-title"),
    theme,
    widgetId
  };

  if (!window.renderGoogleReviewWidget) {
    console.warn("renderGoogleReviewWidget chưa được nạp, kiểm tra lại build của widget.");
    return;
  }

  window.renderGoogleReviewWidget(options);
})();

