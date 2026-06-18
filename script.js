/* =========================================================
   CHAUFFEUR PRIVÉ — NANTERRE / LA DÉFENSE
   Script principal : navigation, animations, calculateur de
   tarif et réservation instantanée via WhatsApp.
   ========================================================= */

(function () {
  "use strict";

  /* -----------------------------------------------------
     CONFIGURATION — à adapter avec vos coordonnées réelles
     ----------------------------------------------------- */
  const CONFIG = {
    whatsappNumber: "33612345678", // format international, sans "+" ni "00"
    phoneDisplay: "06 12 34 56 78",
  };

  // Tarifs indicatifs par trajet (à ajuster selon vos prix réels)
  const ROUTE_PRICES = {
    "nanterre-cdg":        { label: "Nanterre ↔ Aéroport CDG",        price: 65 },
    "nanterre-orly":       { label: "Nanterre ↔ Aéroport Orly",       price: 55 },
    "defense-cdg":         { label: "La Défense ↔ Aéroport CDG",      price: 70 },
    "defense-orly":        { label: "La Défense ↔ Aéroport Orly",     price: 60 },
    "paris-cdg":           { label: "Paris ↔ Aéroport CDG",           price: 75 },
    "paris-orly":          { label: "Paris ↔ Aéroport Orly",          price: 65 },
    "idf-beauvais":        { label: "Île-de-France ↔ Aéroport Beauvais", price: 120 },
    "garedunord-defense":  { label: "Gare du Nord ↔ La Défense",      price: 35 },
    "garedelyon-defense":  { label: "Gare de Lyon ↔ La Défense",      price: 35 },
  };
  const HOURLY_RATE = 45; // € / heure, mise à disposition

  document.addEventListener("DOMContentLoaded", () => {
    setFooterYear();
    initHeaderScroll();
    initMobileNav();
    initActiveNavLink();
    initRouteLineMotion();
    initScrollReveal();
    initAccordion();
    initCalculator();
    initContactForm();
    initMinDates();
  });

  /* ---------------------------------------------------- */
  function setFooterYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  }

  /* ---------------------------------------------------- */
  function initActiveNavLink() {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    if (!links.length) return;
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          const match = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
          if (match) match.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------------------------------------------------- */
  function initRouteLineMotion() {
    const path = document.getElementById("routePath");
    if (!path) return;
    let ticking = false;
    const update = () => {
      path.style.strokeDashoffset = String(-(window.scrollY * 0.4));
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item, i) => {
      item.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  }

  /* ---------------------------------------------------- */
  function initAccordion() {
    document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
      const panel = trigger.nextElementSibling;
      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
      });
    });
  }

  /* ---------------------------------------------------- */
  function initMinDates() {
    const today = new Date().toISOString().split("T")[0];
    ["dateInput", "cfDate"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.min = today;
    });
  }

  /* ---------------------------------------------------- */
  function initCalculator() {
    const form = document.getElementById("calcForm");
    if (!form) return;

    const tabs = document.querySelectorAll(".calc-tab");
    const panels = document.querySelectorAll(".calc-panel");
    const routeSelect = document.getElementById("routeSelect");
    const customAddresses = document.getElementById("customAddresses");
    const customFrom = document.getElementById("customFrom");
    const customTo = document.getElementById("customTo");
    const hourlyFrom = document.getElementById("hourlyFrom");
    const hoursInput = document.getElementById("hoursInput");
    const dateInput = document.getElementById("dateInput");
    const timeInput = document.getElementById("timeInput");
    const paxInput = document.getElementById("paxInput");
    const calcButton = document.getElementById("calcButton");
    const resultValue = document.getElementById("calcResultValue");
    const resultNote = document.getElementById("calcResultNote");
    const whatsappBtn = document.getElementById("whatsappBookButton");

    let mode = "trip";
    let lastBooking = null;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        mode = tab.dataset.mode;
        tabs.forEach((t) => {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", String(t === tab));
        });
        panels.forEach((p) => {
          p.hidden = p.dataset.panel !== mode;
        });
        resetResult();
      });
    });

    routeSelect.addEventListener("change", () => {
      customAddresses.hidden = routeSelect.value !== "other";
      resetResult();
    });

    function resetResult() {
      resultValue.textContent = "Sélectionnez un trajet";
      resultNote.textContent = "Le tarif définitif est confirmé avant chaque trajet.";
      whatsappBtn.disabled = true;
      lastBooking = null;
    }

    calcButton.addEventListener("click", () => {
      if (mode === "trip") {
        const routeKey = routeSelect.value;
        if (!routeKey) {
          resultValue.textContent = "Veuillez choisir un trajet";
          whatsappBtn.disabled = true;
          return;
        }
        if (routeKey === "other") {
          if (!customFrom.value.trim() || !customTo.value.trim()) {
            resultValue.textContent = "Indiquez les deux adresses";
            whatsappBtn.disabled = true;
            return;
          }
          resultValue.textContent = "Sur devis";
          resultNote.textContent = "Trajet personnalisé : votre tarif vous sera communiqué par WhatsApp.";
          lastBooking = {
            mode: "trip",
            label: `${customFrom.value.trim()} → ${customTo.value.trim()}`,
            priceText: "sur devis",
          };
        } else {
          const route = ROUTE_PRICES[routeKey];
          resultValue.textContent = `à partir de ${route.price} €`;
          resultNote.textContent = "Estimation indicative. Le tarif définitif est confirmé avant le départ.";
          lastBooking = { mode: "trip", label: route.label, priceText: `à partir de ${route.price} €` };
        }
      } else {
        const hours = Math.max(2, parseInt(hoursInput.value, 10) || 2);
        hoursInput.value = hours;
        const total = hours * HOURLY_RATE;
        const from = hourlyFrom.value.trim();
        resultValue.textContent = `≈ ${total} €`;
        resultNote.textContent = `${hours} h × ${HOURLY_RATE} €/h. Tarif définitif confirmé avant le départ.`;
        lastBooking = {
          mode: "hourly",
          label: `Mise à disposition${from ? " — départ : " + from : ""} (${hours} h)`,
          priceText: `≈ ${total} €`,
        };
      }
      whatsappBtn.disabled = !lastBooking;
    });

    whatsappBtn.addEventListener("click", () => {
      if (!lastBooking) return;
      const date = dateInput.value ? formatDateFR(dateInput.value) : "à préciser";
      const time = timeInput.value || "à préciser";
      const pax = paxInput.value;
      const lines = [
        "Bonjour, je souhaite réserver une course :",
        `• Trajet : ${lastBooking.label}`,
        `• Date : ${date} à ${time}`,
        `• Passagers : ${pax}`,
        `• Estimation : ${lastBooking.priceText}`,
      ];
      openWhatsApp(lines.join("\n"));
    });
  }

  /* ---------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("cfName").value.trim();
      const phone = document.getElementById("cfPhone").value.trim();
      const email = document.getElementById("cfEmail").value.trim();
      const from = document.getElementById("cfFrom").value.trim();
      const to = document.getElementById("cfTo").value.trim();
      const date = document.getElementById("cfDate").value;
      const time = document.getElementById("cfTime").value;
      const message = document.getElementById("cfMessage").value.trim();

      if (!name || !phone || !from || !to) {
        status.textContent = "Merci de renseigner au minimum votre nom, téléphone et trajet.";
        return;
      }

      const lines = [
        "Bonjour, je souhaite réserver un trajet :",
        `• Nom : ${name}`,
        `• Téléphone : ${phone}`,
        email ? `• Email : ${email}` : null,
        `• Départ : ${from}`,
        `• Arrivée : ${to}`,
        date ? `• Date : ${formatDateFR(date)}` : null,
        time ? `• Heure : ${time}` : null,
        message ? `• Message : ${message}` : null,
      ].filter(Boolean);

      openWhatsApp(lines.join("\n"));
      status.textContent = "Votre demande a été préparée — finalisez l'envoi sur WhatsApp.";
    });
  }

  /* ---------------------------------------------------- */
  function openWhatsApp(text) {
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  function formatDateFR(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  }
})();
