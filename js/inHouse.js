document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("inhouse-page")) return;

  const roomStorageKey = "hotelhub_rooms";
  const stayStorageKey = "hotelhub_active_stays";
  const reservationStorageKey = "hotelhub_reservations";
  const receiptStorageKey = "hotelhub_receipts";

  const searchInput = document.getElementById("search");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");
  const summary = document.getElementById("summary");
  const grid = document.getElementById("grid");
  const guestModal = document.getElementById("inhouseGuestModal");
  const guestModalBody = document.getElementById("inhouseGuestModalBody");
  const guestModalSubtitle = document.getElementById("inhouseGuestModalSubtitle");
  const guestModalClose = document.getElementById("inhouseGuestModalClose");
  const guestModalFeedback = document.getElementById("inhouseGuestModalFeedback");
  const printReceiptBtn = document.getElementById("inhousePrintReceiptBtn");
  const saveChangesBtn = document.getElementById("inhouseSaveChangesBtn");
  const checkoutEarlyBtn = document.getElementById("inhouseCheckoutEarlyBtn");

  if (
    !searchInput ||
    !statusFilter ||
    !typeFilter ||
    !summary ||
    !grid ||
    !guestModal ||
    !guestModalBody ||
    !guestModalSubtitle ||
    !guestModalClose ||
    !guestModalFeedback ||
    !printReceiptBtn ||
    !saveChangesBtn ||
    !checkoutEarlyBtn
  ) {
    return;
  }

  let activeModalStayId = "";
  let activeModalReservationConfirmation = "";

  const getStoredRooms = () => {
    if (typeof window.getStoredRooms === "function") {
      return window.getStoredRooms();
    }

    try {
      const savedRooms = localStorage.getItem(roomStorageKey);
      const parsedRooms = JSON.parse(savedRooms || "[]");
      return Array.isArray(parsedRooms) ? parsedRooms : [];
    } catch {
      return [];
    }
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

  const getStoredReservations = () => {
    try {
      const savedReservations = localStorage.getItem(reservationStorageKey);
      const parsedReservations = JSON.parse(savedReservations || "[]");
      return Array.isArray(parsedReservations) ? parsedReservations : [];
    } catch {
      return [];
    }
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

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

  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;

    const start = new Date(`${checkInDate}T00:00:00`);
    const end = new Date(`${checkOutDate}T00:00:00`);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));

    return diff > 0 ? diff : 0;
  };

  const formatLongDate = (dateString) => {
    if (!dateString) return "--";

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const getActiveStayForRoom = (roomNumber) =>
    getStoredStays().find(
      (stay) => stay?.stay?.roomNumber === roomNumber && (stay.status || "checked-in") === "checked-in"
    );

  const getActiveStayById = (stayId) =>
    getStoredStays().find((stay) => stay?.id === stayId && (stay.status || "checked-in") === "checked-in");

  const saveStoredStays = (stays) => {
    localStorage.setItem(stayStorageKey, JSON.stringify(stays));
    window.dispatchEvent(new Event("hotelhub-stays-updated"));
  };

  const clearModalFeedback = () => {
    guestModalFeedback.textContent = "";
    guestModalFeedback.classList.add("hidden", "is-error", "is-success");
  };

  const setModalActionVisibility = ({ showPrint = true, showCheckout = true, showSave = true } = {}) => {
    printReceiptBtn.classList.toggle("hidden", !showPrint);
    checkoutEarlyBtn.classList.toggle("hidden", !showCheckout);
    saveChangesBtn.classList.toggle("hidden", !showSave);
  };

  const showModalFeedback = (message, type) => {
    guestModalFeedback.textContent = message;
    guestModalFeedback.classList.remove("hidden", "is-error", "is-success");
    guestModalFeedback.classList.add(type === "error" ? "is-error" : "is-success");
  };

  const buildModalFormMarkup = (activeStay) => {
    const guestName =
      `${activeStay.guest?.firstName || ""} ${activeStay.guest?.lastName || ""}`.trim() || "Occupied Guest";

    return `
      <div class="inhouse-modal-grid">
        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Guest</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>First Name</span>
              <input id="modalGuestFirstName" type="text" value="${escapeHtml(activeStay.guest?.firstName || "")}" />
            </label>
            <label class="inhouse-form-field">
              <span>Last Name</span>
              <input id="modalGuestLastName" type="text" value="${escapeHtml(activeStay.guest?.lastName || "")}" />
            </label>
          </div>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Phone</span>
              <input id="modalGuestPhone" type="text" value="${escapeHtml(activeStay.guest?.phone || "")}" />
            </label>
            <label class="inhouse-form-field">
              <span>Email</span>
              <input id="modalGuestEmail" type="text" value="${escapeHtml(activeStay.guest?.email || "")}" />
            </label>
          </div>
          <label class="inhouse-form-field">
            <span>Company</span>
            <input id="modalGuestCompany" type="text" value="${escapeHtml(activeStay.guest?.company || "")}" />
          </label>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Stay</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Check-In</span>
              <input id="modalCheckInDate" type="date" value="${escapeHtml(activeStay.stay?.checkInDate || "")}" />
            </label>
            <label class="inhouse-form-field">
              <span>Check-Out</span>
              <input id="modalCheckOutDate" type="date" value="${escapeHtml(activeStay.stay?.checkOutDate || "")}" />
            </label>
          </div>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Room</span>
              <input type="text" value="${escapeHtml(`${activeStay.stay?.roomNumber || "--"} · ${activeStay.stay?.roomType || "--"}`)}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Adults</span>
              <input id="modalAdults" type="number" min="1" value="${escapeHtml(activeStay.stay?.adults || 1)}" />
            </label>
          </div>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Charges</span>
          <div class="inhouse-form-grid inhouse-form-grid--three">
            <label class="inhouse-form-field">
              <span>Rate</span>
              <input id="modalRate" type="number" min="0" step="1" value="${escapeHtml(activeStay.stay?.rate || 0)}" />
            </label>
            <label class="inhouse-form-field">
              <span>Tax %</span>
              <input id="modalTaxRate" type="number" min="0" step="0.01" value="${escapeHtml(activeStay.stay?.taxRate || 0)}" />
            </label>
            <label class="inhouse-form-field">
              <span>Nights</span>
              <input id="modalNights" type="text" value="${escapeHtml(activeStay.stay?.nights || 0)}" readonly />
            </label>
          </div>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Subtotal</span>
              <input id="modalSubtotal" type="text" value="${escapeHtml(formatCurrency(activeStay.stay?.subtotalAmount || 0))}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Total</span>
              <input id="modalTotal" type="text" value="${escapeHtml(formatCurrency(activeStay.stay?.totalAmount || 0))}" readonly />
            </label>
          </div>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Profile</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Vehicle</span>
              <input id="modalVehicle" type="text" value="${escapeHtml(activeStay.stay?.vehicle || "")}" />
            </label>
            <label class="inhouse-form-field">
              <span>ID Type</span>
              <input id="modalIdType" type="text" value="${escapeHtml(activeStay.identification?.idType || "")}" />
            </label>
          </div>
          <label class="inhouse-form-field">
            <span>ID Number</span>
            <input id="modalIdNumber" type="text" value="${escapeHtml(activeStay.identification?.idNumber || "")}" />
          </label>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Payment</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Payment Type</span>
              <input id="modalPaymentType" type="text" value="${escapeHtml(activeStay.payment?.paymentType || "")}" />
            </label>
            <label class="inhouse-form-field">
              <span>Card / Cash</span>
              <input
                id="modalPaymentCard"
                type="text"
                value="${escapeHtml(
                  activeStay.payment?.cardNumberLast4 ? `•••• ${activeStay.payment.cardNumberLast4}` : ""
                )}"
              />
            </label>
          </div>
          <label class="inhouse-form-field">
            <span>Expiration</span>
            <input id="modalPaymentExpiry" type="text" value="${escapeHtml(activeStay.payment?.expiry || "")}" />
          </label>
        </div>

        <div class="inhouse-detail-card inhouse-detail-card--wide">
          <span class="inhouse-detail-label">Notes</span>
          <label class="inhouse-form-field">
            <span>${escapeHtml(guestName)}</span>
            <textarea id="modalNotes" rows="4">${escapeHtml(activeStay.notes || "")}</textarea>
          </label>
        </div>
      </div>
    `;
  };

  const buildReservationModalMarkup = (reservation) => {
    const guestName =
      `${reservation.guest?.firstName || ""} ${reservation.guest?.lastName || ""}`.trim() || "Reserved Guest";
    const taxAmount =
      Number(reservation.stay?.subtotalAmount || 0) * (Number(reservation.stay?.taxRate || 0) / 100);

    return `
      <div class="inhouse-modal-grid">
        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Guest</span>
          <div class="inhouse-form-grid">
            <label class="inhouse-form-field">
              <span>Name</span>
              <input type="text" value="${escapeHtml(guestName)}" readonly />
            </label>
            <div class="inhouse-form-grid inhouse-form-grid--two">
              <label class="inhouse-form-field">
                <span>Phone</span>
                <input type="text" value="${escapeHtml(reservation.guest?.phone || "")}" readonly />
              </label>
              <label class="inhouse-form-field">
                <span>Email</span>
                <input type="text" value="${escapeHtml(reservation.guest?.email || "")}" readonly />
              </label>
            </div>
          </div>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Stay</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Arrival</span>
              <input type="text" value="${escapeHtml(formatLongDate(reservation.stay?.checkInDate))}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Departure</span>
              <input type="text" value="${escapeHtml(formatLongDate(reservation.stay?.checkOutDate))}" readonly />
            </label>
          </div>
          <div class="inhouse-form-grid inhouse-form-grid--three">
            <label class="inhouse-form-field">
              <span>Room</span>
              <input type="text" value="${escapeHtml(reservation.stay?.roomNumber || "")}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Type</span>
              <input type="text" value="${escapeHtml(reservation.stay?.roomType || "")}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Nights</span>
              <input type="text" value="${escapeHtml(reservation.stay?.nights || 0)}" readonly />
            </label>
          </div>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Guests</span>
          <div class="inhouse-form-grid inhouse-form-grid--three">
            <label class="inhouse-form-field">
              <span>Adults</span>
              <input type="text" value="${escapeHtml(reservation.stay?.adults || 1)}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Children</span>
              <input type="text" value="${escapeHtml(reservation.stay?.children || 0)}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Pets</span>
              <input type="text" value="${escapeHtml(reservation.stay?.pets || 0)}" readonly />
            </label>
          </div>
        </div>

        <div class="inhouse-detail-card">
          <span class="inhouse-detail-label">Payment</span>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Rate</span>
              <input type="text" value="${escapeHtml(formatCurrency(reservation.stay?.rate || 0))}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Total</span>
              <input type="text" value="${escapeHtml(formatCurrency(reservation.stay?.totalAmount || 0))}" readonly />
            </label>
          </div>
          <div class="inhouse-form-grid inhouse-form-grid--two">
            <label class="inhouse-form-field">
              <span>Tax</span>
              <input type="text" value="${escapeHtml(formatCurrency(taxAmount))}" readonly />
            </label>
            <label class="inhouse-form-field">
              <span>Payment Type</span>
              <input type="text" value="${escapeHtml(reservation.payment?.paymentType || "")}" readonly />
            </label>
          </div>
        </div>

        <div class="inhouse-detail-card inhouse-detail-card--wide">
          <span class="inhouse-detail-label">Notes</span>
          <label class="inhouse-form-field">
            <span>Reservation Notes</span>
            <textarea readonly rows="3">${escapeHtml(reservation.notes || "")}</textarea>
          </label>
        </div>
      </div>
    `;
  };

  const getGuestNameForRoom = (roomNumber) => {
    const activeStay = getActiveStayForRoom(roomNumber);

    if (!activeStay) return "Vacant";

    return `${activeStay.guest?.firstName || ""} ${activeStay.guest?.lastName || ""}`.trim() || "Occupied";
  };

  const getTodayReservationForRoom = (roomNumber) =>
    getStoredReservations().find(
      (reservation) =>
        reservation?.stay?.roomNumber === roomNumber &&
        reservation?.stay?.checkInDate === getTodayKey() &&
        (reservation.status || "reserved") === "reserved"
    );

  const openGuestModal = (roomNumber) => {
    const activeStay = getActiveStayForRoom(roomNumber);

    if (!activeStay) return;

    const roomType = activeStay.stay?.roomType || "--";
    const room = activeStay.stay?.roomNumber || roomNumber;

    activeModalStayId = activeStay.id || "";
    activeModalReservationConfirmation = "";
    guestModalSubtitle.textContent = `Room ${room} · ${roomType}`;
    guestModalBody.innerHTML = buildModalFormMarkup(activeStay);
    clearModalFeedback();
    setModalActionVisibility();

    guestModal.classList.remove("hidden");
    guestModal.setAttribute("aria-hidden", "false");
  };

  const openReservationModal = (roomNumber) => {
    const reservation = getTodayReservationForRoom(roomNumber);
    if (!reservation) return;

    activeModalStayId = "";
    activeModalReservationConfirmation = reservation.confirmationNumber || "";
    guestModalSubtitle.textContent = `Room ${reservation.stay?.roomNumber || roomNumber} · Reserved Arrival`;
    guestModalBody.innerHTML = buildReservationModalMarkup(reservation);
    clearModalFeedback();
    setModalActionVisibility({ showPrint: false, showCheckout: false, showSave: false });

    guestModal.classList.remove("hidden");
    guestModal.setAttribute("aria-hidden", "false");
  };

  const closeGuestModal = () => {
    activeModalStayId = "";
    activeModalReservationConfirmation = "";
    clearModalFeedback();
    guestModal.classList.add("hidden");
    guestModal.setAttribute("aria-hidden", "true");
    setModalActionVisibility();
  };

  const refreshModalTotals = () => {
    const modalCheckIn = document.getElementById("modalCheckInDate");
    const modalCheckOut = document.getElementById("modalCheckOutDate");
    const modalRate = document.getElementById("modalRate");
    const modalTaxRate = document.getElementById("modalTaxRate");
    const modalNights = document.getElementById("modalNights");
    const modalSubtotal = document.getElementById("modalSubtotal");
    const modalTotal = document.getElementById("modalTotal");

    if (!modalCheckIn || !modalCheckOut || !modalRate || !modalTaxRate || !modalNights || !modalSubtotal || !modalTotal) {
      return;
    }

    const nights = calculateNights(modalCheckIn.value, modalCheckOut.value);
    const subtotal = nights * Number(modalRate.value || 0);
    const taxAmount = subtotal * (Number(modalTaxRate.value || 0) / 100);
    const total = subtotal + taxAmount;

    modalNights.value = String(nights);
    modalSubtotal.value = formatCurrency(subtotal);
    modalTotal.value = formatCurrency(total);
  };

  const saveModalChanges = () => {
    const activeStay = getActiveStayById(activeModalStayId);
    if (!activeStay) {
      showModalFeedback("This stay is no longer active.", "error");
      return;
    }

    const modalGuestFirstName = document.getElementById("modalGuestFirstName");
    const modalGuestLastName = document.getElementById("modalGuestLastName");
    const modalGuestPhone = document.getElementById("modalGuestPhone");
    const modalGuestEmail = document.getElementById("modalGuestEmail");
    const modalGuestCompany = document.getElementById("modalGuestCompany");
    const modalCheckIn = document.getElementById("modalCheckInDate");
    const modalCheckOut = document.getElementById("modalCheckOutDate");
    const modalAdults = document.getElementById("modalAdults");
    const modalRate = document.getElementById("modalRate");
    const modalTaxRate = document.getElementById("modalTaxRate");
    const modalVehicle = document.getElementById("modalVehicle");
    const modalIdType = document.getElementById("modalIdType");
    const modalIdNumber = document.getElementById("modalIdNumber");
    const modalPaymentType = document.getElementById("modalPaymentType");
    const modalPaymentCard = document.getElementById("modalPaymentCard");
    const modalPaymentExpiry = document.getElementById("modalPaymentExpiry");
    const modalNotes = document.getElementById("modalNotes");

    if (
      !modalGuestFirstName ||
      !modalGuestLastName ||
      !modalGuestPhone ||
      !modalGuestEmail ||
      !modalGuestCompany ||
      !modalCheckIn ||
      !modalCheckOut ||
      !modalAdults ||
      !modalRate ||
      !modalTaxRate ||
      !modalVehicle ||
      !modalIdType ||
      !modalIdNumber ||
      !modalPaymentType ||
      !modalPaymentCard ||
      !modalPaymentExpiry ||
      !modalNotes
    ) {
      return;
    }

    if (!modalGuestFirstName.value.trim() || !modalGuestLastName.value.trim()) {
      showModalFeedback("First and last name are required.", "error");
      return;
    }

    const nights = calculateNights(modalCheckIn.value, modalCheckOut.value);
    if (nights <= 0) {
      showModalFeedback("Check-out date must be after check-in date.", "error");
      return;
    }

    const subtotal = nights * Number(modalRate.value || 0);
    const taxAmount = subtotal * (Number(modalTaxRate.value || 0) / 100);
    const totalAmount = subtotal + taxAmount;

    const nextStays = getStoredStays().map((stay) => {
      if (stay.id !== activeModalStayId) return stay;

      return {
        ...stay,
        updatedAt: new Date().toISOString(),
        guest: {
          ...stay.guest,
          firstName: modalGuestFirstName.value.trim(),
          lastName: modalGuestLastName.value.trim(),
          phone: modalGuestPhone.value.trim(),
          email: modalGuestEmail.value.trim(),
          company: modalGuestCompany.value.trim()
        },
        notes: modalNotes.value.trim(),
        stay: {
          ...stay.stay,
          checkInDate: modalCheckIn.value,
          checkOutDate: modalCheckOut.value,
          nights,
          adults: Number(modalAdults.value || 1),
          rate: Number(modalRate.value || 0),
          taxRate: Number(modalTaxRate.value || 0),
          subtotalAmount: Number(subtotal.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
          vehicle: modalVehicle.value.trim()
        },
        identification: {
          ...stay.identification,
          idType: modalIdType.value.trim(),
          idNumber: modalIdNumber.value.trim()
        },
        payment: {
          ...stay.payment,
          paymentType: modalPaymentType.value.trim(),
          cardNumberLast4: modalPaymentCard.value.replace(/\D/g, "").slice(-4),
          expiry: modalPaymentExpiry.value.trim()
        }
      };
    });

    saveStoredStays(nextStays);

    if (typeof window.upsertStoredGuest === "function") {
      window.upsertStoredGuest({
        id: activeStay.guestId || "",
        guest: {
          ...(activeStay.guest || {}),
          firstName: modalGuestFirstName.value.trim(),
          lastName: modalGuestLastName.value.trim(),
          phone: modalGuestPhone.value.trim(),
          email: modalGuestEmail.value.trim(),
          company: modalGuestCompany.value.trim()
        },
        vehicle: modalVehicle.value.trim(),
        identification: {
          idType: modalIdType.value.trim(),
          idNumber: modalIdNumber.value.trim()
        },
        notes: modalNotes.value.trim()
      });
    }

    showModalFeedback("Stay details updated.", "success");
    renderRooms();
    const refreshedStay = getActiveStayById(activeModalStayId);
    if (refreshedStay?.stay?.roomNumber) {
      openGuestModal(refreshedStay.stay.roomNumber);
      showModalFeedback("Stay details updated.", "success");
    }
  };

  const checkoutStayEarly = () => {
    const activeStay = getActiveStayById(activeModalStayId);
    if (!activeStay?.stay?.roomNumber) {
      showModalFeedback("This stay is no longer active.", "error");
      return;
    }

    const guestName = `${activeStay.guest?.firstName || ""} ${activeStay.guest?.lastName || ""}`.trim() || "this guest";
    const confirmed = window.confirm(`Check out ${guestName} early and mark room ${activeStay.stay.roomNumber} dirty?`);
    if (!confirmed) return;

    const nextStays = getStoredStays().filter((stay) => stay.id !== activeModalStayId);
    saveStoredStays(nextStays);
    updateRoomStatus(activeStay.stay.roomNumber, "dirty");
    closeGuestModal();
    renderRooms();
  };

  const buildReceiptFromStay = (activeStay) => {
    const numberOfNights = Number(
      activeStay.stay?.nights || calculateNights(activeStay.stay?.checkInDate, activeStay.stay?.checkOutDate)
    );

    return {
      id: activeStay.receiptId || `receipt-${activeStay.id || Date.now()}`,
      status: activeStay.status || "checked-in",
      guestId: activeStay.guestId || "",
      confirmationNumber: activeStay.confirmationNumber || "",
      source: activeStay.source || "walkin",
      createdAt: activeStay.updatedAt || activeStay.createdAt || new Date().toISOString(),
      guest: {
        firstName: activeStay.guest?.firstName || "",
        lastName: activeStay.guest?.lastName || "",
        address1: activeStay.guest?.address1 || "",
        address2: activeStay.guest?.address2 || "",
        city: activeStay.guest?.city || "",
        state: activeStay.guest?.state || "",
        zip: activeStay.guest?.zip || "",
        country: activeStay.guest?.country || "",
        phone: activeStay.guest?.phone || "",
        email: activeStay.guest?.email || "",
        company: activeStay.guest?.company || ""
      },
      stay: {
        checkInDate: activeStay.stay?.checkInDate || "",
        checkOutDate: activeStay.stay?.checkOutDate || "",
        nights: numberOfNights,
        adults: Number(activeStay.stay?.adults || 1),
        children: Number(activeStay.stay?.children || 0),
        pets: Number(activeStay.stay?.pets || 0),
        rate: Number(activeStay.stay?.rate || 0),
        adultFeePerNight: 10,
        petFeePerNight: 15,
        taxRate: Number(activeStay.stay?.taxRate || 0),
        subtotalAmount: Number(activeStay.stay?.subtotalAmount || 0),
        totalAmount: Number(activeStay.stay?.totalAmount || 0),
        rackRate: activeStay.stay?.rackRate || "",
        roomType: activeStay.stay?.roomType || "",
        roomNumber: activeStay.stay?.roomNumber || ""
      },
      payment: {
        paymentType: activeStay.payment?.paymentType || "",
        cardNumberLast4: activeStay.payment?.cardNumberLast4 || "",
        expiry: activeStay.payment?.expiry || ""
      },
      notes: activeStay.notes || ""
    };
  };

  const openReceiptForActiveStay = () => {
    const activeStay = getActiveStayById(activeModalStayId);
    if (!activeStay) {
      showModalFeedback("This stay is no longer active.", "error");
      return;
    }

    const storedReceipts = getStoredReceipts();
    const nextReceipt = buildReceiptFromStay(activeStay);
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

  const populateTypeFilter = (rooms) => {
    const uniqueTypes = [...new Set(rooms.map((room) => room.type).filter(Boolean))].sort();
    const currentValue = typeFilter.value;

    typeFilter.innerHTML = `<option value="all">All Types</option>`;
    uniqueTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    if (uniqueTypes.includes(currentValue)) {
      typeFilter.value = currentValue;
    }
  };

  const updateRoomStatus = (roomNumber, nextStatus) => {
    const rooms = getStoredRooms().map((room) =>
      room.number === roomNumber ? { ...room, status: nextStatus } : room
    );

    if (typeof window.saveStoredRooms === "function") {
      window.saveStoredRooms(rooms);
    } else {
      localStorage.setItem(roomStorageKey, JSON.stringify(rooms));
    }

    window.dispatchEvent(new Event("hotelhub-rooms-updated"));
  };

  const renderRooms = () => {
    const rooms = getStoredRooms().sort((a, b) =>
      String(a.number).localeCompare(String(b.number), undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

    populateTypeFilter(rooms);

    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedType = typeFilter.value;

    const filteredRooms = rooms.filter((room) => {
      const matchesSearch =
        !searchValue ||
        room.number.toLowerCase().includes(searchValue) ||
        room.type.toLowerCase().includes(searchValue);
      const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;
      const matchesType = selectedType === "all" || room.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });

    if (!filteredRooms.length) {
      grid.innerHTML = `<article class="cell"><div class="cell__room">No rooms found</div><div class="cell__guest">Adjust filters or add rooms in Settings.</div></article>`;
    } else {
      grid.innerHTML = filteredRooms
        .map((room) => {
          const activeStay = room.status === "occupied" ? getActiveStayForRoom(room.number) : null;
          const todayReservation = getTodayReservationForRoom(room.number);
          const guestName = room.status === "occupied" ? getGuestNameForRoom(room.number) : "Vacant";
          const guestMarkup =
            room.status === "occupied" && activeStay
              ? `<button type="button" class="cell__guest-link" data-room-number="${room.number}">${guestName}</button>`
              : todayReservation
                ? `<button type="button" class="cell__guest-link cell__guest-link--reserved" data-reservation-room-number="${room.number}">Reserved</button>`
                : guestName;

          return `
            <article class="cell status-${room.status}">
              <div class="cell__room">Room ${room.number}</div>
              <div class="cell__guest">${guestMarkup} · ${room.type || "--"}</div>
              <select class="statusSelect" data-room-number="${room.number}">
                <option value="clean" ${room.status === "clean" ? "selected" : ""}>Clean</option>
                <option value="dirty" ${room.status === "dirty" ? "selected" : ""}>Dirty</option>
                <option value="occupied" ${room.status === "occupied" ? "selected" : ""}>Occupied</option>
                <option value="ooo" ${room.status === "ooo" ? "selected" : ""}>OOO</option>
              </select>
            </article>
          `;
        })
        .join("");
    }

    const counts = rooms.reduce(
      (accumulator, room) => {
        accumulator.total += 1;
        accumulator[room.status] = (accumulator[room.status] || 0) + 1;
        if (getTodayReservationForRoom(room.number)) {
          accumulator.reservedToday += 1;
        }
        return accumulator;
      },
      { total: 0, clean: 0, dirty: 0, occupied: 0, ooo: 0, reservedToday: 0 }
    );

    summary.innerHTML = `
      <div class="inhouse-top-stats">
        <div class="inhouse-top-stat inhouse-top-stat--clean">
          <span class="inhouse-top-stat__icon inhouse-top-stat__icon--clean">🚪</span>
          <span class="inhouse-top-stat__label">Clean</span>
          <strong>${counts.clean}</strong>
        </div>
        <div class="inhouse-top-stat inhouse-top-stat--occupied">
          <span class="inhouse-top-stat__icon inhouse-top-stat__icon--occupied">🛏</span>
          <span class="inhouse-top-stat__label">Occupied</span>
          <strong>${counts.occupied}</strong>
        </div>
        <div class="inhouse-top-stat inhouse-top-stat--dirty">
          <span class="inhouse-top-stat__icon inhouse-top-stat__icon--dirty">🧹</span>
          <span class="inhouse-top-stat__label">Dirty</span>
          <strong>${counts.dirty}</strong>
        </div>
        <div class="inhouse-top-stat inhouse-top-stat--ooo">
          <span class="inhouse-top-stat__icon inhouse-top-stat__icon--ooo">🔧</span>
          <span class="inhouse-top-stat__label">OOO</span>
          <strong>${counts.ooo}</strong>
        </div>
      </div>
    `;
  };

  searchInput.addEventListener("input", renderRooms);
  statusFilter.addEventListener("change", renderRooms);
  typeFilter.addEventListener("change", renderRooms);
  grid.addEventListener("change", (event) => {
    const select = event.target.closest(".statusSelect");
    if (!select) return;
    updateRoomStatus(select.dataset.roomNumber || "", select.value);
    renderRooms();
  });
  grid.addEventListener("click", (event) => {
    const guestLink = event.target.closest(".cell__guest-link");
    if (!guestLink) return;
    if (guestLink.dataset.reservationRoomNumber) {
      openReservationModal(guestLink.dataset.reservationRoomNumber);
      return;
    }
    openGuestModal(guestLink.dataset.roomNumber || "");
  });
  guestModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal='true']")) {
      closeGuestModal();
    }
  });
  guestModalBody.addEventListener("input", (event) => {
    if (
      event.target.matches("#modalCheckInDate, #modalCheckOutDate, #modalRate, #modalTaxRate")
    ) {
      refreshModalTotals();
    }
  });
  guestModalClose.addEventListener("click", closeGuestModal);
  saveChangesBtn.addEventListener("click", saveModalChanges);
  checkoutEarlyBtn.addEventListener("click", checkoutStayEarly);
  printReceiptBtn.addEventListener("click", openReceiptForActiveStay);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !guestModal.classList.contains("hidden")) {
      closeGuestModal();
    }
  });

  window.addEventListener("hotelhub-rooms-updated", renderRooms);
  window.addEventListener("hotelhub-stays-updated", renderRooms);
  window.addEventListener("storage", (event) => {
    if (event.key === roomStorageKey || event.key === stayStorageKey || event.key === reservationStorageKey) {
      renderRooms();
    }
  });

  renderRooms();
});
