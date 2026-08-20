/*
  Slush Sisters — analytics loader (PostHog) + cookie consent
  ============================================================

  This is the ONE place analytics is configured for the whole site, on purpose.

  COOKIE CONSENT — added 2026-08-05, reworked for US-law fit 2026-08-20
  ---------------------------------------------------------------------
  A small banner asks first-time visitors whether to set tracking cookies. Their
  answer is saved in localStorage (not a cookie, so even "no" leaves nothing).
  If they decline, PostHog never loads, no cookie is set, and the banner stays
  quietly available via the "Cookie settings" link in the site footer. If they
  accept, tracking loads normally. Returning visitors who already chose are
  never asked again.

  The 2026-08-20 rework (see docs/privacy-compliance.md for the full law-by-law
  reasoning):
    - The banner copy is now literally true. The old text said "No personal
      info is shared" — but PostHog receives device data, coarse location, and
      session replays, and builds a profile per visitor. A false statement in a
      privacy notice is an FTC Act problem at ANY business size, so the copy
      now says what actually happens and links to /privacy for the rest.
    - /privacy actually exists now (it was a 404 before) and the footer
      "Cookie settings" link is real on every page with a footer (it was
      documented but never added).
    - GLOBAL PRIVACY CONTROL (GPC) is honored: a browser sending
      navigator.globalPrivacyControl is treated as "no" without nagging them
      with the banner. GPC is NOT the old DNT header — DNT never had legal
      force and Mark's decision to ignore it stands; GPC is the specific
      opt-out signal that California (CPPA regs), Colorado, and Texas's TDPSA
      universal-opt-out provision give legal force to. Honoring it is what
      "compliant as laws evolve" looks like, and it costs almost no traffic.
      A GPC visitor can still opt IN explicitly: the footer Cookie settings
      link opens the banner, and an explicit stored "yes" wins over GPC.
    - Declining (or re-opening settings after accepting) now also DELETES the
      PostHog cookie + localStorage it left behind, so "no" really means
      nothing remains — that's the CCPA/TDPSA notion of opt-out, not just
      "stop collecting."
    - Banner buttons are 44px tall (the site's own mobile tap-target rule).

  This is still not a vendor CMP — the site sets exactly one tracking cookie
  (PostHog) and controls all its own code, so a $30/month widget remains
  overkill. What a CMP would add (and when that changes) is written down in
  docs/privacy-compliance.md.

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

  // --- First-party visit journey (sessionStorage, NO cookie, NO IP) ---------
  // Records where this visit came from and the pages seen this session, so a
  // booking can be attributed to a source and path. Marketing pages only (the
  // game/kids guard above already returned). Cleared when the browser closes.
  try {
    var JKEY = "ss_journey";
    var j = JSON.parse(sessionStorage.getItem(JKEY) || "null");
    if (!j) {
      var qs = new URLSearchParams(location.search);
      j = {
        landing: path,
        referrer: (document.referrer || "").slice(0, 300),
        utm_source: (qs.get("utm_source") || "").slice(0, 120),
        utm_medium: (qs.get("utm_medium") || "").slice(0, 120),
        utm_campaign: (qs.get("utm_campaign") || "").slice(0, 120),
        started: new Date().toISOString(),
        pages: [],
      };
    }
    if (j.pages[j.pages.length - 1] !== path) j.pages.push(path);
    if (j.pages.length > 40) j.pages = j.pages.slice(-40);
    sessionStorage.setItem(JKEY, JSON.stringify(j));
  } catch (e) {}

  var POSTHOG_KEY = "phc_yN1IDp6NIx4uANHzmtjlrFFbohdZdC8mZIbQ6hnKWZH";
  var POSTHOG_HOST = "https://us.i.posthog.com";

  if (POSTHOG_KEY.indexOf("phc_") !== 0) return;

  // --- Cookie consent -------------------------------------------------------
  // Stored in localStorage so even "no" sets no cookies. States:
  //   "yes"  — tracking loads normally (explicit consent wins, even over GPC)
  //   "no"   — PostHog never loads, no cookies set
  //   absent — show the banner, UNLESS the browser sends Global Privacy
  //            Control, in which case treat it as "no" without nagging
  var CONSENT_KEY = "slush_cookie_consent";
  var REOPEN_KEY = "slush_cookie_reopen";
  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (_) {}

  // GPC — the browser-level opt-out signal that CA, CO, and TX give legal
  // force to. Not the same thing as the old DNT header (which stays ignored).
  var gpc = !!(navigator.globalPrivacyControl);

  var phLoaded = false;

  // Footer "Cookie settings" link — one global, defined in EVERY state.
  // (window.slushResetConsent is the old name, kept so nothing breaks.)
  window.slushCookieSettings = window.slushResetConsent = function () {
    try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
    if (phLoaded) {
      // PostHog is running: stop it, delete what it stored, and reload with a
      // flag so the banner reopens even for a GPC browser (they asked for it).
      try { if (window.posthog && posthog.opt_out_capturing) posthog.opt_out_capturing(); } catch (_) {}
      clearTrackingData();
      try { sessionStorage.setItem(REOPEN_KEY, "1"); } catch (_) {}
      location.reload();
    } else {
      showConsentBanner();
    }
  };

  // Did the settings link just reload us to re-ask?
  var reopen = false;
  try {
    reopen = sessionStorage.getItem(REOPEN_KEY) === "1";
    if (reopen) sessionStorage.removeItem(REOPEN_KEY);
  } catch (_) {}

  if (consent === "yes") {
    loadPostHog();
  } else if (reopen) {
    showConsentBanner();
  } else if (consent === "no") {
    // Nothing loads. The footer link is there if they change their mind.
  } else if (gpc) {
    // No stored choice + GPC signal: silently honor it. Nothing loads, no
    // banner. The footer link still lets them opt in explicitly.
  } else {
    showConsentBanner();
  }

  // Deletes everything PostHog stored in this browser (cookie + localStorage),
  // so declining actually removes the tracking identity rather than just
  // pausing collection.
  function clearTrackingData() {
    try {
      for (var k = localStorage.length - 1; k >= 0; k--) {
        var key = localStorage.key(k);
        if (key && key.indexOf("ph_") === 0) localStorage.removeItem(key);
      }
    } catch (_) {}
    try {
      var cookies = document.cookie.split(";");
      for (var c = 0; c < cookies.length; c++) {
        var name = cookies[c].split("=")[0].replace(/^\s+/, "");
        if (name.indexOf("ph_") === 0) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      }
    } catch (_) {}
  }

  // --- Banner ---------------------------------------------------------------
  function showConsentBanner() {
    if (document.getElementById("cookie-banner")) return;
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie notice");
    // The copy has to be TRUE, not just short: analytics cookies, sent to our
    // analytics tool, and "no" is a real option. Details live on /privacy.
    banner.innerHTML =
      '<div style="max-width:600px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<p style="flex:1;min-width:200px;margin:0;font-size:14px;line-height:1.4;">' +
          'Can we use cookies and analytics to see which pages people read and ' +
          'how they found us? It’s fine to say no — the site works the same. ' +
          '<a href="/privacy" style="color:inherit;text-decoration:underline;">How it works</a>' +
        '</p>' +
        '<div style="display:flex;gap:8px;flex-shrink:0;">' +
          '<button id="cookie-yes" style="' +
            'background:#1a237e;color:#fff;border:none;padding:10px 22px;min-height:44px;' +
            'border-radius:6px;font-size:14px;font-family:inherit;cursor:pointer;' +
          '">Yes, that’s fine</button>' +
          '<button id="cookie-no" style="' +
            'background:transparent;color:#1a237e;border:1px solid #1a237e;' +
            'padding:10px 22px;min-height:44px;border-radius:6px;font-size:14px;font-family:inherit;cursor:pointer;' +
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
      else clearTrackingData();
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

    phLoaded = true;
  }
})();
