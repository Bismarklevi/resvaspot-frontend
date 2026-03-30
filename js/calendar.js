/**
 * resvaspot/js/calendar.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Booking calendar (calendar.html).
 * Loads appointments from GET /api/calendar?year=YYYY&month=M
 * which returns { appointments: { "YYYY-MM-DD": [{time,client,service}] } }
 *
 * Falls back to the original hardcoded bookedAppointments object
 * if the API is not reachable.
 *
 * All original calendar rendering logic preserved exactly.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const calendarMonthLabel   = document.querySelector("#calendarMonthLabel");
const calendarGrid         = document.querySelector("#calendarGrid");
const selectedDateLabel    = document.querySelector("#selectedDateLabel");
const selectedTimeLabel    = document.querySelector("#selectedTimeLabel");
const calendarDetailsLabel = document.querySelector("#calendarDetailsLabel");
const appointmentDetails   = document.querySelector("#appointmentDetails");
const calendarPrevButton   = document.querySelector("#calendarPrevButton");
const calendarNextButton   = document.querySelector("#calendarNextButton");
const confirmBookingBtn    = document.querySelector("#confirmBookingBtn");

if (
  calendarMonthLabel &&
  calendarGrid &&
  selectedDateLabel &&
  appointmentDetails &&
  selectedTimeLabel &&
  calendarDetailsLabel
) {
  // –– State variables (were missing – root cause of all three bugs) ––
  const today        = new Date();
  let   displayYear  = today.getFullYear();
  let   displayMonth = today.getMonth();
  let   selectedDateKey  = null;
  let   selectedTimeSlot = null;

  const urlParams = new URLSearchParams(window.location.search);
  const bookingInfo = {
    service: urlParams.get("service") || "Professional Service",
    provider: urlParams.get("provider") || "Sarah Johnson",
    category: urlParams.get("category") || "Beauty",
  };

  const providers = {
    "Sarah Johnson": { title: "Lead Stylist & Beauty Expert", rating: "4.9", location: "Main Campus Center", exp: "8 Years", response: "< 15 mins" },
    "Marcus Cole": { title: "Master Barber", rating: "4.8", location: "Studio 12", exp: "5 Years", response: "< 10 mins" },
    "Nia Lawson": { title: "Protective Style Expert", rating: "4.8", location: "Nia's Studio", exp: "4 Years", response: "< 20 mins" },
    "Jordan Stone": { title: "Skincare Specialist", rating: "5.0", location: "Glow Studio", exp: "6 Years", response: "< 15 mins" },
    "Campus Laundry": { title: "Laundry & Dry Cleaning", rating: "4.7", location: "Service Hub", exp: "10 Years", response: "< 30 mins" }
  };

  const user = window.rvAuth.getUser();
  const isProvider = user?.role === "provider";

  // Update Provider Profile
  const pData = providers[bookingInfo.provider] || providers["Sarah Johnson"];
  const pNameEl = document.querySelector("#providerName");
  const pTitleEl = document.querySelector("#providerTitle");
  const pAvatarEl = document.querySelector("#providerAvatar");
  const pRatingEl = document.querySelector("#providerRating");
  const pLocEl = document.querySelector("#providerLocation");
  const pExpEl = document.querySelector("#providerExperience");
  const pRespEl = document.querySelector("#providerResponse");

  if (isProvider && user) {
    if (pNameEl) pNameEl.textContent = user.name;
    if (pAvatarEl) pAvatarEl.textContent = user.name.split(" ").map(n => n[0]).join("");
    if (pTitleEl) pTitleEl.textContent = "Verified Campus Provider";
  } else {
    if (pNameEl) pNameEl.textContent = bookingInfo.provider;
    if (pAvatarEl) pAvatarEl.textContent = bookingInfo.provider.split(" ").map(n => n[0]).join("");
    if (pTitleEl) pTitleEl.textContent = pData.title;
    if (pRatingEl) pRatingEl.textContent = `${pData.rating} rating from verified clients`;
    if (pLocEl) pLocEl.textContent = pData.location;
    if (pExpEl) pExpEl.textContent = pData.exp;
    if (pRespEl) pRespEl.textContent = pData.response;
  }

  // Update UI for roles
  if (isProvider) {
    const pageEyebrow = document.querySelector("#calendarPageEyebrow");
    const pageTitle = document.querySelector("#calendarPageTitle");
    const pageDesc = document.querySelector("#calendarPageDescription");
    const studentPromo = document.querySelector("#studentPromoCard");
    const confirmBtn = document.querySelector("#confirmBookingBtn");

    if (pageEyebrow) pageEyebrow.textContent = "Provider Console";
    if (pageTitle) pageTitle.textContent = "Manage Your Campus Schedule";
    if (pageDesc) pageDesc.textContent = "Review incoming bookings, block out time slots, and keep your availability up to date for students.";
    if (studentPromo) studentPromo.style.display = "none";
    if (confirmBtn) confirmBtn.textContent = "Save Schedule Changes";
  }

  // –– Fallback hardcoded data (original calendar.js values) ––
  const FALLBACK_APPOINTMENTS = {
    "2026-03-04": [
      { time: "10:00 AM", client: "Anna Rivera",  service: "Hydrating Facial" },
      { time: "2:30 PM",  client: "Mason Lee",    service: "Classic Manicure" },
    ],
    "2026-03-10": [
      { time: "11:30 AM", client: "Jamal Hayes",  service: "Barbering Session" },
    ],
    "2026-03-14": [
      { time: "9:15 AM",  client: "Lina Brooks",  service: "Laundry Care Package" },
      { time: "1:00 PM",  client: "Ava Collins",  service: "Hydrating Facial" },
    ],
    "2026-03-21": [
      { time: "3:00 PM",  client: "Noah Grant",   service: "Barbering Session" },
    ],
    "2026-03-27": [
      { time: "12:45 PM", client: "Sofia Kim",    service: "Classic Manicure" },
      { time: "4:30 PM",  client: "Ivy Turner",   service: "Hydrating Facial" },
    ],
  };

  // Live data cache – populated by loadMonthData()
  let bookedAppointments = { ...FALLBACK_APPOINTMENTS };

  // –– Load a month's appointment data from the API ––––––––––––
  const loadMonthData = async (year, month) => {
    const token = window.rvAuth?.getToken?.();
    if (!token) return; // not logged in, keep fallback data

    try {
      const res  = await window.rvAuth.authFetch(
        `${window.rvAuth.API_BASE}/calendar?year=${year}&month=${month + 1}`
      );
      const data = await res.json();
      if (res.ok && data.appointments) {
        bookedAppointments = data.appointments;
      }
    } catch (_) {
      // API unreachable – silently keep the fallback / last loaded data
    }
  };

  // –– Helpers (identical to original) –––––––––––––––––––––––
  const formatKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formatReadableDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

  // –– Render appointment detail panel (identical to original) –
  const renderDetails = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    const date        = new Date(year, month - 1, day);
    const readableDate = formatReadableDate(date);

    selectedDateLabel.textContent    = readableDate;
    calendarDetailsLabel.textContent = readableDate;
    selectedDateKey = key;

    const appointments = bookedAppointments[key] || [];

    if (appointments.length === 0) {
      selectedTimeLabel.textContent = isProvider ? "No Bookings" : "10:00 AM (Available)";
      selectedTimeSlot = "10:00 AM";
      appointmentDetails.innerHTML  = `
        <div class="appointment-empty">
          <strong>${isProvider ? "Free Day" : "No appointments booked"}</strong>
          <p>${isProvider ? "You have no students scheduled for this date." : "This date is open for new bookings."}</p>
          ${isProvider ? "" : `
          <div class="time-slots-grid">
            <button class="button button-sm button-secondary slot-btn active" data-time="10:00 AM">10:00 AM</button>
            <button class="button button-sm button-secondary slot-btn" data-time="11:30 AM">11:30 AM</button>
            <button class="button button-sm button-secondary slot-btn" data-time="2:00 PM">2:00 PM</button>
            <button class="button button-sm button-secondary slot-btn" data-time="4:30 PM">4:30 PM</button>
          </div>
          `}
        </div>
      `;

      // Handle time slot selection
      appointmentDetails.querySelectorAll(".slot-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          appointmentDetails.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          selectedTimeSlot = btn.dataset.time;
          selectedTimeLabel.textContent = `${selectedTimeSlot} (Selected)`;
        });
      });
      return;
    }

    if (appointments.length > 0) {
      selectedTimeSlot = "Not Available";
      selectedTimeLabel.textContent = isProvider ? `${appointments.length} Bookings` : "Fully Booked";

      appointmentDetails.innerHTML = appointments
        .map(
          (a) => `
            <article class="appointment-card">
              <strong>${a.time}</strong>
              <h3>${isProvider ? a.client : "Booked Slot"}</h3>
              <p>${a.service}</p>
              ${isProvider ? `<button class="button button-sm button-secondary" style="margin-top: 0.5rem;">Message Client</button>` : ""}
            </article>
          `
        )
        .join("");
      return;
    }
  };

  // –– Render the calendar grid (identical to original) –––––––
  const renderCalendar = () => {
    const firstDay    = new Date(displayYear, displayMonth, 1);
    const lastDay     = new Date(displayYear, displayMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = firstDay.getDay();

    calendarMonthLabel.textContent = firstDay.toLocaleDateString("en-US", {
      month: "long", year: "numeric",
    });

    calendarGrid.innerHTML = "";

    for (let i = 0; i < startOffset; i++) {
      const filler = document.createElement("div");
      filler.className = "calendar-day is-empty";
      calendarGrid.appendChild(filler);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key       = formatKey(displayYear, displayMonth, day);
      const dayButton = document.createElement("button");
      dayButton.type       = "button";
      dayButton.className  = "calendar-day";
      dayButton.dataset.date = key;

      const appointments = bookedAppointments[key] || [];
      if (appointments.length > 0) dayButton.classList.add("is-booked");

      if (
        day === today.getDate() &&
        displayMonth === today.getMonth() &&
        displayYear  === today.getFullYear()
      ) {
        dayButton.classList.add("is-today");
      }

      dayButton.innerHTML = `
        <span class="calendar-day-number">${day}</span>
        <small>${appointments.length > 0
          ? `${appointments.length} appointment${appointments.length > 1 ? "s" : ""}`
          : "Open"
        }</small>
      `;

      dayButton.addEventListener("click", () => {
        calendarGrid.querySelectorAll(".calendar-day").forEach((item) =>
          item.classList.remove("is-selected")
        );
        dayButton.classList.add("is-selected");
        renderDetails(key);
      });

      calendarGrid.appendChild(dayButton);
    }

    // Default selection (identical to original)
    const defaultDateKey = formatKey(today.getFullYear(), today.getMonth(), today.getDate());
    const viewingCurrentMonth =
      displayYear === today.getFullYear() && displayMonth === today.getMonth();

    const defaultSelection =
      (viewingCurrentMonth && calendarGrid.querySelector(`[data-date="${defaultDateKey}"]`)) ||
      calendarGrid.querySelector(".calendar-day.is-booked") ||
      calendarGrid.querySelector(".calendar-day[data-date]");

    if (defaultSelection instanceof HTMLButtonElement) {
      defaultSelection.classList.add("is-selected");
      renderDetails(defaultSelection.dataset.date);
    }
  };

  // –– Month navigation –––––––––––––––––––––––––––––––––––––––
  const navigateMonth = async (delta) => {
    displayMonth += delta;
    if (displayMonth < 0)  { displayMonth = 11; displayYear--; }
    if (displayMonth > 11) { displayMonth = 0;  displayYear++; }
    await loadMonthData(displayYear, displayMonth);
    renderCalendar();
  };

  calendarPrevButton?.addEventListener("click", () => navigateMonth(-1));
  calendarNextButton?.addEventListener("click", () => navigateMonth(+1));

  confirmBookingBtn?.addEventListener("click", async () => {
    if (!selectedDateKey) {
      alert("Please select a date first.");
      return;
    }
    if (!selectedTimeSlot || selectedTimeSlot === "Not Available") {
      alert("This date is fully booked. Please choose a different date.");
      return;
    }

    const user = window.rvAuth.getUser();
    const newBooking = {
      id: Date.now(),
      client: user ? user.name : "Guest Student",
      service: bookingInfo.service,
      provider: bookingInfo.provider,
      providerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      providerRating: "4.9",
      time: selectedTimeSlot,
      date: selectedDateLabel.textContent,
      status: "Pending",
      category: bookingInfo.category,
      location: "Main Campus Center",
    };

    // Store in localStorage for session-persistent demo
    const stored = JSON.parse(localStorage.getItem("rv_user_bookings") || "[]");
    stored.unshift(newBooking);
    localStorage.setItem("rv_user_bookings", JSON.stringify(stored));

    // Optional: Send to API
    if (window.rvAuth.getToken()) {
      try {
        await window.rvAuth.authFetch("/bookings", {
          method: "POST",
          body: JSON.stringify(newBooking)
        });
      } catch (e) { console.warn("API booking failed, using local storage fallback."); }
    }

    confirmBookingBtn.textContent = "Booking Confirmed! ✓“";
    confirmBookingBtn.classList.add("button-success");
    
    setTimeout(() => {
      window.location.href = "bookings.html";
    }, 1000);
  });

  // –– Initial render –––––––––––––––––––––––––––––––––––––––––
  (async () => {
    await loadMonthData(displayYear, displayMonth);
    renderCalendar();
  })();
}
