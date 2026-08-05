/*
  Slush Sisters — analytics loader (PostHog)
  ==========================================

  This is the ONE place analytics is configured for the whole site, on purpose.

  THE RULE THIS FILE EXISTS TO PROTECT
  ------------------------------------
  From CLAUDE.md ("The arcade"): every game page and every kid-facing page
  carries NO analytics, NO cookies, NO capture — ever. That is what keeps a page
  a kid plays from making the site "directed to children" under COPPA, which
  matters here because the booking form collects a home address and a phone
  number. Keeping this loader in a single file means the rule is enforced and
  auditable in one place instead of copied across two dozen pages.

  TWO LAYERS OF PROTECTION
  ------------------------
  1. This file is only <script>-included on indexable marketing pages. The game
     pages, /party-play, /inventory, /competition and 404 are all `noindex` and
     never include it. (Mechanical rule: if a page is noindex, it gets no
     analytics.)
  2. Even if a stray include ever slips onto a blocked path, the guard below
     refuses to initialize, so it cannot quietly start tracking a child.

  PRIVACY POSTURE (decided with Mark, 2026-08-05)
  -----------------------------------------------
  - Cookieless. Anonymous id lives in localStorage only, so cross-page funnels
    still work without setting a tracking cookie.
  - Session recording is ON and watchable, but the sensitive booking fields are
    masked at the source: the name, event address, and phone/email inputs on
    /book carry the class "ph-no-capture", so a recording never shows the home
    address or phone number a customer types for a child's party. Every other
    field (date, guests, flavors, notes) is visible, which is what makes the
    recording useful. If a new sensitive field is ever added to a form, give it
    the class "ph-no-capture" too.
  - We never call identify(); no one logs in, so no personal profiles are built.
  - "Do Not Track" is honored.

  The POSTHOG_KEY below is the Slush Sisters project key (set 2026-08-05). It is
  public by design — it ships in the page source of every PostHog site — so it is
  safe to commit. To PAUSE all tracking, blank it out; the guard below then makes
  this file do nothing.
*/
(function () {
  "use strict";

  // --- Layer 2: hard route guard -------------------------------------------
  // Never initialize on a game / kid-facing path, whatever page included this.
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

  // Not filled in yet (or blanked out to pause tracking) — do nothing.
  if (POSTHOG_KEY.indexOf("phc_") !== 0) return;

  // --- PostHog loader snippet (official) ------------------------------------
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // Cookieless: keep the anonymous id in localStorage so funnels work across
    // pages without setting a tracking cookie.
    persistence: "localStorage",
    disable_cookie: true,

    // Honor Do Not Track.
    respect_dnt: true,

    // We never identify anyone (no logins), so don't build person profiles.
    person_profiles: "identified_only",

    // Standard page analytics.
    capture_pageview: true,
    capture_pageleave: true,

    // Autocapture clicks/navigation. PostHog never records the VALUE typed into
    // an input during autocapture; element text (button labels, public copy) is
    // left visible so we can tell which CTA was clicked.
    autocapture: true,
    mask_all_text: false,

    // --- Session recording: ON and watchable, PII masked at the source -----
    // Recordings show page copy and the ordinary booking fields (date, guests,
    // flavors, notes) so we can see where people stall. The three sensitive
    // inputs on /book — name, event address, phone/email — carry the class
    // "ph-no-capture" in the markup, so THEY stay masked here even though inputs
    // are otherwise visible. (Previously maskAllInputs + maskTextSelector:"*"
    // blacked out everything, which defeated the point of recording at all.)
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      // Still hard-mask password/email input types anywhere they appear.
      maskInputOptions: {
        password: true,
        email: true
      }
    }
  });
})();
