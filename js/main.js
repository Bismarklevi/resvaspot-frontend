const navbarRoot = document.querySelector("#navbar-root");
document.body.classList.add("ui-ready");

const navItems = [
  { key: "home", label: "Home", path: "home.html", icon: "home" },
  { key: "dashboard", label: "Dashboard", path: "dashboard.html", icon: "dashboard", private: true },
  { key: "marketplace", label: "Marketplace", path: "marketplace.html", icon: "marketplace" },
  { key: "services", label: "Services", path: "services.html", icon: "services" },
  { key: "bookings", label: "Bookings", path: "bookings.html", icon: "bookings", private: true },
  { key: "calendar", label: "Calendar", path: "calendar.html", icon: "calendar", private: true },
  { key: "chat", label: "Chat", path: "chat.html", icon: "chat", private: true },
];

const navIcons = {
  home: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,
  dashboard: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  `,
  marketplace: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  `,
  services: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.7a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.7z"></path>
    </svg>
  `,
  bookings: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  `,
  calendar: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  `,
  chat: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,
  brand: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  `,
};

if (navbarRoot) {
  const currentPage = document.body.dataset.page || "";
  const inPagesDirectory = window.location.pathname.includes("/pages/");
  const isDashboardPage = window.location.pathname.includes("dashboard.html") || 
                          window.location.pathname.includes("bookings.html") || 
                          window.location.pathname.includes("calendar.html") ||
                          window.location.pathname.includes("chat.html");

  const prefix = inPagesDirectory ? "" : "pages/";
  const signInActive = currentPage === "signin";

  const user = window.rvAuth ? window.rvAuth.getUser() : null;
  const publicHomePath = inPagesDirectory ? "../index.html" : "index.html";

  const linksMarkup = navItems
    .filter((item) => {
      if (item.private && !user) return false;
      return true;
    })
    .map(({ key, label, path, icon }) => {
      const isActive = currentPage === key;
      const classes = ["nav-link", isActive ? "active" : ""]
        .filter(Boolean)
        .join(" ");
      const href = key === "home" && !user ? publicHomePath : `${prefix}${path}`;

      return `
        <a class="${classes}" href="${href}">
          <span class="nav-link-icon">${navIcons[icon] || ""}</span>
          <span>${label}</span>
        </a>
      `;
    })
    .join("");

  const authActionsMarkup = user
    ? `
      <div class="nav-user-info">
        <div class="nav-notifications" id="navNotifications">
          <button class="nav-icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="notification-badge" id="notifBadge" hidden></span>
          </button>
          <div class="notifications-dropdown" id="notifDropdown">
            <div class="notif-header">
              <strong>Notifications</strong>
              <button class="text-link button-sm" id="clearNotifs">Clear all</button>
            </div>
            <div class="notif-list" id="notifList">
              <p class="muted" style="padding: 1rem; text-align: center;">No new updates.</p>
            </div>
          </div>
        </div>
        <span class="user-name">Hi, ${(user.name || "User").split(" ")[0]}</span>
        <button id="logoutBtn" class="nav-auth nav-logout button button-sm">Logout</button>
      </div>
    `
    : `
      <a class="nav-auth nav-signin ${signInActive ? "active-auth" : ""}" href="${inPagesDirectory ? 'signin.html' : 'pages/signin.html'}">Sign In</a>
      <a class="nav-auth nav-signup button button-sm ${signInActive ? "active-auth" : ""}" href="${inPagesDirectory ? 'signin.html?mode=signup' : 'pages/signin.html?mode=signup'}">Sign Up</a>
    `;

  navbarRoot.innerHTML = `
    <header class="site-header ${isDashboardPage ? 'dashboard-header-fixed' : ''}">
      <nav class="navbar container" aria-label="Primary">
        <a class="brand" href="${inPagesDirectory ? '../index.html' : 'index.html'}" aria-label="Resvaspot home">
          <span class="brand-mark">${navIcons.brand}</span>
          <span class="brand-copy">
            <strong>Resvaspot</strong>
            <small>Campus services</small>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-panel ${isDashboardPage ? 'sidebar-mode' : ''}">
          <div class="nav-links">
            ${linksMarkup}
          </div>
          <div class="nav-utilities">
            <label class="nav-search" aria-label="Search services">
              <span class="nav-search-icon">${navIcons.search}</span>
              <input type="search" placeholder="Search services, providers, or products">
            </label>
            <div class="nav-actions">
              ${authActionsMarkup}
            </div>
          </div>
        </div>
      </nav>
      <div class="nav-overlay"></div>
    </header>
  `;

  if (window.rvAuth) {
    window.rvAuth.bindProtectedActions(document);
  }

  const logoutBtn = navbarRoot.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (window.rvAuth) {
        window.rvAuth.clearAuth();
        window.location.href = inPagesDirectory ? "../index.html" : "index.html";
      }
    });
  }

  // –– Notifications Logic –––––––––––––––––––––––––––––––––
  const notifBtn = navbarRoot.querySelector("#navNotifications button");
  const notifDropdown = navbarRoot.querySelector("#notifDropdown");
  const notifList = navbarRoot.querySelector("#notifList");
  const notifBadge = navbarRoot.querySelector("#notifBadge");
  const clearNotifs = navbarRoot.querySelector("#clearNotifs");

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("is-visible");
      if (notifBadge) notifBadge.hidden = true;
    });

    document.addEventListener("click", () => notifDropdown.classList.remove("is-visible"));
    notifDropdown.addEventListener("click", (e) => e.stopPropagation());

    if (clearNotifs) {
      clearNotifs.addEventListener("click", () => {
        localStorage.setItem("rv_notifications", "[]");
        renderNotifications();
      });
    }

    const renderNotifications = () => {
      const notifs = JSON.parse(localStorage.getItem("rv_notifications") || "[]");
      if (notifs.length === 0) {
        notifList.innerHTML = `<p class="muted" style="padding: 2rem; text-align: center;">All caught up!</p>`;
        if (notifBadge) notifBadge.hidden = true;
        return;
      }

      if (notifBadge) notifBadge.hidden = false;
    notifList.innerHTML = notifs.map(n => `
      <div class="notif-item">
        <div style="display:flex; justify-content:space-between;">
          <strong>${n.title}</strong>
          <span class="status-badge ${n.type || 'pending'}" style="font-size:0.6rem; padding:0.1rem 0.4rem;">${n.type || 'INFO'}</span>
        </div>
        <p>${n.text}</p>
        <small>${n.time}</small>
      </div>
    `).reverse().join("");
  };

    // Simulate initial notification for research purposes
    if (!localStorage.getItem("rv_notifications")) {
      const initial = [
        { title: "Welcome to Resvaspot", text: "Complete your profile to get 5% off your first booking.", time: "Just now", type: "confirmed" },
        { title: "System Update", text: "We've added new providers in the Grooming category.", time: "2h ago", type: "pending" }
      ];
      localStorage.setItem("rv_notifications", JSON.stringify(initial));
    }

    renderNotifications();
  }

  const navToggle = navbarRoot.querySelector(".nav-toggle");
  const navPanel = navbarRoot.querySelector(".nav-panel");
  const navOverlay = navbarRoot.querySelector(".nav-overlay");
  const siteHeader = navbarRoot.querySelector(".site-header");
  const navAnchors = navbarRoot.querySelectorAll(".nav-link, .nav-auth");

  if (navToggle && navPanel && navOverlay) {
    const syncHeaderState = () => {
      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
      }
    };

    const closeMenu = () => {
      navPanel.classList.remove("open");
      navOverlay.classList.remove("is-visible");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = ""; // Unlock scroll
      document.body.classList.remove("nav-open");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navPanel.classList.toggle("open");
      navOverlay.classList.toggle("is-visible", isOpen);
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      
      // Lock/Unlock body scroll for better mobile UX
      document.body.style.overflow = isOpen ? "hidden" : "";
      document.body.classList.toggle("nav-open", isOpen);
    });

    navOverlay.addEventListener("click", closeMenu);

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) {
        closeMenu();
      }
    });

    window.addEventListener("scroll", syncHeaderState, { passive: true });
    syncHeaderState();

    // –– Search Bar Functionality –––––––––––––––––––––––––––––
    const searchInput = navbarRoot.querySelector(".nav-search input");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = searchInput.value.trim().toLowerCase();
          if (query) {
            // Redirect to marketplace or services with search query
            const isMarketplace = window.location.pathname.includes("marketplace.html");
            const targetPage = isMarketplace ? "marketplace.html" : "services.html";
            const prefix = window.location.pathname.includes("/pages/") ? "" : "pages/";
            window.location.href = `${prefix}${targetPage}?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }
}

const revealTargets = document.querySelectorAll(
  [
    ".page-intro",
    ".section-heading",
    ".surface-card",
    ".landing-service-tile",
    ".home-quick-card",
    ".home-photo-tile",
    ".message",
  ].join(", ")
);

if ("IntersectionObserver" in window && revealTargets.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("reveal-on-scroll", "is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
}

const mediaImages = document.querySelectorAll(".fade-media");

mediaImages.forEach((image) => {
  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  const markLoaded = () => image.classList.add("is-loaded");

  if (image.complete) {
    markLoaded();
    return;
  }

  image.addEventListener("load", markLoaded, { once: true });
  image.addEventListener("error", markLoaded, { once: true });
});

const landingSubscribeForm = document.querySelector("#landingSubscribeForm");
const landingSubscribeEmail = document.querySelector("#landingSubscribeEmail");
const landingSubscribeMessage = document.querySelector("#landingSubscribeMessage");

if (landingSubscribeForm && landingSubscribeEmail && landingSubscribeMessage) {
  landingSubscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = landingSubscribeEmail.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      landingSubscribeMessage.textContent = "Enter a valid email address.";
      return;
    }

    landingSubscribeMessage.textContent = "Subscribed. Watch your inbox for campus updates.";
    landingSubscribeEmail.value = "";
  });
}

const paymentOptions = document.querySelectorAll(".payment-option");

if (paymentOptions.length > 0) {
  const syncActivePaymentOption = () => {
    paymentOptions.forEach((item) => {
      const radio = item.querySelector('input[type="radio"]');
      item.classList.toggle(
        "active-option",
        radio instanceof HTMLInputElement && radio.checked
      );
    });
  };

  paymentOptions.forEach((option) => {
    const input = option.querySelector('input[type="radio"]');
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    option.addEventListener("click", () => {
      input.checked = true;
      syncActivePaymentOption();
    });

    input.addEventListener("change", syncActivePaymentOption);
  });

  syncActivePaymentOption();
}

const interactiveButtons = document.querySelectorAll(".button, .marketplace-chip, .bookings-tab, .services-location-pill");

interactiveButtons.forEach((button) => {
  button.addEventListener("pointerdown", () => {
    button.classList.add("is-pressed");
  });

  const clearPressed = () => button.classList.remove("is-pressed");
  button.addEventListener("pointerup", clearPressed);
  button.addEventListener("pointerleave", clearPressed);
  button.addEventListener("blur", clearPressed);
});
