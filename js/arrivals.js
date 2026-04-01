document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("arrivals-page")) return;

  const arrivalsTableBody = document.getElementById("arrivalsTableBody");
  const arrivalsDate = document.getElementById("arrivalsDate");
  const arrivalsTodayBtn = document.getElementById("arrivalsTodayBtn");
  const arrivalsDateLabel = document.getElementById("arrivalsDateLabel");
  const arrivalsCount = document.getElementById("arrivalsCount");
  const arrivalDetailsModal = document.getElementById("arrivalDetailsModal");
  const arrivalDetailsBackdrop = document.getElementById("arrivalDetailsBackdrop");
  const arrivalDetailsClose = document.getElementById("arrivalDetailsClose");
  const arrivalDetailsEdit = document.getElementById("arrivalDetailsEdit");
  const arrivalDetailsSave = document.getElementById("arrivalDetailsSave");
  const arrivalDetailsGuestName = document.getElementById("arrivalDetailsGuestName");
  const arrivalDetailsPhone = document.getElementById("arrivalDetailsPhone");
  const arrivalDetailsEmail = document.getElementById("arrivalDetailsEmail");
  const arrivalDetailsConfirmation = document.getElementById("arrivalDetailsConfirmation");
  const arrivalDetailsArrival = document.getElementById("arrivalDetailsArrival");
  const arrivalDetailsDeparture = document.getElementById("arrivalDetailsDeparture");
  const arrivalDetailsNights = document.getElementById("arrivalDetailsNights");
  const arrivalDetailsRoom = document.getElementById("arrivalDetailsRoom");
  const arrivalDetailsRoomType = document.getElementById("arrivalDetailsRoomType");
  const arrivalDetailsAdults = document.getElementById("arrivalDetailsAdults");
  const arrivalDetailsChildren = document.getElementById("arrivalDetailsChildren");
  const arrivalDetailsPets = document.getElementById("arrivalDetailsPets");
  const arrivalDetailsVehicle = document.getElementById("arrivalDetailsVehicle");
  const arrivalDetailsRate = document.getElementById("arrivalDetailsRate");
  const arrivalDetailsTax = document.getElementById("arrivalDetailsTax");
  const arrivalDetailsTotal = document.getElementById("arrivalDetailsTotal");
  const arrivalDetailsPaymentType = document.getElementById("arrivalDetailsPaymentType");
  const arrivalDetailsCard = document.getElementById("arrivalDetailsCard");
  const arrivalEditPanel = document.getElementById("arrivalEditPanel");
  const arrivalEditFirstName = document.getElementById("arrivalEditFirstName");
  const arrivalEditLastName = document.getElementById("arrivalEditLastName");
  const arrivalEditPhone = document.getElementById("arrivalEditPhone");
  const arrivalEditEmail = document.getElementById("arrivalEditEmail");
  const arrivalEditCheckIn = document.getElementById("arrivalEditCheckIn");
  const arrivalEditCheckOut = document.getElementById("arrivalEditCheckOut");
  const arrivalEditRoomType = document.getElementById("arrivalEditRoomType");
  const arrivalEditRoomNumber = document.getElementById("arrivalEditRoomNumber");
  const arrivalEditAdults = document.getElementById("arrivalEditAdults");
  const arrivalEditChildren = document.getElementById("arrivalEditChildren");
  const arrivalEditPets = document.getElementById("arrivalEditPets");
  const arrivalEditVehicle = document.getElementById("arrivalEditVehicle");
  const arrivalEditRate = document.getElementById("arrivalEditRate");
  const arrivalEditTaxRate = document.getElementById("arrivalEditTaxRate");
  const arrivalEditPaymentType = document.getElementById("arrivalEditPaymentType");

  if (
    !arrivalsTableBody ||
    !arrivalsDate ||
    !arrivalsTodayBtn ||
    !arrivalsDateLabel ||
    !arrivalsCount ||
    !arrivalDetailsModal ||
    !arrivalDetailsBackdrop ||
    !arrivalDetailsClose ||
    !arrivalDetailsEdit ||
    !arrivalDetailsSave ||
    !arrivalEditPanel
  ) {
    return;
  }

  const reservationStorageKey = "hotelhub_reservations";
  const stayStorageKey = "hotelhub_active_stays";
  const roomStorageKey = "hotelhub_rooms";
  let currentArrivalReservation = null;

  const getStoredReservations = () => {
    try {
      const savedReservations = localStorage.getItem(reservationStorageKey);
      const parsedReservations = JSON.parse(savedReservations || "[]");
      return Array.isArray(parsedReservations) ? parsedReservations : [];
    } catch {
      return [];
    }
  };

  const saveStoredReservations = (reservations) => {
    localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
  };

  const getStoredStays = () => {
    try {
      const savedStays = localStorage.getItem(stayStorageKey);
      const parsedStays = JSON.parse(savedStays || "[]");
      return Array.isArray(parsedStays) ? parsedStays : [];
    } catch {
      return [];
    }
  };

  const saveStoredStays = (stays) => {
    localStorage.setItem(stayStorageKey, JSON.stringify(stays));
    window.dispatchEvent(new Event("hotelhub-stays-updated"));
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

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

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

  const formatLabelDate = (dateString) => {
    if (!dateString) return "Arrivals";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Arrivals";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  };

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const closeArrivalDetails = () => {
    arrivalDetailsModal.classList.add("hidden");
    arrivalDetailsModal.setAttribute("aria-hidden", "true");
    arrivalEditPanel.classList.add("hidden");
    arrivalDetailsSave.classList.add("hidden");
    currentArrivalReservation = null;
  };

  const openArrivalDetails = (reservation) => {
    if (!reservation) return;
    currentArrivalReservation = reservation;

    const guestName = `${reservation.guest?.firstName || ""} ${reservation.guest?.lastName || ""}`.trim() || "Guest";
    const taxAmount = Number(reservation.stay?.subtotalAmount || 0) * (Number(reservation.stay?.taxRate || 0) / 100);

    if (arrivalDetailsGuestName) arrivalDetailsGuestName.textContent = guestName;
    if (arrivalDetailsPhone) arrivalDetailsPhone.textContent = reservation.guest?.phone || "--";
    if (arrivalDetailsEmail) arrivalDetailsEmail.textContent = reservation.guest?.email || "--";
    if (arrivalDetailsConfirmation) arrivalDetailsConfirmation.textContent = reservation.confirmationNumber || "--";
    if (arrivalDetailsArrival) arrivalDetailsArrival.textContent = formatShortDate(reservation.stay?.checkInDate);
    if (arrivalDetailsDeparture) arrivalDetailsDeparture.textContent = formatShortDate(reservation.stay?.checkOutDate);
    if (arrivalDetailsNights) arrivalDetailsNights.textContent = String(reservation.stay?.nights ?? "--");
    if (arrivalDetailsRoom) arrivalDetailsRoom.textContent = reservation.stay?.roomNumber || "--";
    if (arrivalDetailsRoomType) arrivalDetailsRoomType.textContent = reservation.stay?.roomType || "--";
    if (arrivalDetailsAdults) arrivalDetailsAdults.textContent = String(reservation.stay?.adults ?? "--");
    if (arrivalDetailsChildren) arrivalDetailsChildren.textContent = String(reservation.stay?.children ?? "--");
    if (arrivalDetailsPets) arrivalDetailsPets.textContent = String(reservation.stay?.pets ?? "--");
    if (arrivalDetailsVehicle) arrivalDetailsVehicle.textContent = reservation.stay?.vehicle || "--";
    if (arrivalDetailsRate) arrivalDetailsRate.textContent = formatCurrency(reservation.stay?.rate);
    if (arrivalDetailsTax) arrivalDetailsTax.textContent = formatCurrency(taxAmount);
    if (arrivalDetailsTotal) arrivalDetailsTotal.textContent = formatCurrency(reservation.stay?.totalAmount);
    if (arrivalDetailsPaymentType) arrivalDetailsPaymentType.textContent = reservation.payment?.paymentType || "--";
    if (arrivalDetailsCard) {
      arrivalDetailsCard.textContent = reservation.payment?.cardNumberLast4
        ? `**** ${reservation.payment.cardNumberLast4}`
        : "--";
    }

    arrivalEditFirstName.value = reservation.guest?.firstName || "";
    arrivalEditLastName.value = reservation.guest?.lastName || "";
    arrivalEditPhone.value = reservation.guest?.phone || "";
    arrivalEditEmail.value = reservation.guest?.email || "";
    arrivalEditCheckIn.value = reservation.stay?.checkInDate || "";
    arrivalEditCheckOut.value = reservation.stay?.checkOutDate || "";
    arrivalEditRoomType.value = reservation.stay?.roomType || "";
    arrivalEditRoomNumber.value = reservation.stay?.roomNumber || "";
    arrivalEditAdults.value = String(reservation.stay?.adults ?? 1);
    arrivalEditChildren.value = String(reservation.stay?.children ?? 0);
    arrivalEditPets.value = String(reservation.stay?.pets ?? 0);
    arrivalEditVehicle.value = reservation.stay?.vehicle || "";
    arrivalEditRate.value = String(reservation.stay?.rate ?? 0);
    arrivalEditTaxRate.value = String(reservation.stay?.taxRate ?? 0);
    arrivalEditPaymentType.value = reservation.payment?.paymentType || "";

    arrivalDetailsModal.classList.remove("hidden");
    arrivalDetailsModal.setAttribute("aria-hidden", "false");
  };

  const saveArrivalDetails = () => {
    if (!currentArrivalReservation) return;

    const updatedReservations = getStoredReservations().map((reservation) => {
      if (reservation.confirmationNumber !== currentArrivalReservation.confirmationNumber) {
        return reservation;
      }

      const checkInDate = arrivalEditCheckIn.value || reservation.stay?.checkInDate || "";
      const checkOutDate = arrivalEditCheckOut.value || reservation.stay?.checkOutDate || "";
      const start = checkInDate ? new Date(`${checkInDate}T00:00:00`) : null;
      const end = checkOutDate ? new Date(`${checkOutDate}T00:00:00`) : null;
      const nights =
        start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
          ? Math.max(0, Math.round((end - start) / 86400000))
          : Number(reservation.stay?.nights || 0);
      const rate = Number(arrivalEditRate.value || reservation.stay?.rate || 0);
      const taxRate = Number(arrivalEditTaxRate.value || reservation.stay?.taxRate || 0);
      const subtotalAmount = Number((nights * rate).toFixed(2));
      const totalAmount = Number((subtotalAmount + subtotalAmount * (taxRate / 100)).toFixed(2));

      const nextReservation = {
        ...reservation,
        guest: {
          ...reservation.guest,
          firstName: arrivalEditFirstName.value.trim(),
          lastName: arrivalEditLastName.value.trim(),
          phone: arrivalEditPhone.value.trim(),
          email: arrivalEditEmail.value.trim()
        },
        stay: {
          ...reservation.stay,
          checkInDate,
          checkOutDate,
          nights,
          roomType: arrivalEditRoomType.value.trim(),
          roomNumber: arrivalEditRoomNumber.value.trim(),
          adults: Number(arrivalEditAdults.value || 1),
          children: Number(arrivalEditChildren.value || 0),
          pets: Number(arrivalEditPets.value || 0),
          vehicle: arrivalEditVehicle.value.trim(),
          rate,
          taxRate,
          subtotalAmount,
          totalAmount
        },
        payment: {
          ...reservation.payment,
          paymentType: arrivalEditPaymentType.value.trim()
        }
      };

      currentArrivalReservation = nextReservation;
      return nextReservation;
    });

    saveStoredReservations(updatedReservations);
    openArrivalDetails(currentArrivalReservation);
    arrivalEditPanel.classList.add("hidden");
    arrivalDetailsSave.classList.add("hidden");
    renderArrivals();
  };

  const buildActiveStayFromReservation = (reservation) => ({
    ...reservation,
    id: reservation.id || `stay-${Date.now()}`,
    source: "reservation",
    status: "checked-in"
  });

  const getSelectedDate = () => arrivalsDate.value || getTodayKey();

  const updateToolbarCopy = (selectedDate, count) => {
    const todayKey = getTodayKey();
    arrivalsDateLabel.textContent =
      selectedDate === todayKey ? "Today's Arrivals" : `${formatLabelDate(selectedDate)} Arrivals`;
    arrivalsCount.textContent = `${count} reservation${count === 1 ? "" : "s"}`;
  };

  const getFilteredArrivals = (selectedDate) =>
    getStoredReservations()
      .filter((reservation) => reservation?.stay?.checkInDate === selectedDate)
      .filter((reservation) => (reservation.status || "reserved") === "reserved")
      .sort((a, b) => {
        const guestA = `${a.guest?.lastName || ""} ${a.guest?.firstName || ""}`.trim();
        const guestB = `${b.guest?.lastName || ""} ${b.guest?.firstName || ""}`.trim();
        return guestA.localeCompare(guestB, undefined, { sensitivity: "base" });
      });

  const renderArrivals = () => {
    const selectedDate = getSelectedDate();
    const todayKey = getTodayKey();
    const arrivals = getFilteredArrivals(selectedDate);

    updateToolbarCopy(selectedDate, arrivals.length);

    if (!arrivals.length) {
      arrivalsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="arrivals-empty">No arrivals scheduled for ${selectedDate === todayKey ? "today" : formatLabelDate(selectedDate).toLowerCase()}.</td>
        </tr>
      `;
      return;
    }

    arrivalsTableBody.innerHTML = arrivals
      .map((reservation, index) => {
        const guestName = `${reservation.guest?.firstName || ""} ${reservation.guest?.lastName || ""}`.trim() || "Guest";
        const arrivalDate = formatShortDate(reservation.stay?.checkInDate);
        const departureDate = formatShortDate(reservation.stay?.checkOutDate);
        const nights = reservation.stay?.nights || "--";
        const roomNumber = reservation.stay?.roomNumber || "--";
        const totalAmount = reservation.stay?.totalAmount ?? 0;
        const isToday = selectedDate === todayKey;

        return `
          <tr>
            <td>${guestName}</td>
            <td>${arrivalDate}</td>
            <td>${departureDate}</td>
            <td>${nights}</td>
            <td>${roomNumber}</td>
            <td class="arrivals-price">${formatCurrency(totalAmount)}</td>
            <td>
              <button class="secondary-btn arrival-view-btn" type="button" data-index="${index}">View Details</button>
              ${
                isToday
                  ? `<button class="primary-btn arrival-checkin-btn" type="button" data-index="${index}">Check In</button>`
                  : `<span class="badge reserved">Upcoming</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");
  };

  const checkInReservation = (reservation) => {
    if (!reservation?.stay?.roomNumber) return;

    const activeStays = getStoredStays();
    const alreadyCheckedIn = activeStays.some(
      (stay) =>
        stay?.stay?.roomNumber === reservation.stay.roomNumber &&
        (stay.status || "checked-in") === "checked-in"
    );

    if (alreadyCheckedIn) return;

    activeStays.push(buildActiveStayFromReservation(reservation));
    saveStoredStays(activeStays);

    const updatedReservations = getStoredReservations().map((item) =>
      item.confirmationNumber === reservation.confirmationNumber
        ? { ...item, status: "checked-in" }
        : item
    );

    saveStoredReservations(updatedReservations);
    updateRoomStatus(reservation.stay.roomNumber, "occupied");
    renderArrivals();
  };

  arrivalsTodayBtn.addEventListener("click", () => {
    arrivalsDate.value = getTodayKey();
    renderArrivals();
  });

  arrivalsDate.addEventListener("change", renderArrivals);

  arrivalsTableBody.addEventListener("click", (event) => {
    const viewButton = event.target.closest(".arrival-view-btn");
    const checkInButton = event.target.closest(".arrival-checkin-btn");
    const arrivals = getFilteredArrivals(getSelectedDate());

    if (viewButton) {
      const reservation = arrivals[Number(viewButton.dataset.index)];
      openArrivalDetails(reservation);
      return;
    }

    if (!checkInButton) return;

    const reservation = arrivals[Number(checkInButton.dataset.index)];
    checkInReservation(reservation);
  });

  arrivalDetailsClose.addEventListener("click", closeArrivalDetails);
  arrivalDetailsEdit.addEventListener("click", () => {
    arrivalEditPanel.classList.toggle("hidden");
    arrivalDetailsSave.classList.toggle("hidden");
  });
  arrivalDetailsSave.addEventListener("click", saveArrivalDetails);
  arrivalDetailsBackdrop.addEventListener("click", closeArrivalDetails);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeArrivalDetails();
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === reservationStorageKey || event.key === stayStorageKey) {
      renderArrivals();
    }
  });

  window.addEventListener("hotelhub-rooms-updated", renderArrivals);
  window.addEventListener("hotelhub-stays-updated", renderArrivals);

  arrivalsDate.min = getTodayKey();
  arrivalsDate.value = getTodayKey();
  renderArrivals();
});
