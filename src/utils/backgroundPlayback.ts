/**
 * Background Playback & Lock-Screen Media Controls Engine for SadduTube
 *
 * 1. Page Visibility Spoofing (bypasses YouTube's background pause)
 * 2. Event Interception (blocks visibilitychange & blur propagation)
 * 3. MediaSession API (lock-screen notifications, artwork, play/pause/seek controls)
 * 4. Automatic background playback protection
 */

export const BACKGROUND_PLAYBACK_PRE_SCRIPT = `
(function() {
  if (window.__saddutube_bg_pre_injected) return;
  window.__saddutube_bg_pre_injected = true;

  // 1. Spoof Page Visibility API so YouTube believes the page is always focused and visible
  try {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      enumerable: true,
      get: function() { return false; }
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      enumerable: true,
      get: function() { return 'visible'; }
    });
    Object.defineProperty(document, 'webkitVisibilityState', {
      configurable: true,
      enumerable: true,
      get: function() { return 'visible'; }
    });
    Object.defineProperty(document, 'hasFocus', {
      configurable: true,
      enumerable: true,
      value: function() { return true; }
    });
  } catch (e) {}

  // 2. Block visibilitychange and blur events from reaching YouTube's scripts in capture phase
  ['visibilitychange', 'webkitvisibilitychange'].forEach(function(evtName) {
    document.addEventListener(evtName, function(e) {
      e.stopImmediatePropagation();
    }, true);
    window.addEventListener(evtName, function(e) {
      e.stopImmediatePropagation();
    }, true);
  });

  window.addEventListener('blur', function(e) {
    e.stopImmediatePropagation();
  }, true);

  // 3. User-pause tracking to differentiate intentional user pauses from automatic background pauses
  window.__saddutube_user_paused = false;
  var lastUserInteraction = 0;

  ['touchstart', 'mousedown', 'pointerdown', 'keydown'].forEach(function(type) {
    window.addEventListener(type, function() {
      lastUserInteraction = Date.now();
    }, true);
  });

  // Track intentional pause clicks
  function hookVideoForBackground(video) {
    if (video.__saddutube_bg_hooked) return;
    video.__saddutube_bg_hooked = true;

    video.addEventListener('pause', function() {
      var isRecentInteraction = (Date.now() - lastUserInteraction) < 600;
      if (isRecentInteraction) {
        window.__saddutube_user_paused = true;
      } else if (!window.__saddutube_user_paused) {
        // Automatic pause triggered by background or lock-screen -> instantly resume!
        setTimeout(function() {
          if (!window.__saddutube_user_paused && video.paused) {
            video.play().catch(function() {});
          }
        }, 80);
      }
    });

    video.addEventListener('play', function() {
      window.__saddutube_user_paused = false;
    });
  }

  function scanVideos() {
    var vids = document.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) {
      hookVideoForBackground(vids[i]);
    }
  }

  setInterval(scanVideos, 1000);
})();
true;
`;

export const BACKGROUND_PLAYBACK_POST_SCRIPT = `
(function() {
  if (window.__saddutube_bg_post_injected) return;
  window.__saddutube_bg_post_injected = true;

  function extractVideoId(url) {
    if (!url) return null;
    var m = url.match(/(?:watch\\?v=|shorts\\/|youtu\\.be\\/|embed\\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function getCleanTitle() {
    var rawTitle = document.title || '';
    var el = document.querySelector('h1.slim-video-metadata-title, h1.title.style-scope.ytd-watch-metadata, #title h1 yt-formatted-string, ytm-slim-video-metadata .title');
    if (el && el.textContent && el.textContent.trim()) {
      rawTitle = el.textContent.trim();
    }
    return rawTitle.replace(/\\s*-\\s*YouTube$/i, '').trim() || 'YouTube Video';
  }

  function getChannelTitle() {
    var el = document.querySelector('#owner-name, ytm-slim-owner-renderer .owner-name, ytd-channel-name yt-formatted-string, .slim-owner-channel-name, .ytm-channel-thumbnail-with-name .channel-name');
    return el && el.textContent ? el.textContent.trim() : 'SadduTube';
  }

  var currentVideoId = null;
  var currentMediaTitle = '';

  // Setup navigator.mediaSession for OS Lock-Screen controls
  function updateLockScreenMediaSession() {
    if (!('mediaSession' in navigator)) return;

    var video = document.querySelector('video');
    var vId = extractVideoId(window.location.href);
    var title = getCleanTitle();
    var channel = getChannelTitle();

    if (vId !== currentVideoId || title !== currentMediaTitle) {
      currentVideoId = vId;
      currentMediaTitle = title;

      var artwork = [];
      if (vId) {
        artwork = [
          { src: 'https://img.youtube.com/vi/' + vId + '/hqdefault.jpg', sizes: '480x360', type: 'image/jpeg' },
          { src: 'https://img.youtube.com/vi/' + vId + '/maxresdefault.jpg', sizes: '1280x720', type: 'image/jpeg' }
        ];
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: channel,
        album: 'SadduTube Player',
        artwork: artwork
      });
    }

    if (video) {
      navigator.mediaSession.playbackState = video.paused ? 'paused' : 'playing';

      if ('setPositionState' in navigator.mediaSession && isFinite(video.duration) && video.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: video.duration,
            playbackRate: video.playbackRate || 1.0,
            position: Math.min(video.currentTime, video.duration)
          });
        } catch (e) {}
      }
    }
  }

  // Register Lock-Screen Action Handlers
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', function() {
        window.__saddutube_user_paused = false;
        var video = document.querySelector('video');
        if (video) video.play().catch(function() {});
      });

      navigator.mediaSession.setActionHandler('pause', function() {
        window.__saddutube_user_paused = true;
        var video = document.querySelector('video');
        if (video) video.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', function(details) {
        var video = document.querySelector('video');
        var offset = (details && details.seekOffset) || 10;
        if (video) video.currentTime = Math.max(0, video.currentTime - offset);
      });

      navigator.mediaSession.setActionHandler('seekforward', function(details) {
        var video = document.querySelector('video');
        var offset = (details && details.seekOffset) || 10;
        if (video && isFinite(video.duration)) {
          video.currentTime = Math.min(video.duration, video.currentTime + offset);
        }
      });

      navigator.mediaSession.setActionHandler('seekto', function(details) {
        var video = document.querySelector('video');
        if (video && details && details.seekTime !== undefined) {
          video.currentTime = details.seekTime;
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', function() {
        var moviePlayer = document.getElementById('movie_player');
        if (moviePlayer && typeof moviePlayer.previousVideo === 'function') {
          moviePlayer.previousVideo();
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', function() {
        var moviePlayer = document.getElementById('movie_player');
        if (moviePlayer && typeof moviePlayer.nextVideo === 'function') {
          moviePlayer.nextVideo();
        }
      });
    } catch (e) {}
  }

  // Update MediaSession periodically and on video events
  setInterval(updateLockScreenMediaSession, 1200);

  function hookVideoEvents() {
    var video = document.querySelector('video');
    if (video && !video.__saddutube_ms_hooked) {
      video.__saddutube_ms_hooked = true;
      video.addEventListener('play', updateLockScreenMediaSession);
      video.addEventListener('playing', updateLockScreenMediaSession);
      video.addEventListener('pause', updateLockScreenMediaSession);
      video.addEventListener('timeupdate', function() {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = video.paused ? 'paused' : 'playing';
        }
      });
    }
  }

  setInterval(hookVideoEvents, 1500);
})();
true;
`;

export const COMBINED_BACKGROUND_PLAYBACK_SCRIPT = `
${BACKGROUND_PLAYBACK_PRE_SCRIPT}
${BACKGROUND_PLAYBACK_POST_SCRIPT}
true;
`;
