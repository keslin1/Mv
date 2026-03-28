/* ─── MV Shipping PWA – app.js ─────────────────────────────── */

// Kle Web3Forms ou a ki korije
const WEB3FORMS_KEY = "a2d5b024-731b-4a8c-a5d4-d46a64e4f60a"; 
const ONBOARDING_KEY = "mvs_registered";

/* ══════════════════════════════════════════════
   1.  ONBOARDING (Premye fwa yon moun louvri App a)
══════════════════════════════════════════════ */
(function initOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY)) return; // Si l deja anrejistre, pa montre l ankò

  const overlay = document.getElementById("onboarding-overlay");
  const form    = document.getElementById("onboarding-form");
  const submit  = document.getElementById("ob-submit");
  const errEl   = document.getElementById("ob-error");

  if (overlay) overlay.classList.remove("hidden");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.classList.add("hidden");
    
    // Animasyon loader
    submit.querySelector(".btn-text").classList.add("hidden");
    submit.querySelector(".btn-loader").classList.remove("hidden");
    submit.disabled = true;

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject:    "Nouvo Enskripsyon – MV Shipping",
      name:       document.getElementById("ob-name").value.trim(),
      email:      document.getElementById("ob-email").value.trim(),
      phone:      document.getElementById("ob-phone").value.trim(),
      from_name:  "MV Shipping PWA",
    };

    try {
      const res  = await fetch("https://api.web3forms.com/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify({
          name:  payload.name,
          email: payload.email,
        }));
        overlay.classList.add("hidden");
      } else {
        throw new Error(data.message || "Erè nan sistèm nan.");
      }
    } catch (err) {
      errEl.textContent = "⚠️ " + err.message;
      errEl.classList.remove("hidden");
      submit.querySelector(".btn-text").classList.remove("hidden");
      submit.querySelector(".btn-loader").classList.add("hidden");
      submit.disabled = false;
    }
  });
})();

/* ══════════════════════════════════════════════
   2.  ENSTALASYON PWA
══════════════════════════════════════════════ */
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById("install-banner");
  if (banner) banner.classList.remove("hidden");
});

document.getElementById("install-btn")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("install-banner")?.classList.add("hidden");
});

/* ══════════════════════════════════════════════
   3.  NAVIGASYON (SPA)
══════════════════════════════════════════════ */
function navigateTo(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");

  // Aktive lyen yo nan meni yo
  document.querySelectorAll(".nav-link, .drawer-link, .bottom-nav-item").forEach(l => {
    l.classList.toggle("active", l.dataset.section === sectionId);
  });

  closeDrawer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-section]");
  if (link) {
    e.preventDefault();
    navigateTo(link.dataset.section);
  }
});

/* ══════════════════════════════════════════════
   4.  MENI (HAMBURGER / DRAWER)
══════════════════════════════════════════════ */
const hamburger     = document.getElementById("hamburger");
const drawer        = document.getElementById("drawer");
const drawerOverlay = document.getElementById("drawer-overlay");

function openDrawer()  {
  drawer?.classList.add("open");
  drawerOverlay?.classList.add("open");
  hamburger?.classList.add("open");
}
function closeDrawer() {
  drawer?.classList.remove("open");
  drawerOverlay?.classList.remove("open");
  hamburger?.classList.remove("open");
}

hamburger?.addEventListener("click", () => {
  drawer.classList.contains("open") ? closeDrawer() : openDrawer();
});
drawerOverlay?.addEventListener("click", closeDrawer);

/* ══════════════════════════════════════════════
   5.  KALKILATRIS PRI ($4.99 pa liv)
══════════════════════════════════════════════ */
const calcInput = document.getElementById("calc-weight");
const calcTotal = document.getElementById("calc-total");

calcInput?.addEventListener("input", () => {
  const lbs = parseFloat(calcInput.value) || 0;
  calcTotal.textContent = "$" + (lbs * 4.99).toFixed(2);
});

/* ══════════════════════════════════════════════
   6.  KONTAK (Fòm Mesaj)
══════════════════════════════════════════════ */
document.getElementById("contact-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn     = document.getElementById("contact-submit");
  const success = document.getElementById("contact-success");
  const errEl   = document.getElementById("contact-error");
  
  success?.classList.add("hidden");
  errEl?.classList.add("hidden");

  btn.querySelector(".btn-text").classList.add("hidden");
  btn.querySelector(".btn-loader").classList.remove("hidden");
  btn.disabled = true;

  const form = e.target;
  const payload = {
    access_key: WEB3FORMS_KEY,
    subject:    "Mesaj Depi Sit MV Shipping",
    name:       form["name"]?.value || "Kliyan MV",
    email:      form["email"]?.value,
    message:    form["message"]?.value,
    from_name:  "MV Shipping Website",
  };

  try {
    const res  = await fetch("https://api.web3forms.com/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      success?.classList.remove("hidden");
      form.reset();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    errEl.textContent = "⚠️ " + err.message;
    errEl?.classList.remove("hidden");
  } finally {
    btn.querySelector(".btn-text").classList.remove("hidden");
    btn.querySelector(".btn-loader").classList.add("hidden");
    btn.disabled = false;
  }
});

/* ══════════════════════════════════════════════
   7.  SERVICE WORKER (Pou PWA mache offline)
══════════════════════════════════════════════ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  });
}
