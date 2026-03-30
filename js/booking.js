/**
 * resvaspot/js/booking.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Bookings page (bookings.html).
 * Loads bookings from GET /api/bookings.
 * Update â†’ PATCH /api/bookings/:id  { status: "Updated" }
 * Cancel â†’ DELETE /api/bookings/:id
 *
 * Falls back to hardcoded demo data if the API is unreachable,
 * so the page still works without a running server.
 *
 * Original card rendering logic preserved exactly.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const bookingsList  = document.querySelector("#bookingsList");
const bookingsEmpty = document.querySelector("#bookingsEmpty");
const bookingTabs   = document.querySelectorAll(".bookings-tab");

// –– Demo data (same as original booking.js) –––––––––––––––––––
const DEMO_BOOKINGS = [
  {
    id: 1,
    client: "Anna Rivera",
    service: "Hydrating Facial",
    provider: "Jordan Stone",
    providerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    providerRating: "4.9",
    time: "10:00 AM",
    date: "Today",
    status: "Confirmed",
    category: "Beauty",
    location: "Glow Studio",
  },
  {
    id: 2,
    client: "Jamal Hayes",
    service: "Barbering Session",
    provider: "Ava Reed",
    providerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    providerRating: "4.8",
    time: "1:30 PM",
    date: "Today",
    status: "Pending",
    category: "Grooming",
    location: "Studio 12",
  },
  {
    id: 3,
    client: "Lina Brooks",
    service: "Classic Manicure",
    provider: "Mia Lane",
    providerPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
    providerRating: "4.9",
    time: "4:15 PM",
    date: "Tomorrow",
    status: "Confirmed",
    category: "Beauty",
    location: "Nail Lounge",
  },
  {
    id: 4,
    client: "Anna Rivera",
    service: "Haircut",
    provider: "Marcus Cole",
    providerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    providerRating: "4.7",
    time: "9:00 AM",
    date: "Yesterday",
    status: "Completed",
    category: "Grooming",
    location: "Studio 12",
  },
  {
    id: 5,
    client: "Anna Rivera",
    service: "Braid Styling",
    provider: "Nia Lawson",
    providerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    providerRating: "4.8",
    time: "2:00 PM",
    date: "Last Week",
    status: "Cancelled",
    category: "Braiding",
    location: "Nia's Studio",
  },
];

if (bookingsList && bookingsEmpty) {
  let bookings = [];
  let currentTab = "active";

  // –– Status â†’ CSS class (identical to original) –––––––––––––
  const getStatusClass = (status) => {
    const n = status.toLowerCase();
    if (n === "confirmed") return "status-confirmed";
    if (n === "updated")   return "status-updated";
    if (n === "completed") return "status-completed";
    if (n === "cancelled") return "status-cancelled";
    return "status-pending";
  };

  // –– Render cards (identical to original) ––––––––––––––––––
  const renderBookings = () => {
    bookingsList.innerHTML = "";

    const filtered = bookings.filter((b) => {
      const s = b.status.toLowerCase();
      if (currentTab === "active") return ["confirmed", "pending", "updated"].includes(s);
      if (currentTab === "past")   return s === "completed";
      if (currentTab === "cancelled") return s === "cancelled";
      return true;
    });

    if (filtered.length === 0) {
      bookingsEmpty.hidden = false;
      bookingsEmpty.textContent = `No ${currentTab} bookings available.`;
      return;
    }

    bookingsEmpty.hidden = true;

    filtered.forEach((booking) => {
      const card = document.createElement("article");
      card.className = "booking-card";

      const initials = (booking.client || "User")
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const showActions = currentTab === "active";

      card.innerHTML = `
        <div class="booking-card-main">
          <div class="booking-card-top">
            <div class="booking-card-avatar">${initials}</div>
            <div>
              <span class="booking-status ${getStatusClass(booking.status)}">${booking.status}</span>
              <h3>${booking.client}</h3>
              <p>${booking.service} with ${booking.provider}</p>
            </div>
          </div>
          <div class="booking-meta">
            <span>${booking.date}</span>
            <span>${booking.time}</span>
            <span>${booking.category}</span>
            <span>${booking.location}</span>
          </div>
          <div class="booking-provider">
            <img
              class="booking-provider-photo fade-media"
              src="${booking.providerPhoto}"
              alt="${booking.provider}"
              loading="lazy"
            />
            <div>
              <strong>${booking.provider}</strong>
              <small>${booking.category} specialist &middot; ${booking.providerRating} star rating</small>
            </div>
          </div>
        </div>
        <div class="booking-actions">
          ${showActions ? `
            <button class="button button-sm button-secondary" type="button" data-action="update" data-id="${booking.id}">Update</button>
            <button class="button button-sm button-danger"  type="button" data-action="cancel" data-id="${booking.id}">Cancel</button>
          ` : ""}
          ${booking.status.toLowerCase() === "completed" ? `
            <button class="button button-sm button-outline rate-btn" data-id="${booking.id}" data-provider="${booking.provider}">Rate Service</button>
          ` : ""}
        </div>
      `;

      // Fade-in image (same as original)
      const providerImage = card.querySelector(".fade-media");
      if (providerImage instanceof HTMLImageElement) {
        const markLoaded = () => providerImage.classList.add("is-loaded");
        if (providerImage.complete) markLoaded();
        else {
          providerImage.addEventListener("load",  markLoaded, { once: true });
          providerImage.addEventListener("error", markLoaded, { once: true });
        }
      }

      bookingsList.appendChild(card);
    });
  };

  // –– Load bookings from API (falls back to demo data) –––––––
  const loadBookings = async () => {
    bookingsList.innerHTML = `<div class="loading-state"><span class="spinner"></span> Loading your bookings...</div>`;
    const token = window.rvAuth?.getToken?.();
    const userBookings = JSON.parse(localStorage.getItem("rv_user_bookings") || "[]");

    if (!token) {
      // Not logged in – show demo data + user session bookings
      bookings = [...userBookings, ...DEMO_BOOKINGS.map((b, i) => ({ ...b, id: i + 1 }))];
      renderBookings();
      return;
    }

    try {
      const res  = await window.rvAuth.authFetch("/bookings");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // API returns { success, data: [...bookings] }
      const apiList = Array.isArray(data.data) ? data.data : (data.bookings || []);
      const apiBookings = apiList.map((b) => ({
        id:             b.id,
        client:         b.client,
        service:        b.service,
        provider:       b.provider,
        providerPhoto:  b.providerPhoto,
        providerRating: b.providerRating,
        time:           b.time,
        date:           b.date,
        status:         b.status,
        category:       b.category,
        location:       b.location,
      }));
      bookings = [...userBookings, ...apiBookings];
    } catch (_err) {
      // API unavailable – fall back gracefully
      bookings = [...userBookings, ...DEMO_BOOKINGS.map((b, i) => ({ ...b, id: i + 1 }))];
    }

    renderBookings();
  };

  // –– Action buttons (Update / Cancel) ––––––––––––––––––––––
  bookingsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action    = target.dataset.action;
    const bookingId = target.dataset.id;
    if (!action || !bookingId) return;

    const token = window.rvAuth?.getToken?.();

    if (action === "update") {
      if (token) {
        try {
          await window.rvAuth.authFetch(
            `/bookings/${bookingId}`,
            { method: "PATCH", body: JSON.stringify({ status: "Updated" }) }
          );
        } catch (_) { /* fall through to local update */ }
      }
      bookings = bookings.map((b) =>
        String(b.id) === String(bookingId)
          ? { ...b, status: "Updated", time: b.time === "1:30 PM" ? "2:00 PM" : b.time }
          : b
      );
    }

    if (action === "cancel") {
      if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
      if (token) {
        try {
          await window.rvAuth.authFetch(
            `/bookings/${bookingId}`,
            { method: "DELETE" }
          );
        } catch (_) { /* fall through to local remove */ }
      }
      bookings = bookings.filter((b) => String(b.id) !== String(bookingId));
    }

    renderBookings();
  });

  // –– Tab switching ––––––––––––––––––––––––––––––––––––––––––
  bookingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentTab = tab.dataset.tab;
      bookingTabs.forEach((t) => t.classList.toggle("active-tab", t === tab));
      renderBookings();
    });
  });

  // –– Initial load –––––––––––––––––––––––––––––––––––––––––––
  loadBookings();

  // –– Rating Logic –––––––––––––––––––––––––––––––––––––––––––
  const ratingModal = document.querySelector("#ratingModal");
  const ratingProviderName = document.querySelector("#ratingProviderName");
  const starBtns = document.querySelectorAll(".star-rating-input button");
  const submitRating = document.querySelector("#submitRating");
  const closeRatingModal = document.querySelector("#closeRatingModal");
  let selectedStars = 0;

  bookingsList.addEventListener("click", (e) => {
    const rateBtn = e.target.closest(".rate-btn");
    if (rateBtn) {
      const provider = rateBtn.dataset.provider;
      if (ratingProviderName) ratingProviderName.textContent = `How was your experience with ${provider}?`;
      if (ratingModal) ratingModal.style.display = "flex";
    }
  });

  if (closeRatingModal) {
    closeRatingModal.addEventListener("click", () => {
      ratingModal.style.display = "none";
      selectedStars = 0;
      starBtns.forEach(b => b.classList.remove("active"));
    });
  }

  starBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedStars = parseInt(btn.dataset.star);
      starBtns.forEach((b, i) => b.classList.toggle("active", i < selectedStars));
    });
  });

  if (submitRating) {
    submitRating.addEventListener("click", () => {
      if (selectedStars === 0) {
        alert("Please select a star rating.");
        return;
      }
      alert("Thank you for your feedback! Your review has been submitted.");
      ratingModal.style.display = "none";
      // Reset
      selectedStars = 0;
      starBtns.forEach(b => b.classList.remove("active"));
    });
  }
}
