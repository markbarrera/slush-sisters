/*
  Slush Sisters — analytics loader (PostHog)
  ==========================================

  This is the ONE place analytics is configured for the whole site, on purpose.

  POSTURE CHANGE — 2026-08-05 (decided by Mark)
  ---------------------------------------------
  Tracking was previously cookieless, DNT-respecting, and profile-free. Mark
  asked to track visitors as granularly as possible, WITH cookies, to power the
  business dashboard's per-customer funnel ("this person heard about us here,
  read these pages, then booked"). This file now does that on the marketing and
  booking pages. What changed from the old posture:

    - Cookies are ON (durable cross-session identity, not just localStorage).
    - "Do Not Track" is no longer honored — DNT visitors are tracked too.
    - A person profile is built for EVERY visitor (was: identified-only).
    - Heatmaps, dead clicks, and web-vitals capture are on.
    - Each booking is stitched to that visitor via posthog.identify() in
      public/book.html, so the pre-booking browsing history joins the booking.

  THE LINE THAT DID **NOT** MOVE — the game / kid pages
  -----------------------------------------------------
  Every arcade and game page still carries NO analytics, NO cookies, NO capture.
  That is what keeps a page a child plays from making the whole site "directed to
  children" under COPPA — which matters precisely because the booking form
  collects a home address and a phone number for a child's party. Turning cookies
  ON for the site makes that line MORE load-bearing, not less. Extending tracking
  onto the game pages is a separate, explicit decision (and one the repo flags for
  a lawyer's review); until that call is made, the route guard below keeps them
  clean even if this file is ever included on one by mistake.

  WHAT IS STILL MASKED, EVEN AT "MAXIMUM" GRANULARITY
  ---------------------------------------------------
  Session recording is on and inputs are visible so replays are useful — EXCEPT
  the three sensitive inputs on /book (name, event address, phone/email), which
  carry the class "ph-no-capture" in the markup. Those stay masked so a customer's
  child's home address and phone are not duplicated into a third-party replay
  tool. The booking itself still records in full to your own inbox (and, once
  built, your own database). Behavioral granularity is unaffected by this — it
  only keeps raw contact PII out of PostHog. If a new sensitive field is ever
  added to a form, give it "ph-no-capture" too. To also capture those fields in
  replays, remove the class — that is a deliberate one-line change, not a default.

  The POSTHOG_KEY below is the Slush Sisters project key. It is public by design —
  it ships in page source on every PostHog site — so it is safe to commit. To
  PAUSE all tracking, blank it out; the guard below then makes this file a no-op.
*/
(function () {
  "use strict";

  // --- Layer 2: hard route guard -------------------------------------------
  // Never initialize on a game / kid-facing path, whatever page included this.
  // This is the COPPA line; it holds until there is an explicit decision to
  // instrument the game pages. Do not remove without that decision on record.
  var BLOCKED = [
    "/play",
    "/party-play",
    "/slushie-playhouse",
    "/slushie-street",
    "/slushie-style",
    "/slushie-catch",
    "/slushie-guys",
    "/slush-rush"
  ];
  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  for (var i = 0; i < BLOCKED.length; i++) {
    if (path === BLOCKED[i] || path === BLOCKED[i] + ".html") return;
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
    // Cookies ON: durable identity that survives across sessions and tabs, so a
    // visitor who comes back next week is the same person, not a new one.
    persistence: "localStorage+cookie",
    disable_cookie: false,
    cross_subdomain_cookie: false,

    // Track everyone, including Do-Not-Track browsers.
    respect_dnt: false,

    // Build a person profile for every visitor, so anonymous browsing can later
    // be stitched to a booking via identify() (see public/book.html).
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

    // --- Session recording: full, with contact PII masked at the source ----
    // Inputs are visible (date, guests, flavors, the "how did you hear" box,
    // notes) so replays show where people stall. The three sensitive inputs on
    // /book carry class "ph-no-capture" in the markup, so the home address and
    // phone a customer types stay masked here. Password/email input TYPES are
    // hard-masked anywhere they appear.
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: true
      }
    }
  });
})();
