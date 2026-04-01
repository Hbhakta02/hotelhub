document.addEventListener("DOMContentLoaded", () => {
  const roomStorageKey = "hotelhub_rooms";
  const roomRateStorageKey = "hotelhub_room_rates";
  const guestStorageKey = "hotelhub_guests";
  const themeStorageKey = "hotelhub-theme";
  const authStorageKey = "hotelhub-authenticated";
  const defaultRoomRates = {
    "NS Q": 129,
    "NS QQ": 129,
    "NS QQQ": 129,
    "NS K": 129,
    "SM Q": 129,
    "SM K": 129
  };

  const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "dashboard.html";
  const isAuthenticated = localStorage.getItem(authStorageKey) === "true";

  if (!isAuthenticated) {
    window.location.replace("index.html");
    return;
  }

  const navItems = [
    { href: "dashboard.html", label: "Dashboard" },
    { href: "checkin.html", label: "Check-In" },
    { href: "arrivals.html", label: "Arrivals" },
    { href: "inhouse.html", label: "In-House" },
    { href: "departures.html", label: "Departures" }
  ];

  const getNavbarMarkup = () => {
    const navLinks = navItems
      .map((item) => {
        const isActive = currentPage === item.href.toLowerCase();
        return `
          <a href="${item.href}" class="nav-link ${isActive ? "active" : ""}">
            ${item.label}
          </a>
        `;
      })
      .join("");

    return `
      <aside class="navbar">
        <div class="navbar-top">
          <h2 class="logo">HotelHub</h2>
        </div>

        <nav class="navbar-nav">
          ${navLinks}
        </nav>

        <div class="navbar-footer">
          <div class="staff-menu">
            <button id="staffMenuToggle" class="profile-chip" type="button" aria-expanded="false" aria-label="Open profile menu">
              <span class="profile-chip__initial">H</span>
            </button>

            <div id="staffDropdown" class="staff-dropdown hidden">
              <button id="navbarThemeToggle" class="staff-dropdown-item" type="button">🌙 Dark Mode</button>
              <a href="settings.html" class="staff-dropdown-item">⚙️ Settings</a>
              <button class="staff-dropdown-item logout-item" type="button">↩ Log Out</button>
            </div>
          </div>
        </div>
      </aside>
    `;
  };

  const mountUniversalNavbar = () => {
    const appLayout = document.querySelector(".app-layout");
    if (!appLayout) return;

    const existingNavbar = appLayout.querySelector(".navbar");

    if (existingNavbar) {
      existingNavbar.remove();
    }

    appLayout.insertAdjacentHTML("afterbegin", getNavbarMarkup());
  };

  mountUniversalNavbar();

  const navbarThemeToggle = document.getElementById("navbarThemeToggle");
  const staffMenuToggle = document.getElementById("staffMenuToggle");
  const staffDropdown = document.getElementById("staffDropdown");
  const logoutButton = document.querySelector(".logout-item");

  const savedTheme = localStorage.getItem(themeStorageKey);

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  const updateThemeButton = () => {
    if (!navbarThemeToggle) return;

    const isDark = document.body.classList.contains("dark-mode");
    navbarThemeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };

  updateThemeButton();

  if (navbarThemeToggle) {
    navbarThemeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem(themeStorageKey, theme);

      updateThemeButton();
    });
  }

  if (staffMenuToggle && staffDropdown) {
    staffMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const isHidden = staffDropdown.classList.contains("hidden");
      staffDropdown.classList.toggle("hidden");
      staffMenuToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      const clickedInside = event.target.closest(".staff-menu");

      if (!clickedInside) {
        staffDropdown.classList.add("hidden");
        staffMenuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(authStorageKey);
      window.location.replace("index.html");
    });
  }

  window.getStoredRooms = () => {
    try {
      const savedRooms = localStorage.getItem(roomStorageKey);

      if (!savedRooms) return [];

      const parsedRooms = JSON.parse(savedRooms);

      if (!Array.isArray(parsedRooms)) return [];

      return parsedRooms
        .map((room) => ({
          number: String(room.number || "").trim(),
          type: String(room.type || "").trim(),
          status: String(room.status || "clean").trim().toLowerCase()
        }))
        .filter((room) => room.number);
    } catch {
      return [];
    }
  };

  window.saveStoredRooms = (rooms) => {
    if (!Array.isArray(rooms)) {
      localStorage.setItem(roomStorageKey, JSON.stringify([]));
      return;
    }

    const cleanedRooms = rooms
      .map((room) => ({
        number: String(room.number || "").trim(),
        type: String(room.type || "").trim(),
        status: String(room.status || "clean").trim().toLowerCase()
      }))
      .filter((room) => room.number);

    localStorage.setItem(roomStorageKey, JSON.stringify(cleanedRooms));
  };

  window.getStoredRoomRates = () => {
    try {
      const savedRates = localStorage.getItem(roomRateStorageKey);
      const parsedRates = JSON.parse(savedRates || "{}");

      if (!parsedRates || typeof parsedRates !== "object" || Array.isArray(parsedRates)) {
        return { ...defaultRoomRates };
      }

      return Object.entries(defaultRoomRates).reduce((accumulator, [roomType, fallbackRate]) => {
        const parsedRate = Number(parsedRates[roomType]);
        accumulator[roomType] = Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : fallbackRate;
        return accumulator;
      }, {});
    } catch {
      return { ...defaultRoomRates };
    }
  };

  window.saveStoredRoomRates = (rates) => {
    const nextRates = Object.entries(defaultRoomRates).reduce((accumulator, [roomType, fallbackRate]) => {
      const parsedRate = Number(rates?.[roomType]);
      accumulator[roomType] = Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : fallbackRate;
      return accumulator;
    }, {});

    localStorage.setItem(roomRateStorageKey, JSON.stringify(nextRates));
    window.dispatchEvent(new Event("hotelhub-room-rates-updated"));
  };

  window.getStoredGuests = () => {
    try {
      const savedGuests = localStorage.getItem(guestStorageKey);
      const parsedGuests = JSON.parse(savedGuests || "[]");

      if (!Array.isArray(parsedGuests)) return [];

      return parsedGuests
        .map((guest) => ({
          id: String(guest.id || "").trim(),
          createdAt: guest.createdAt || "",
          updatedAt: guest.updatedAt || "",
          guest: {
            firstName: String(guest.guest?.firstName || "").trim(),
            lastName: String(guest.guest?.lastName || "").trim(),
            address1: String(guest.guest?.address1 || "").trim(),
            address2: String(guest.guest?.address2 || "").trim(),
            city: String(guest.guest?.city || "").trim(),
            state: String(guest.guest?.state || "").trim(),
            zip: String(guest.guest?.zip || "").trim(),
            country: String(guest.guest?.country || "").trim(),
            phone: String(guest.guest?.phone || "").trim(),
            email: String(guest.guest?.email || "").trim(),
            company: String(guest.guest?.company || "").trim()
          },
          vehicle: String(guest.vehicle || "").trim(),
          identification: {
            idType: String(guest.identification?.idType || "").trim(),
            idNumber: String(guest.identification?.idNumber || "").trim()
          },
          notes: String(guest.notes || "").trim()
        }))
        .filter((guest) => guest.id && (guest.guest.firstName || guest.guest.lastName));
    } catch {
      return [];
    }
  };

  window.saveStoredGuests = (guests) => {
    if (!Array.isArray(guests)) {
      localStorage.setItem(guestStorageKey, JSON.stringify([]));
      return;
    }

    localStorage.setItem(guestStorageKey, JSON.stringify(guests));
    window.dispatchEvent(new Event("hotelhub-guests-updated"));
  };

  window.upsertStoredGuest = (guestProfile) => {
    const storedGuests = typeof window.getStoredGuests === "function" ? window.getStoredGuests() : [];
    const now = new Date().toISOString();

    const normalizeValue = (value) => String(value || "").trim().toLowerCase();
    const profileId = String(guestProfile?.id || "").trim();
    const profileFirstName = normalizeValue(guestProfile?.guest?.firstName);
    const profileLastName = normalizeValue(guestProfile?.guest?.lastName);
    const profilePhone = normalizeValue(guestProfile?.guest?.phone);
    const profileEmail = normalizeValue(guestProfile?.guest?.email);

    let existingIndex = storedGuests.findIndex((guest) => guest.id === profileId);

    if (existingIndex === -1) {
      existingIndex = storedGuests.findIndex((guest) => {
        const samePhone = profilePhone && normalizeValue(guest.guest?.phone) === profilePhone;
        const sameEmail = profileEmail && normalizeValue(guest.guest?.email) === profileEmail;
        const sameName =
          profileFirstName &&
          profileLastName &&
          normalizeValue(guest.guest?.firstName) === profileFirstName &&
          normalizeValue(guest.guest?.lastName) === profileLastName;

        return samePhone || sameEmail || sameName;
      });
    }

    const nextGuest = {
      id: existingIndex !== -1 ? storedGuests[existingIndex].id : `guest-${Date.now()}`,
      createdAt: existingIndex !== -1 ? storedGuests[existingIndex].createdAt || now : now,
      updatedAt: now,
      guest: {
        firstName: String(guestProfile?.guest?.firstName || "").trim(),
        lastName: String(guestProfile?.guest?.lastName || "").trim(),
        address1: String(guestProfile?.guest?.address1 || "").trim(),
        address2: String(guestProfile?.guest?.address2 || "").trim(),
        city: String(guestProfile?.guest?.city || "").trim(),
        state: String(guestProfile?.guest?.state || "").trim(),
        zip: String(guestProfile?.guest?.zip || "").trim(),
        country: String(guestProfile?.guest?.country || "").trim(),
        phone: String(guestProfile?.guest?.phone || "").trim(),
        email: String(guestProfile?.guest?.email || "").trim(),
        company: String(guestProfile?.guest?.company || "").trim()
      },
      vehicle: String(guestProfile?.vehicle || "").trim(),
      identification: {
        idType: String(guestProfile?.identification?.idType || "").trim(),
        idNumber: String(guestProfile?.identification?.idNumber || "").trim()
      },
      notes: String(guestProfile?.notes || "").trim()
    };

    if (existingIndex !== -1) {
      storedGuests[existingIndex] = nextGuest;
    } else {
      storedGuests.push(nextGuest);
    }

    window.saveStoredGuests(storedGuests);
    return nextGuest;
  };

});
