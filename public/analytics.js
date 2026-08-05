/*
  Slush Sisters — analytics loader (PostHog)
  ==========================================

  This is the ONE place analytics is configured for the whole site, on purpose.

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

  // Watch children play back as video? Off by default (see header). Flip to true
  // only as a deliberate, reviewed decision.
  var RECORD_GAMES = false;

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";

  // Pages that get NOTHING, ever, even if this file is included by mistake.
  // /party-play is a printable table card, not a play surface.
  var NEVER = ["/party-play"];
  for (var n = 0; n < NEVER.length; n++) {
    if (path === NEVER[n] || path === NEVER[n] + ".html") return;
  }

  // Game / arcade surfaces. Instrumented (per Mark, 2026-08-05) but with session
  // recording held off unless RECORD_GAMES is set.
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

  // Not filled in yet (or blanked out to pause tracking) — do nothing.
  if (POSTHOG_KEY.indexOf("phc_") !== 0) return;

  // --- PostHog loader snippet (official) ------------------------------------
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // --- Maximum-granularity identity (Mark, 2026-08-05) --------------------
    // Cookies ON: durable identity across sessions and tabs — the basis of any
    // retargeting audience later.
    persistence: "localStorage+cookie",
    disable_cookie: false,
    cross_subdomain_cookie: false,

    // Track everyone, including Do-Not-Track browsers.
    respect_dnt: false,

    // A person profile for every visitor, so anonymous browsing can be stitched
    // to a booking (see public/book.html) and to ad-source UTMs.
    person_profiles: "always",

    // Page + engagement analytics.
    capture_pageview: true,
    capture_pageleave: true,

    // Autocapture every click/navigation; keep element text visible so we can
    // tell which CTA/copy was clicked. Heatmaps + dead-click + web-vitals give
    // the most granular behavior picture PostHog offers client-side.
    autocapture: true,
    mask_all_text: false,
    enable_heatmaps: true,
    capture_dead_clicks: true,
    capture_performance: true,

    // --- Session recording -------------------------------------------------
    // ON for marketing/booking pages, with the three sensitive /book inputs
    // masked at source. OFF on game pages (children) unless RECORD_GAMES is set.
    disable_session_recording: isGame ? !RECORD_GAMES : false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: true
      }
    }
  });

  // Tag every event on a game page with its surface + slug, and log the open so
  // "which games are popular" is a first-class question, not just a pageview
  // count.
  if (isGame) {
    posthog.register({ surface: "game", game: gameSlug });
    posthog.capture("game_opened", { game: gameSlug });
  }
})();
