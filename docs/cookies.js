/* =====================================================================
   FoodLogistic S.A. — Gestió de cookies amb selecció per tipus
   Compleix amb el RGPD, la LSSI-CE i la Guia de l'AEPD sobre cookies
   ===================================================================== */
(function () {
  "use strict";

  var CONSENT_KEY = "foodlogistic_cookie_consent";
  var CONSENT_VERSION = "1.0";

  /* ------------------------------------------------------------------
     Estat per defecte: només cookies tècniques (necessàries) actives
     ------------------------------------------------------------------ */
  function defaultConsent() {
    return {
      version: CONSENT_VERSION,
      timestamp: null,
      necessary: true,        // sempre actives, no es poden desactivar
      preferences: false,     // personalització
      analytics: false,       // anàlisi i estadístiques
      marketing: false        // publicitat i tercers
    };
  }

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(consent) {
    consent.version = CONSENT_VERSION;
    consent.timestamp = new Date().toISOString();
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) { /* localStorage no disponible */ }
    applyConsent(consent);
  }

  /* ------------------------------------------------------------------
     Aplica el consentiment a la pàgina (carrega/bloqueja scripts)
     ------------------------------------------------------------------ */
  function applyConsent(consent) {
    document.documentElement.setAttribute(
      "data-consent",
      JSON.stringify({
        analytics: !!consent.analytics,
        marketing: !!consent.marketing,
        preferences: !!consent.preferences
      })
    );
    // Aquí es poden carregar scripts de tercers segons categoria, p. ex.:
    // if (consent.analytics) { /* carregar Google Analytics */ }
    // if (consent.marketing) { /* carregar píxels publicitaris */ }
  }

  /* ------------------------------------------------------------------
     Gestió del banner i la modal
     ------------------------------------------------------------------ */
  function showBanner() {
    var banner = document.querySelector('[data-role="cookie-banner"]');
    if (banner) banner.removeAttribute("data-hidden");
  }

  function hideBanner() {
    var banner = document.querySelector('[data-role="cookie-banner"]');
    if (banner) banner.setAttribute("data-hidden", "true");
  }

  function openModal(currentConsent) {
    var modal = document.querySelector('[data-role="cookie-modal"]');
    if (!modal) return;
    // Sincronitzar els toggles amb el consentiment actual
    var c = currentConsent || readConsent() || defaultConsent();
    var prefBox = modal.querySelector('[data-cookie-toggle="preferences"]');
    var anaBox = modal.querySelector('[data-cookie-toggle="analytics"]');
    var mktBox = modal.querySelector('[data-cookie-toggle="marketing"]');
    if (prefBox) prefBox.checked = !!c.preferences;
    if (anaBox) anaBox.checked = !!c.analytics;
    if (mktBox) mktBox.checked = !!c.marketing;
    modal.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    var modal = document.querySelector('[data-role="cookie-modal"]');
    if (modal) modal.removeAttribute("data-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------------------------------
     Accions
     ------------------------------------------------------------------ */
  function acceptAll() {
    writeConsent({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true
    });
    closeModal();
    hideBanner();
  }

  function rejectAll() {
    writeConsent({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false
    });
    closeModal();
    hideBanner();
  }

  function saveSelection() {
    var modal = document.querySelector('[data-role="cookie-modal"]');
    if (!modal) return;
    var prefBox = modal.querySelector('[data-cookie-toggle="preferences"]');
    var anaBox = modal.querySelector('[data-cookie-toggle="analytics"]');
    var mktBox = modal.querySelector('[data-cookie-toggle="marketing"]');
    writeConsent({
      necessary: true,
      preferences: prefBox ? prefBox.checked : false,
      analytics: anaBox ? anaBox.checked : false,
      marketing: mktBox ? mktBox.checked : false
    });
    closeModal();
    hideBanner();
  }

  /* ------------------------------------------------------------------
     Inicialització
     ------------------------------------------------------------------ */
  function init() {
    var stored = readConsent();
    if (stored) {
      applyConsent(stored);
      hideBanner();
    } else {
      showBanner();
    }

    // Botons del banner
    var acceptBtn = document.querySelector('[data-action="accept-cookies"]');
    var rejectBtn = document.querySelector('[data-action="reject-cookies"]');
    var configBtn = document.querySelector('[data-action="configure-cookies"]');

    if (acceptBtn) acceptBtn.addEventListener("click", acceptAll);
    if (rejectBtn) rejectBtn.addEventListener("click", rejectAll);
    if (configBtn) configBtn.addEventListener("click", function () { openModal(stored); });

    // Botons de la modal
    var saveBtn = document.querySelector('[data-action="save-cookies"]');
    var modalAcceptBtn = document.querySelector('[data-action="modal-accept-all"]');
    var modalRejectBtn = document.querySelector('[data-action="modal-reject-all"]');
    var closeBtn = document.querySelector('[data-action="close-cookie-modal"]');

    if (saveBtn) saveBtn.addEventListener("click", saveSelection);
    if (modalAcceptBtn) modalAcceptBtn.addEventListener("click", acceptAll);
    if (modalRejectBtn) modalRejectBtn.addEventListener("click", rejectAll);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Tancar modal en clicar fora
    var overlay = document.querySelector('[data-role="cookie-modal"]');
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    // Tecla Escape per tancar la modal
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    // Enllaços externs per reobrir la configuració des de qualsevol pàgina
    document.querySelectorAll('[data-action="open-cookie-settings"]').forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(readConsent());
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
