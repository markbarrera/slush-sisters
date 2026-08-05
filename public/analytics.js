/*
  Slush Sisters — analytics loader (PostHog) + cookie consent
  ============================================================

  This is the ONE place analytics is configured for the whole site, on purpose.

  COOKIE CONSENT — added 2026-08-05
  ---------------------------------
  A small banner asks first-time visitors whether to set tracking cookies. Their
  answer is saved in localStorage (not a cookie, so even "no" leaves nothing).
  If they decline, PostHog never loads, no cookie is set, and the banner stays
  quietly available via a link in the site footer. If they accept, tracking loads
  normally. Returning visitors who already chose are never asked again.

  This is not a full CMP — the site sets exactly one tracking cookie (PostHog)
  and controls all its own code, so a $30/month vendor widget would be overkill.
  It IS the visible privacy/cookie notice that was flagged as outstanding in
  docs/analytics.md, and it's the thing a lawyer would want to see before
  signing off on the COPPA posture.

  POSTURE — as of 2026-08-05 (decided by Mark)
  --------------------------------------------
  Track visitors as granularly as possible, WITH cookies, to power the business
  dashboard's per-customer funnel AND to build retargeting-grade audiences for
  when ads turn on. Concretely, on every page this file loads:

    - Cookies ON (durable cross-session identity, not just localStorage).
    - "Do Not Track" is NOT honored — DNT visitors are tracked too.
    - A person profile is built for EVERY visitor.
    - Heatmaps, dead clicks, and web-vitals capture are on.
    - UTM/referrer are captured automatically (PostHog sets $initial_utm_* person
      properties + utm on events), which is the attribution ads will need.
    - Each booking is stitched to its visitor via posthog.identify() in
      public/book.html, with a conversion value ($250 / $375) on the event.

  THE GAME / KID PAGES — changed 2026-08-05
  -----------------------------------------
  These pages USED to carry no analytics at all — the mechanism that kept a page
  a child plays from making the whole site "directed to children" under COPPA.
  Mark asked to see which games are popular, so they are now instrumented too:
  pageviews, a "game_opened" event, and cookies, so game popularity and
  cross-game navigation are visible.

  Two things about that, on the record:
    1. **Session recording is OFF on game pages** (see isGame below). Watching
       replays of individual children playing is the sharpest privacy exposure
       here and adds nothing to "which games are popular." To capture it anyway,
       set RECORD_GAMES = true below — a deliberate one-line change, not a
       default.
    2. This makes the site's COPPA posture a REAL open question, not a hedged
       one: it now sets tracking cookies on pages children use directly AND
       collects a child's home address on /book AND links the arcade from every
       page. A lawyer's review of this posture, and a visible privacy/cookie
       notice, are both outstanding (see docs/analytics.md).

  WHAT IS STILL MASKED, EVEN AT "MAXIMUM" GRANULARITY
  ---------------------------------------------------
  On /book, the three sensitive inputs (name, event address, phone/email) carry
  class "ph-no-capture" so the home address and phone a customer types are not
  duplicated into a third-party replay. The booking still records in full to your
  own inbox and database. If a new sensitive field is added to any form, give it
  "ph-no-capture" too.

  The POSTHOG_KEY below is the Slush Sisters project key. It is public by design —
  it ships in page source on every PostHog site — so it is safe to commit. To
  PAUSE all tracking, blank it out; the guard below then makes this file a no-op.
*/
(function () {
  "use strict";

  var RECORD_GAMES = false;

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";

  var NEVER = ["/party-play"];
  for (var n = 0; n < NEVER.length; n++) {
    if (path === NEVER[n] || path === NEVER[n] + ".html") return;
  }

  var GAMES = [
    "/play",
    "/slushie-playhouse",
    "/slushie-street",
    "/slushie-style",
    "/slushie-catch",
    "/slushie-guys",
    "/slush-rush"
  ];
  var isGame = false, gameSlug = "";
  for (var i = 0; i < GAMES.length; i++) {
    if (path === GAMES[i] || path === GAMES[i] + ".html") {
      isGame = true;
      gameSlug = GAMES[i].slice(1);
      break;
    }
  }

  var POSTHOG_KEY = "phc_yN1IDp6NIx4uANHzmtjlrFFbohdZdC8mZIbQ6hnKWZH";
  var POSTHOG_HOST = "https://us.i.posthog.com";

  if (POSTHOG_KEY.indexOf("phc_") !== 0) return;

  // --- Cookie consent -------------------------------------------------------
  // Stored in localStorage so even "no" sets no cookies. Three states:
  //   "yes"  — tracking loads normally
  //   "no"   — PostHog never loads, no cookies set
  //   absent — show the banner
  var CONSENT_KEY = "slush_cookie_consent";
  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (_) {}

  if (consent === "no") {
    // They said no. Expose a global so the footer "Cookie settings" link can
    // re-open the banner if they change their mind.
    window.slushResetConsent = function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
      location.reload();
    };
    return;
  }

  if (consent !== "yes") {
    showConsentBanner();
    return;
  }

  // consent === "yes" — load PostHog normally.
  loadPostHog();

  // --- Banner ---------------------------------------------------------------
  function showConsentBanner() {
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie notice");
    banner.innerHTML =
      '<div style="max-width:600px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<p style="flex:1;min-width:200px;margin:0;font-size:14px;line-height:1.4;">' +
          'We use cookies to see which pages are popular and how people find us. ' +
          'No personal info is shared. ' +
          '<a href="/privacy" style="color:inherit;text-decoration:underline;">Learn more</a>' +
        '</p>' +
        '<div style="display:flex;gap:8px;flex-shrink:0;">' +
          '<button id="cookie-yes" style="' +
            'background:#1a237e;color:#fff;border:none;padding:8px 18px;' +
            'border-radius:6px;font-size:14px;font-family:inherit;cursor:pointer;' +
          '">OK</button>' +
          '<button id="cookie-no" style="' +
            'background:transparent;color:#1a237e;border:1px solid #1a237e;' +
            'padding:8px 18px;border-radius:6px;font-size:14px;font-family:inherit;cursor:pointer;' +
          '">No thanks</button>' +
        '</div>' +
      '</div>';

    var s = banner.style;
    s.position = "fixed";
    s.bottom = "0";
    s.left = "0";
    s.right = "0";
    s.background = "#fff";
    s.borderTop = "1px solid #ddd";
    s.padding = "14px 20px";
    s.zIndex = "99999";
    s.boxShadow = "0 -2px 8px rgba(0,0,0,0.08)";
    s.fontFamily = "'DM Sans', sans-serif";

    function dismiss(answer) {
      try { localStorage.setItem(CONSENT_KEY, answer); } catch (_) {}
      banner.parentNode.removeChild(banner);
      if (answer === "yes") loadPostHog();
    }

    // Wait for the DOM to be ready, then append.
    function mount() {
      document.body.appendChild(banner);
      document.getElementById("cookie-yes").addEventListener("click", function () { dismiss("yes"); });
      document.getElementById("cookie-no").addEventListener("click", function () { dismiss("no"); });
    }

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  }

  // --- PostHog init (only runs after consent = "yes") ------------------------
  function loadPostHog() {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      persistence: "localStorage+cookie",
      disable_cookie: false,
      cross_subdomain_cookie: false,
      respect_dnt: false,
      person_profiles: "always",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      mask_all_text: false,
      enable_heatmaps: true,
      capture_dead_clicks: true,
      capture_performance: true,
      disable_session_recording: isGame ? !RECORD_GAMES : false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          email: true
        }
      }
    });

    if (isGame) {
      posthog.register({ surface: "game", game: gameSlug });
      posthog.capture("game_opened", { game: gameSlug });
    }

    window.slushResetConsent = function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
      if (window.posthog) posthog.opt_out_capturing();
      location.reload();
    };
  }
})();
