/**
 * Comprehensive YouTube Ad-Blocking Engine for SadduTube / VidyoProApp
 * 
 * Features:
 * 1. Network & API Request Interception (fetch, XMLHttpRequest, ytInitialPlayerResponse)
 * 2. Aggressive CSS Shielding (permanently hides all ad containers, banners, overlays, promos)
 * 3. Real-Time Video Ad Skipping (auto-mute, 16x speed-up, duration jump, instant skip click)
 * 4. Popup & Mealbar Suppressor (auto-dismisses YouTube Premium & upsell banners)
 * 5. URL request filter for WebViews (rejects ad tracking domains)
 */

export const AD_BLOCK_CSS = `
/* Hide all YouTube Video Ad Overlays & Modules */
.video-ads,
.ytp-ad-module,
.ytp-ad-overlay-container,
.ytp-ad-overlay-slot,
.ytp-ad-message-container,
.ytp-ad-text,
.ytp-ad-preview-container,
.ytp-ad-image-overlay,
.ytp-ad-action-interstitial,
.ytp-ad-player-overlay,
.ytp-ad-player-overlay-flyout-cta,
.ytp-ad-progress-list,
.ytp-ad-button,
.ytp-ad-persistent-progress-bar-container,
.ytp-ad-timed-pie,
.ytp-ad-badge,
.badge-style-type-ad,
.ad-container,
.ad-showing,
.ad-interrupting,
#player-ads,
#player-ad,

/* Hide Mobile YouTube Promoted & Sponsored Elements */
ytm-promoted-video-renderer,
ytm-promoted-sparkles-web-renderer,
ytm-companion-ad-renderer,
ytm-ad-slot-renderer,
ytm-statement-banner-renderer,
ytm-search-ad-renderer,
ytm-brand-banner-carousel-renderer,
ytm-promoted-video-item,
ytm-mealbar-promo-renderer,
ytm-paid-content-overlay-renderer,
#panels ytm-ad-slot-renderer,

/* Hide Desktop / Tablet Promoted & Sponsored Elements */
ytd-promoted-video-renderer,
ytd-promoted-sparkles-web-renderer,
ytd-companion-slot-renderer,
ytd-ad-slot-renderer,
ytd-in-feed-ad-layout-renderer,
ytd-banner-promo-renderer,
ytd-statement-banner-renderer,
ytd-video-ad-renderer,
ytd-player-legacy-desktop-watch-ads-renderer,
ytd-action-companion-ad-renderer,
ytd-display-ad-renderer,
ytd-clarification-renderer,
ytd-ad-hover-text-button-renderer,
.ytd-ad-slot-renderer,

/* Hide Upsells and Promos */
yt-upsell-dialog-renderer,
ytd-popup-container:has(yt-upsell-dialog-renderer),
tp-yt-paper-dialog:has(#feedback),

/* Hide YouTube web Sign In buttons and prompts */
a[href*="/signin"],
a[href*="accounts.google.com"],
a[href*="ServiceLogin"],
[aria-label*="Sign in"],
[aria-label*="Sign In"],
ytm-pivot-bar-item-renderer:has(a[href*="signin"]),
ytm-header-bar a[href*="signin"],
ytm-header-bar a[href*="accounts.google.com"],
ytd-button-renderer:has(a[href*="signin"]),

/* Generic ad patterns */
[aria-label*="Sponsored"],
[aria-label*="sponsored"],
div[class*="ad-display"],
div[class*="ad-unit"],
div[class*="ad-slot"],
div[class*="sparkles-light"],
div[id*="ad-container"],
iframe[id*="ad-"],
iframe[src*="doubleclick.net"],
iframe[src*="googleads"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  pointer-events: none !important;
  border: none !important;
  overflow: hidden !important;
}
`;

/**
 * Script injected BEFORE any content loads (injectedJavaScriptBeforeContentLoaded).
 * Hooks into window.ytInitialPlayerResponse, monkey-patches fetch & XHR, and installs CSS shield early.
 */
export const AD_BLOCK_PRE_SCRIPT = `
(function() {
  if (window.__saddutube_adblock_pre_injected) return;
  window.__saddutube_adblock_pre_injected = true;

  // 1. Inject CSS Shield into document ASAP
  function injectStyle() {
    if (document.getElementById('saddutube-adblock-shield')) return;
    var style = document.createElement('style');
    style.id = 'saddutube-adblock-shield';
    style.textContent = ${JSON.stringify(AD_BLOCK_CSS)};
    (document.head || document.documentElement).appendChild(style);
  }

  injectStyle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyle);
  }

  // 2. Intercept window.ytInitialPlayerResponse before YouTube reads it
  var _ytInitialPlayerResponse;
  function cleanPlayerResponse(val) {
    if (val && typeof val === 'object') {
      try {
        delete val.adPlacements;
        delete val.playerAds;
        delete val.adSlots;
        delete val.adBreakHeartbeatParams;
      } catch (e) {}
    }
    return val;
  }

  try {
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
      configurable: true,
      enumerable: true,
      get: function() {
        return _ytInitialPlayerResponse;
      },
      set: function(val) {
        _ytInitialPlayerResponse = cleanPlayerResponse(val);
      }
    });
  } catch (e) {}

  // 3. Monkey-patch window.fetch to block ad domains & sanitize player API response
  if (window.fetch) {
    var originalFetch = window.fetch;
    window.fetch = function(input, init) {
      var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      
      // Completely block requests to known ad networks & tracking endpoints
      if (
        url.indexOf('googleads') !== -1 ||
        url.indexOf('doubleclick.net') !== -1 ||
        url.indexOf('/pagead/') !== -1 ||
        url.indexOf('/api/stats/ads') !== -1 ||
        url.indexOf('adservice.google') !== -1 ||
        url.indexOf('/ptracking') !== -1
      ) {
        return Promise.resolve(new Response('', { status: 204, statusText: 'No Content' }));
      }

      // If YouTube player info request, sanitize JSON response to strip ad slots
      if (url.indexOf('/youtubei/v1/player') !== -1) {
        return originalFetch.apply(this, arguments).then(function(response) {
          return response.clone().text().then(function(text) {
            try {
              var json = JSON.parse(text);
              cleanPlayerResponse(json);
              var modified = JSON.stringify(json);
              return new Response(modified, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
            } catch (err) {
              return response;
            }
          });
        });
      }

      return originalFetch.apply(this, arguments);
    };
  }

  // 4. Monkey-patch XMLHttpRequest to block ad endpoints & sanitize player response
  if (window.XMLHttpRequest) {
    var originalOpen = window.XMLHttpRequest.prototype.open;
    var originalSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function(method, url) {
      this.__adblock_url = url;
      if (typeof url === 'string') {
        if (
          url.indexOf('googleads') !== -1 ||
          url.indexOf('doubleclick.net') !== -1 ||
          url.indexOf('/pagead/') !== -1 ||
          url.indexOf('/api/stats/ads') !== -1 ||
          url.indexOf('adservice.google') !== -1 ||
          url.indexOf('/ptracking') !== -1
        ) {
          this.__adblock_abort = true;
        }
      }
      return originalOpen.apply(this, arguments);
    };

    window.XMLHttpRequest.prototype.send = function() {
      if (this.__adblock_abort) {
        var self = this;
        setTimeout(function() {
          try {
            self.abort();
          } catch (e) {}
        }, 0);
        return;
      }
      return originalSend.apply(this, arguments);
    };
  }
})();
true;
`;

/**
 * Script injected on load (injectedJavaScript).
 * Executes real-time video ad skipper, MutationObserver DOM cleaner, and promo banner auto-closer.
 */
export const AD_BLOCK_POST_SCRIPT = `
(function() {
  if (window.__saddutube_adblock_post_injected) return;
  window.__saddutube_adblock_post_injected = true;

  // Re-verify CSS shield
  if (!document.getElementById('saddutube-adblock-shield')) {
    var style = document.createElement('style');
    style.id = 'saddutube-adblock-shield';
    style.textContent = ${JSON.stringify(AD_BLOCK_CSS)};
    (document.head || document.documentElement).appendChild(style);
  }

  var wasAdPlaying = false;
  var previousVolume = 1;
  var previousMuted = false;

  // Real-time video ad skipper function
  function processVideoAds() {
    try {
      var moviePlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      var video = document.querySelector('video');

      var isAdShowing = false;
      if (moviePlayer && (
        moviePlayer.classList.contains('ad-showing') ||
        moviePlayer.classList.contains('ad-interrupting')
      )) {
        isAdShowing = true;
      }

      var adOverlay = document.querySelector('.ytp-ad-player-overlay, .ytp-ad-module:not(:empty)');
      if (adOverlay) {
        isAdShowing = true;
      }

      if (isAdShowing) {
        if (!wasAdPlaying) {
          wasAdPlaying = true;
          if (video) {
            previousVolume = video.volume;
            previousMuted = video.muted;
          }
        }

        // 1. Immediately mute ad audio so user hears nothing
        if (video) {
          video.muted = true;
          video.playbackRate = 16.0;

          // 2. Jump video directly to the end of the ad
          if (isFinite(video.duration) && video.duration > 0) {
            video.currentTime = Math.max(0, video.duration - 0.05);
          }
        }

        // 3. Trigger YouTube's internal player skipAd API if available
        if (moviePlayer && typeof moviePlayer.skipAd === 'function') {
          moviePlayer.skipAd();
        }

        // 4. Click all known skip button variations
        var skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, ' +
          '.ytp-ad-skip-button-slot button, button.ytm-skip-ad-button, ' +
          '[class*="skip-button"], [id*="skip-button"], .ytp-ad-overlay-close-button'
        );
        for (var i = 0; i < skipButtons.length; i++) {
          try {
            skipButtons[i].click();
          } catch (e) {}
        }
      } else if (wasAdPlaying) {
        // Ad has completed: restore normal playback speed and unmute
        wasAdPlaying = false;
        if (video) {
          video.playbackRate = 1.0;
          video.muted = previousMuted;
          video.volume = previousVolume;
          if (video.paused) {
            video.play().catch(function() {});
          }
        }
      }

      // Dismiss "Try YouTube Premium" and mealbar promotional popups
      var mealbar = document.querySelector('ytm-mealbar-promo-renderer, yt-upsell-dialog-renderer');
      if (mealbar) {
        var dismissBtn = mealbar.querySelector('button[class*="dismiss"], .yt-spec-button-shape-next--text, [aria-label*="Dismiss"], [aria-label*="dismiss"]');
        if (dismissBtn) {
          dismissBtn.click();
        } else {
          mealbar.remove();
        }
      }

      // Remove any ad DOM nodes from the tree
      var adElements = document.querySelectorAll(
        'ytm-promoted-video-renderer, ytm-promoted-sparkles-web-renderer, ' +
        'ytm-companion-ad-renderer, ytm-ad-slot-renderer, ' +
        'ytd-promoted-video-renderer, ytd-promoted-sparkles-web-renderer, ' +
        'ytd-companion-slot-renderer, ytd-ad-slot-renderer, ' +
        '.video-ads, .ytp-ad-module'
      );
      for (var j = 0; j < adElements.length; j++) {
        try {
          adElements[j].remove();
        } catch (e) {}
      }
    } catch (err) {}
  }

  // Run fast polling loop for instant reaction to video ad cue points
  setInterval(processVideoAds, 150);

  // MutationObserver to capture dynamically injected ad nodes immediately
  var observer = new MutationObserver(function() {
    processVideoAds();
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
true;
`;

/**
 * Combined Ad-Blocking Script for embedded players or standard single-script WebViews
 */
export const COMBINED_AD_BLOCK_SCRIPT = `
${AD_BLOCK_PRE_SCRIPT}
${AD_BLOCK_POST_SCRIPT}
true;
`;

/**
 * Checks whether a URL is an ad tracking or ad network URL that should be blocked.
 */
export function isBlockedAdUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();

  return (
    lower.includes('googleads.g.doubleclick.net') ||
    lower.includes('pagead2.googlesyndication.com') ||
    lower.includes('adservice.google.com') ||
    lower.includes('static.doubleclick.net') ||
    lower.includes('ad.doubleclick.net') ||
    lower.includes('/api/stats/ads') ||
    lower.includes('/pagead/') ||
    lower.includes('/ptracking')
  );
}
