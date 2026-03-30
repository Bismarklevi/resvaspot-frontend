/**
 * resvaspot/js/services.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Services page (services.html) dynamic rendering.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const servicesGrid = document.querySelector(".services-provider-grid");

if (servicesGrid) {
  const syncDynamicMedia = (card) => {
    const image = card.querySelector(".fade-media");
    if (!(image instanceof HTMLImageElement)) return;

    const markLoaded = () => image.classList.add("is-loaded");
    if (image.complete) markLoaded();
    else {
      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", markLoaded, { once: true });
    }
  };

  const loadDynamicServices = () => {
    const providerServices = JSON.parse(localStorage.getItem("rv_provider_services") || "[]");
    
    providerServices.forEach(s => {
      const visual = window.rvMediaLibrary?.resolveProviderVisual({
        name: s.provider,
        category: s.category,
        role: s.name,
        description: `Campus provider offering ${s.name} for ${s.category}.`,
      });

      const card = document.createElement("article");
      card.className = "surface-card provider-card services-provider-tile";
      card.innerHTML = `
        ${
          visual
            ? `<img class="provider-card-photo fade-media" loading="lazy" src="${visual.src}" alt="${visual.alt}">`
            : `<div class="provider-card-photo-placeholder" style="background: var(--primary-gradient); height: 200px; display:grid; place-items:center; color:#fff; font-size:3rem; font-weight:800;">${s.name[0]}</div>`
        }
        <h3>${s.provider || "Campus Provider"}</h3>
        <span>${s.name}</span>
        <div class="rating-row">
          <span class="stars" aria-label="Rated 5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <small>New</small>
        </div>
        <p>Custom service listed by ${s.provider}. Book now for campus-exclusive rates.</p>
        <div class="card-actions-row">
          <a class="button button-sm" data-auth-required="true" href="calendar.html?provider=${encodeURIComponent(s.provider)}&service=${encodeURIComponent(s.name)}&category=${encodeURIComponent(s.category)}">Book Now</a>
          <a class="button button-sm button-secondary" data-auth-required="true" href="chat.html?with=${encodeURIComponent(s.provider)}">Message</a>
        </div>
      `;
      servicesGrid.appendChild(card);
      syncDynamicMedia(card);
    });
  };

  loadDynamicServices();
}
