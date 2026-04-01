document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("departures-page")) return;

  const departuresTableBody = document.getElementById("departuresTableBody");
  const departuresCount = document.getElementById("departuresCount");
  const departureDetailsModal = document.getElementById("departureDetailsModal");
  const departureDetailsBackdrop = document.getElementById("departureDetailsBackdrop");
  const departureDetailsClose = document.getElementById("departureDetailsClose");
  const departurePrintReceiptBtn = document.getElementById("departurePrintReceiptBtn");
  const departureDetailsGuestName = document.getElementById("departureDetailsGuestName");
  const departureDetailsPhone = document.getElementById("departureDetailsPhone");
  const departureDetailsEmail = document.getElementById("departureDetailsEmail");
  const departureDetailsArrival = document.getElementById("departureDetailsArrival");
  const departureDetailsDeparture = document.getElementById("departureDetailsDeparture");
  const departureDetailsNights = document.getElementById("departureDetailsNights");
  const departureDetailsRoom = document.getElementById("departureDetailsRoom");
  const departureDetailsRoomType = document.getElementById("departureDetailsRoomType");
  const departureDetailsAdults = document.getElementById("departureDetailsAdults");
  const departureDetailsChildren = document.getElementById("departureDetailsChildren");
  const departureDetailsPets = document.getElementById("departureDetailsPets");
  const departureDetailsVehicle = document.getElementById("departureDetailsVehicle");
  const departureDetailsRate = document.getElementById("departureDetailsRate");
  const departureDetailsTax = document.getElementById("departureDetailsTax");
  const departureDetailsTotal = document.getElementById("departureDetailsTotal");
  const departureDetailsPaymentType = document.getElementById("departureDetailsPaymentType");
  const departureDetailsCard = document.getElementById("departureDetailsCard");

  if (
    !departuresTableBody ||
    !departuresCount ||
    !departureDetailsModal ||
    !departureDetailsBackdrop ||
    !departureDetailsClose
  ) {
    return;
  }

  const stayStorageKey = "hotelhub_active_stays";
  const roomStorageKey = "hotelhub_rooms";
  const receiptStorageKey = "hotelhub_receipts";
  let activeDepartureStay = null;

  const getStoredStays = () => {
    try {
      const savedStays = localStorage.getItem(stayStorageKey);
      const parsedStays = JSON.parse(savedStays || "[]");
      return Array.isArray(parsedStays) ? parsedStays : [];
    } catch {
      return [];
    }
  };

  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const getStoredReceipts = () => {
    try {
      const savedReceipts = localStorage.getItem(receiptStorageKey);
      const parsedReceipts = JSON.parse(savedReceipts || "[]");
      return Array.isArray(parsedReceipts) ? parsedReceipts : [];
    } catch {
      return [];
    }
  };

  const saveStoredReceipts = (receipts) => {
    localStorage.setItem(receiptStorageKey, JSON.stringify(receipts));
  };

  const saveStoredStays = (stays) => {
    localStorage.setItem(stayStorageKey, JSON.stringify(stays));
  };

  const updateRoomStatus = (targetRoomNumber, nextStatus) => {
    const storedRooms =
      typeof window.getStoredRooms === "function" ? window.getStoredRooms() : [];
    const nextRooms = storedRooms.map((room) =>
      room.number === targetRoomNumber ? { ...room, status: nextStatus } : room
    );

    if (typeof window.saveStoredRooms === "function") {
      window.saveStoredRooms(nextRooms);
    } else {
      localStorage.setItem(roomStorageKey, JSON.stringify(nextRooms));
    }

    window.dispatchEvent(new Event("hotelhub-rooms-updated"));
  };

  const closeDepartureDetails = () => {
    activeDepartureStay = null;
    departureDetailsModal.classList.add("hidden");
    departureDetailsModal.setAttribute("aria-hidden", "true");
  };

  const openDepartureDetails = (stay) => {
    if (!stay) return;
    activeDepartureStay = stay;

    const guestName = `${stay.guest?.firstName || ""} ${stay.guest?.lastName || ""}`.trim() || "Guest";
    const taxAmount = Number(stay.stay?.subtotalAmount || 0) * (Number(stay.stay?.taxRate || 0) / 100);

    if (departureDetailsGuestName) departureDetailsGuestName.textContent = guestName;
    if (departureDetailsPhone) departureDetailsPhone.textContent = stay.guest?.phone || "--";
    if (departureDetailsEmail) departureDetailsEmail.textContent = stay.guest?.email || "--";
    if (departureDetailsArrival) departureDetailsArrival.textContent = formatShortDate(stay.stay?.checkInDate);
    if (departureDetailsDeparture) departureDetailsDeparture.textContent = formatShortDate(stay.stay?.checkOutDate);
    if (departureDetailsNights) departureDetailsNights.textContent = String(stay.stay?.nights ?? "--");
    if (departureDetailsRoom) departureDetailsRoom.textContent = stay.stay?.roomNumber || "--";
    if (departureDetailsRoomType) departureDetailsRoomType.textContent = stay.stay?.roomType || "--";
    if (departureDetailsAdults) departureDetailsAdults.textContent = String(stay.stay?.adults ?? "--");
    if (departureDetailsChildren) departureDetailsChildren.textContent = String(stay.stay?.children ?? "--");
    if (departureDetailsPets) departureDetailsPets.textContent = String(stay.stay?.pets ?? "--");
    if (departureDetailsVehicle) departureDetailsVehicle.textContent = stay.stay?.vehicle || "--";
    if (departureDetailsRate) departureDetailsRate.textContent = formatCurrency(stay.stay?.rate);
    if (departureDetailsTax) departureDetailsTax.textContent = formatCurrency(taxAmount);
    if (departureDetailsTotal) departureDetailsTotal.textContent = formatCurrency(stay.stay?.totalAmount);
    if (departureDetailsPaymentType) departureDetailsPaymentType.textContent = stay.payment?.paymentType || "--";
    if (departureDetailsCard) {
      departureDetailsCard.textContent = stay.payment?.cardNumberLast4 ? `**** ${stay.payment.cardNumberLast4}` : "--";
    }

    departureDetailsModal.classList.remove("hidden");
    departureDetailsModal.setAttribute("aria-hidden", "false");
  };

  const buildReceiptFromStay = (stay) => ({
    id: stay.receiptId || `receipt-${stay.id || Date.now()}`,
    status: stay.status || "checked-in",
    guestId: stay.guestId || "",
    confirmationNumber: stay.confirmationNumber || "",
    source: stay.source || "walkin",
    createdAt: stay.updatedAt || stay.createdAt || new Date().toISOString(),
    guest: {
      firstName: stay.guest?.firstName || "",
      lastName: stay.guest?.lastName || "",
      address1: stay.guest?.address1 || "",
      address2: stay.guest?.address2 || "",
      city: stay.guest?.city || "",
      state: stay.guest?.state || "",
      zip: stay.guest?.zip || "",
      country: stay.guest?.country || "",
      phone: stay.guest?.phone || "",
      email: stay.guest?.email || "",
      company: stay.guest?.company || ""
    },
    stay: {
      checkInDate: stay.stay?.checkInDate || "",
      checkOutDate: stay.stay?.checkOutDate || "",
      nights: Number(stay.stay?.nights || 0),
      adults: Number(stay.stay?.adults || 1),
      children: Number(stay.stay?.children || 0),
      pets: Number(stay.stay?.pets || 0),
      rate: Number(stay.stay?.rate || 0),
      adultFeePerNight: 10,
      petFeePerNight: 15,
      taxRate: Number(stay.stay?.taxRate || 0),
      subtotalAmount: Number(stay.stay?.subtotalAmount || 0),
      totalAmount: Number(stay.stay?.totalAmount || 0),
      rackRate: stay.stay?.rackRate || "",
      roomType: stay.stay?.roomType || "",
      roomNumber: stay.stay?.roomNumber || ""
    },
    payment: {
      paymentType: stay.payment?.paymentType || "",
      cardNumberLast4: stay.payment?.cardNumberLast4 || "",
      expiry: stay.payment?.expiry || ""
    },
    notes: stay.notes || ""
  });

  const printReceiptForStay = () => {
    if (!activeDepartureStay) return;

    const storedReceipts = getStoredReceipts();
    const nextReceipt = buildReceiptFromStay(activeDepartureStay);
    const existingIndex = storedReceipts.findIndex((receipt) => receipt.id === nextReceipt.id);

    if (existingIndex >= 0) {
      storedReceipts[existingIndex] = {
        ...storedReceipts[existingIndex],
        ...nextReceipt
      };
    } else {
      storedReceipts.push(nextReceipt);
    }

    saveStoredReceipts(storedReceipts);
    window.open(`receipt.html?id=${encodeURIComponent(nextReceipt.id)}`, "_blank", "noopener");
  };

  const renderDepartures = () => {
    const todayKey = getTodayKey();
    const departures = getStoredStays()
      .filter((stay) => stay?.stay?.checkOutDate === todayKey)
      .filter((stay) => (stay.status || "checked-in") === "checked-in");

    departuresCount.textContent = `${departures.length} departure${departures.length === 1 ? "" : "s"}`;

    if (!departures.length) {
      departuresTableBody.innerHTML = `
        <tr>
          <td colspan="6">No departures scheduled for today.</td>
        </tr>
      `;
      return;
    }

    departuresTableBody.innerHTML = departures
      .map((stay, index) => {
        const guestName = `${stay.guest?.firstName || ""} ${stay.guest?.lastName || ""}`.trim();
        const roomLabel = stay.stay?.roomNumber
          ? `${stay.stay.roomNumber} - ${stay.stay.roomType || ""}`.trim()
          : "--";
        const nights = stay.stay?.nights || "--";

        return `
          <tr>
            <td>${guestName || "Guest"}</td>
            <td>${roomLabel}</td>
            <td>${nights}</td>
            <td>Today</td>
            <td><span class="badge occupied">In House</span></td>
            <td>
              <button class="secondary-btn departure-view-btn" type="button" data-index="${index}">View Details</button>
              <button class="primary-btn departure-checkout-btn" type="button" data-index="${index}">Check Out</button>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  renderDepartures();
  departuresTableBody.addEventListener("click", (event) => {
    const departures = getStoredStays()
      .filter((stay) => stay?.stay?.checkOutDate === getTodayKey())
      .filter((stay) => (stay.status || "checked-in") === "checked-in");

    const viewButton = event.target.closest(".departure-view-btn");
    if (viewButton) {
      const stay = departures[Number(viewButton.dataset.index)];
      openDepartureDetails(stay);
      return;
    }

    const checkoutButton = event.target.closest(".departure-checkout-btn");
    if (!checkoutButton) return;
    const stay = departures[Number(checkoutButton.dataset.index)];
    if (!stay?.stay?.roomNumber) return;

    const nextStays = getStoredStays().filter((item) => item.id !== stay.id);
    saveStoredStays(nextStays);
    updateRoomStatus(stay.stay.roomNumber, "dirty");
    renderDepartures();
  });
  departureDetailsModal.addEventListener("click", (event) => {
    if (event.target === departureDetailsBackdrop) {
      closeDepartureDetails();
    }
  });
  if (departurePrintReceiptBtn) {
    departurePrintReceiptBtn.addEventListener("click", printReceiptForStay);
  }
  departureDetailsClose.addEventListener("click", closeDepartureDetails);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !departureDetailsModal.classList.contains("hidden")) {
      closeDepartureDetails();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === stayStorageKey) {
      renderDepartures();
    }
  });
});
