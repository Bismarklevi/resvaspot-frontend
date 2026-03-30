/**
 * resvaspot/js/marketplace.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Marketplace page (marketplace.html).
 * Tries to fetch products from GET /api/products?category=&search=
 * Falls back to the original in-DOM filtering approach if the
 * API is unreachable, so the page always works.
 *
 * Original filter chip / search / empty-state logic preserved.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const marketplaceGrid   = document.querySelector("#marketplaceGrid");
const marketplaceSearch = document.querySelector("#marketplaceSearch");
const marketplaceFilter = document.querySelector("#marketplaceFilter");
const marketplaceEmpty  = document.querySelector("#marketplaceEmpty");
const filterChips       = [...document.querySelectorAll("[data-filter-chip]")];
const getProductVisual = (product) =>
  window.rvMediaLibrary?.resolveProductVisual({
    name: product?.name,
    category: product?.category,
    description: product?.description,
  });

if (marketplaceGrid && marketplaceSearch && marketplaceFilter && marketplaceEmpty) {

  // –– Original DOM-based filter (works without API) –––––––––
  const domProducts = [...marketplaceGrid.querySelectorAll(".product-card")];

  const syncActiveChip = (value) => {
    filterChips.forEach((chip) => {
      chip.classList.toggle("active-chip", chip.dataset.filterChip === value);
    });
  };

  // –– Pagination logic ––––––––––––––––––––––––––––––––––––––
  const paginationEl = document.querySelector(".marketplace-pagination");
  const ITEMS_PER_PAGE = 6;
  let currentPage = 1;

  const renderPaginationButtons = (totalPages) => {
    if (!paginationEl) return;
    paginationEl.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-dot";
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous page");
    prevBtn.innerHTML = "&#8249;";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        applyPagination();
      }
    });
    paginationEl.appendChild(prevBtn);

    // Page number buttons (show up to 3 for simplicity)
    const maxPagesToShow = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "page-dot";
      pageBtn.type = "button";
      pageBtn.setAttribute("aria-label", `Page ${page}`);
      pageBtn.textContent = page;
      if (page === currentPage) {
        pageBtn.classList.add("active-page");
      }
      pageBtn.addEventListener("click", () => {
        currentPage = page;
        applyPagination();
      });
      paginationEl.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-dot";
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next page");
    nextBtn.innerHTML = "&#8250;";
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        applyPagination();
      }
    });
    paginationEl.appendChild(nextBtn);
  };

  const applyPagination = () => {
    const allCards = [...marketplaceGrid.querySelectorAll(".product-card")];
    const visibleCards = allCards.filter(card => !card.hidden);

    const totalPages = Math.max(1, Math.ceil(visibleCards.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    allCards.forEach(card => card.hidden = true); // Hide all first

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    visibleCards.slice(startIndex, endIndex).forEach(card => card.hidden = false);

    renderPaginationButtons(totalPages);
  };

  const applyDomFilters = () => {
    const searchValue = marketplaceSearch.value.trim().toLowerCase();
    const filterValue = marketplaceFilter.value;

    // –– Include Provider-added products from localStorage ––
    const providerProducts = JSON.parse(localStorage.getItem("rv_provider_products") || "[]");
    
    // Remove existing dynamic cards before re-filtering
    marketplaceGrid.querySelectorAll(".product-card[data-dynamic='true']").forEach(c => c.remove());

    providerProducts.forEach(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchValue) || p.category.toLowerCase().includes(searchValue);
      const matchesFilter = filterValue === "all" || p.category === filterValue;
      
      if (matchesSearch && matchesFilter) {
        const visual = getProductVisual(p);
        const card = document.createElement("article");
        card.className = "product-card surface-card";
        card.dataset.dynamic = "true";
        card.innerHTML = `
          <div class="product-card-media">
            ${
              visual
                ? `<img class="fade-media product-photo" loading="lazy" src="${visual.src}" alt="${visual.alt}">`
                : `<div class="product-card-placeholder">${p.name[0]}</div>`
            }
            <span class="product-badge">Provider</span>
          </div>
          <div class="product-card-content">
            <span class="product-category">${p.category}</span>
            <h2>${p.name}</h2>
            <p>${p.description || "Campus-exclusive product."}</p>
            <div class="product-provider">Sold by <strong>${p.provider || "Campus Provider"}</strong></div>
          </div>
          <div class="product-card-footer">
            <span class="product-price">GHS ${parseFloat(p.price).toFixed(2)}</span>
            <a class="button button-sm" data-auth-required="true" href="checkout.html?item=${encodeURIComponent(p.name)}&price=${p.price}">Buy</a>
          </div>
        `;
        marketplaceGrid.appendChild(card);

        const image = card.querySelector(".fade-media");
        if (image instanceof HTMLImageElement) {
          const markLoaded = () => image.classList.add("is-loaded");
          if (image.complete) markLoaded();
          else {
            image.addEventListener("load", markLoaded, { once: true });
            image.addEventListener("error", markLoaded, { once: true });
          }
        }
      }
    });

    domProducts.forEach((product) => {
      const name     = product.dataset.name     || "";
      const category = product.dataset.category || "";
      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        category.toLowerCase().includes(searchValue);
      const matchesFilter = filterValue === "all" || category === filterValue;
      const visible = matchesSearch && matchesFilter;

      product.hidden = !visible;
    });

    marketplaceEmpty.hidden = [...marketplaceGrid.querySelectorAll(".product-card")].some(card => !card.hidden);
    syncActiveChip(filterValue);
    currentPage = 1;
    applyPagination();
  };

  // –– API-based product rendering –––––––––––––––––––––––––––
  // Called when live data is available. Dynamically creates cards
  // that match the existing .product-card HTML structure in
  // marketplace.html so the original CSS applies.
  const renderApiProducts = (products) => {
    // Remove dynamically added API cards (keep static HTML cards hidden)
    marketplaceGrid.querySelectorAll(".product-card[data-api]").forEach((c) => c.remove());

    if (!products.length) {
      marketplaceEmpty.hidden = false;
      return;
    }

    products.forEach((p) => {
      const checkoutHref = `checkout.html?item=${encodeURIComponent(p.name)}&price=${encodeURIComponent(p.price)}`;
      const card = document.createElement("article");
      card.className          = "product-card surface-card";
      card.dataset.name       = p.name;
      card.dataset.category   = p.category;
      card.dataset.api        = "true";
      const fallbackVisual    = getProductVisual(p);

      card.innerHTML = `
        <div class="product-card-media">
          ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" class="fade-media" loading="lazy">`
            : fallbackVisual
              ? `<img src="${fallbackVisual.src}" alt="${fallbackVisual.alt}" class="fade-media product-photo" loading="lazy">`
              : `<div class="product-card-placeholder">${p.name[0]}</div>`
          }
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${p.category}</span>
          <h3>${p.name}</h3>
          <p>${p.description || ""}</p>
          <div class="product-card-footer">
            <strong class="product-price">GHS ${Number(p.price).toFixed(2)}</strong>
            <button class="button button-sm" type="button" data-product-id="${p._id}" data-auth-required="true" data-auth-return="${checkoutHref}">
              Add to Cart
            </button>
          </div>
        </div>
      `;

      // Fade-in image
      const img = card.querySelector(".fade-media");
      if (img instanceof HTMLImageElement) {
        const markLoaded = () => img.classList.add("is-loaded");
        if (img.complete) markLoaded();
        else {
          img.addEventListener("load",  markLoaded, { once: true });
          img.addEventListener("error", markLoaded, { once: true });
        }
      }

      card.dataset.filterMatch = "1";
      marketplaceGrid.appendChild(card);
    });

    marketplaceEmpty.hidden = true;
    currentPage = 1;
    applyPagination();
  };

  // –– Fetch from API –––––––––––––––––––––––––––––––––––––––––
  const fetchProducts = async () => {
    const category = marketplaceFilter.value !== "all" ? marketplaceFilter.value : "";
    const search   = marketplaceSearch.value.trim();

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search)   params.set("search",   search);

    const loadingEl = document.createElement("div");
    loadingEl.className = "loading-state";
    loadingEl.innerHTML = `<span class="spinner"></span> Loading products...`;
    marketplaceGrid.appendChild(loadingEl);

    try {
      const res  = await window.rvAuth.authFetch(
        `/products?category=${marketplaceFilter.value === "all" ? "" : marketplaceFilter.value}&search=${marketplaceSearch.value.trim()}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load products");

      // Hide the static HTML product cards – we'll use API data
      domProducts.forEach((p) => { p.hidden = true; });
      apiAvailable = true;

      renderApiProducts(data.data || []);
    } catch (_) {
      // API not available – use original DOM filtering
      apiAvailable = false;
      domProducts.forEach((p) => { p.hidden = false; });
      applyDomFilters();
    } finally {
      loadingEl.remove();
    }
  };

  // –– Event listeners ––––––––––––––––––––––––––––––––––––––––
  marketplaceSearch.addEventListener("input", () => {
    if (apiAvailable) fetchProducts();
    else applyDomFilters();
  });

  marketplaceFilter.addEventListener("change", () => {
    if (apiAvailable) fetchProducts();
    else applyDomFilters();
  });

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      marketplaceFilter.value = chip.dataset.filterChip || "all";
      syncActiveChip(marketplaceFilter.value);
      if (apiAvailable) fetchProducts();
      else applyDomFilters();
    });
  });

  // –– Add-to-cart (delegated) ––––––––––––––––––––––––––––––––
  marketplaceGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-product-id]");
    if (!btn) return;

    if (!window.rvAuth?.protectAction(e, btn.dataset.authReturn || "")) {
      return;
    }

    // Simple cart feedback – extend with a real cart store as needed
    btn.textContent = "Added ✓“";
    btn.disabled    = true;
    setTimeout(() => { btn.textContent = "Add to Cart"; btn.disabled = false; }, 1500);
  });

  // –– Initial load –––––––––––––––––––––––––––––––––––––––––––
  fetchProducts();
}
