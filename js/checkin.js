document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("checkin-page")) return;

  const reservationStorageKey = "hotelhub_reservations";
  const stayStorageKey = "hotelhub_active_stays";
  const receiptStorageKey = "hotelhub_receipts";
  const taxStorageKey = "hotelhub-tax-rate";

  const reservationForm = document.getElementById("reservationForm");
  const reservationMeta = document.getElementById("reservationMeta");
  const reservationMetaDate = document.getElementById("reservationMetaDate");
  const reservationFeedback = document.getElementById("reservationFeedback");
  const reservationGuestLookup = document.getElementById("reservationGuestLookup");
  const reservationGuestSelected = document.getElementById("reservationGuestSelected");
  const reservationGuestResults = document.getElementById("reservationGuestResults");
  const viewReceiptBtn = document.getElementById("viewReceiptBtn");
  const checkinMode = document.getElementById("checkinMode");
  const checkinModeBadge = document.getElementById("checkinModeBadge");
  const checkinSummaryDescription = document.getElementById("checkinSummaryDescription");

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const address1 = document.getElementById("address1");
  const address2 = document.getElementById("address2");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const zip = document.getElementById("zip");
  const country = document.getElementById("country");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const company = document.getElementById("company");
  const remarks = document.getElementById("remarks");
  const checkIn = document.getElementById("checkInDate");
  const checkOut = document.getElementById("checkOutDate");
  const nights = document.getElementById("nights");
  const rate = document.getElementById("rate");
  const total = document.getElementById("totalAmount");
  const rackRate = document.getElementById("rackRate");
  const roomType = document.getElementById("roomType");
  const roomNumber = document.getElementById("roomNumber");
  const reservationAdults = document.getElementById("reservationAdults");
  const reservationChildren = document.getElementById("reservationChildren");
  const reservationPets = document.getElementById("reservationPets");
  const reservationVehicle = document.getElementById("reservationVehicle");
  const reservationIdType = document.getElementById("reservationIdType");
  const reservationIdNumber = document.getElementById("reservationIdNumber");
  const reservationTaxRate = document.getElementById("reservationTaxRate");
  const paymentType = document.getElementById("paymentType");
  const cardNumber = document.getElementById("cardNumber");
  const expiry = document.getElementById("expiry");
  const reservationCardNumberRow = document.getElementById("reservationCardNumberRow");
  const reservationExpiryRow = document.getElementById("reservationExpiryRow");
  const staySummaryIn = document.getElementById("staySummaryIn");
  const staySummaryOut = document.getElementById("staySummaryOut");
  const staySummaryRoom = document.getElementById("staySummaryRoom");
  const staySummarySubtotal = document.getElementById("staySummarySubtotal");
  const staySummaryTax = document.getElementById("staySummaryTax");
  const staySummaryTotal = document.getElementById("staySummaryTotal");
  const saveReservationBtn = document.getElementById("saveReservationBtn");
  const cancelReservationBtn = document.getElementById("cancelReservationBtn");

  if (
    !reservationForm ||
    !reservationMeta ||
    !reservationMetaDate ||
    !reservationFeedback ||
    !reservationGuestLookup ||
    !reservationGuestSelected ||
    !reservationGuestResults ||
    !viewReceiptBtn ||
    !checkinMode ||
    !checkinModeBadge ||
    !checkinSummaryDescription ||
    !firstName ||
    !lastName ||
    !address1 ||
    !address2 ||
    !city ||
    !state ||
    !zip ||
    !country ||
    !phone ||
    !email ||
    !company ||
    !remarks ||
    !checkIn ||
    !checkOut ||
    !nights ||
    !rate ||
    !roomType ||
    !roomNumber ||
    !rackRate ||
    !reservationAdults ||
    !reservationChildren ||
    !reservationPets ||
    !reservationVehicle ||
    !reservationIdType ||
    !reservationIdNumber ||
    !reservationTaxRate ||
    !paymentType ||
    !cardNumber ||
    !expiry ||
    !reservationCardNumberRow ||
    !reservationExpiryRow ||
    !staySummaryIn ||
    !staySummaryOut ||
    !staySummaryRoom ||
    !staySummarySubtotal ||
    !staySummaryTax ||
    !staySummaryTotal ||
    !saveReservationBtn ||
    !cancelReservationBtn
  ) {
    return;
  }

  let currentConfirmationNumber = "";
  let currentReceiptId = "";
  let selectedGuestId = "";
  let checkInPicker = null;
  let checkOutPicker = null;

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const formatShortDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });

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

  const setDateValue = (input, value, picker) => {
    if (picker) {
      picker.setDate(value, false, "Y-m-d");
      return;
    }

    input.value = value;
  };

  const initDatePickers = () => {
    if (typeof window.flatpickr !== "function") return;

    const sharedOptions = {
      dateFormat: "Y-m-d",
      allowInput: true,
      disableMobile: true
    };

    checkInPicker = window.flatpickr(checkIn, {
      ...sharedOptions,
      onChange: (selectedDates, dateStr) => {
        if (checkOutPicker && dateStr) {
          checkOutPicker.set("minDate", dateStr);
        }

        checkIn.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    checkOutPicker = window.flatpickr(checkOut, {
      ...sharedOptions,
      onChange: () => {
        checkOut.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
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
      localStorage.setItem("hotelhub_rooms", JSON.stringify(nextRooms));
    }

    window.dispatchEvent(new Event("hotelhub-rooms-updated"));
  };

  const generateConfirmationNumber = () => {
    const reservations = getStoredReservations();
    return String(1000 + reservations.length + 1);
  };

  const syncModeFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");

    if (modeParam === "walkin") {
      checkinMode.value = "walkin";
      return;
    }

    checkinMode.value = "reservation";
  };

  const applyModePresentation = () => {
    const isWalkin = checkinMode.value === "walkin";

    checkinModeBadge.textContent = isWalkin ? "Walk-In" : "Reservation";
    checkinSummaryDescription.textContent = isWalkin
      ? "Final stay snapshot before completing check-in."
      : "Final stay snapshot before saving the reservation.";
    saveReservationBtn.textContent = isWalkin ? "Complete Walk-In" : "Save Reservation";
  };

  const setReservationMeta = () => {
    const isWalkin = checkinMode.value === "walkin";
    reservationMeta.textContent = isWalkin
      ? "Same-Day Check-In"
      : `Confirmation #${currentConfirmationNumber}`;
    reservationMetaDate.textContent = `Date Created: ${formatShortDate(new Date())}`;
  };

  const showFeedback = (message, type) => {
    reservationFeedback.textContent = message;
    reservationFeedback.classList.remove("hidden", "is-success", "is-error");
    reservationFeedback.classList.add(type === "error" ? "is-error" : "is-success");
  };

  const clearFeedback = () => {
    reservationFeedback.textContent = "";
    reservationFeedback.classList.add("hidden");
    reservationFeedback.classList.remove("is-success", "is-error");
  };

  const getStoredGuests = () =>
    typeof window.getStoredGuests === "function" ? window.getStoredGuests() : [];

  const formatGuestSearchMeta = (guestProfile) => {
    const parts = [
      guestProfile.guest.phone,
      guestProfile.guest.email,
      guestProfile.guest.company
    ].filter(Boolean);

    return parts.join(" · ") || "Saved guest";
  };

  const setSelectedGuest = (guestProfile) => {
    selectedGuestId = guestProfile?.id || "";
    reservationGuestSelected.textContent = "";
    reservationGuestSelected.classList.add("hidden");
  };

  const hideGuestResults = () => {
    reservationGuestResults.innerHTML = "";
    reservationGuestResults.classList.add("hidden");
  };

  const getGuestProfileFromForm = () => ({
    id: selectedGuestId,
    guest: {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      address1: address1.value.trim(),
      address2: address2.value.trim(),
      city: city.value.trim(),
      state: state.value.trim(),
      zip: zip.value.trim(),
      country: country.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      company: company.value.trim()
    },
    vehicle: reservationVehicle.value.trim(),
    identification: {
      idType: reservationIdType.value,
      idNumber: reservationIdNumber.value.trim()
    },
    notes: remarks.value.trim()
  });

  const fillGuestFields = (guestProfile) => {
    firstName.value = guestProfile.guest.firstName || "";
    lastName.value = guestProfile.guest.lastName || "";
    address1.value = guestProfile.guest.address1 || "";
    address2.value = guestProfile.guest.address2 || "";
    city.value = guestProfile.guest.city || "";
    state.value = guestProfile.guest.state || "";
    zip.value = guestProfile.guest.zip || "";
    country.value = guestProfile.guest.country || "";
    phone.value = guestProfile.guest.phone || "";
    email.value = guestProfile.guest.email || "";
    company.value = guestProfile.guest.company || "";
    reservationVehicle.value = guestProfile.vehicle || "";
    reservationIdType.value = guestProfile.identification?.idType || "Driver License";
    reservationIdNumber.value = guestProfile.identification?.idNumber || "";
    remarks.value = guestProfile.notes || "";
    reservationGuestLookup.value = `${guestProfile.guest.firstName} ${guestProfile.guest.lastName}`.trim();
    setSelectedGuest(guestProfile);
    hideGuestResults();
  };

  const renderGuestMatches = (query) => {
    const searchTerm = query.trim().toLowerCase();

    if (searchTerm.length < 2) {
      hideGuestResults();
      return;
    }

    const matches = getStoredGuests()
      .filter((guestProfile) => {
        const haystack = [
          guestProfile.guest.firstName,
          guestProfile.guest.lastName,
          guestProfile.guest.phone,
          guestProfile.guest.email,
          guestProfile.guest.company
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm);
      })
      .slice(0, 6);

    if (!matches.length) {
      hideGuestResults();
      return;
    }

    reservationGuestResults.innerHTML = matches
      .map((guestProfile) => {
        const guestName = `${guestProfile.guest.firstName} ${guestProfile.guest.lastName}`.trim();
        return `
          <button type="button" class="guest-result-btn" data-guest-id="${guestProfile.id}">
            <span class="guest-result-name">${guestName}</span>
            <span class="guest-result-meta">${formatGuestSearchMeta(guestProfile)}</span>
          </button>
        `;
      })
      .join("");

    reservationGuestResults.classList.remove("hidden");
  };

  const calculateNights = () => {
    if (!checkIn.value || !checkOut.value) return 0;

    const start = new Date(`${checkIn.value}T00:00:00`);
    const end = new Date(`${checkOut.value}T00:00:00`);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));

    return diff > 0 ? diff : 0;
  };

  const updateStaySummary = () => {
    staySummaryIn.textContent = formatLongDate(checkIn.value);
    staySummaryOut.textContent = formatLongDate(checkOut.value);
    staySummaryRoom.textContent = roomNumber.value
      ? `${roomNumber.value} - ${roomType.value}`
      : "Not Assigned";
  };

  const getCurrentPaymentSnapshot = () => ({
    paymentType: paymentType.value,
    cardNumberLast4: cardNumber.value.replace(/\D/g, "").slice(-4),
    expiry: expiry.value.trim()
  });

  const updatePaymentFields = () => {
    const isCash = paymentType.value === "Cash";
    reservationCardNumberRow.classList.toggle("hidden", isCash);
    reservationExpiryRow.classList.toggle("hidden", isCash);

    if (isCash) {
      cardNumber.value = "";
      expiry.value = "";
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1-").replace(/-$/, "");
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const getTaxRate = () => {
    const parsedRate = Number(reservationTaxRate.value || 0);
    return parsedRate >= 0 ? parsedRate : 0;
  };

  const getRackRateDiscount = () => {
    const selectedRackRate = String(rackRate.value || "").trim().toUpperCase();

    if (selectedRackRate === "AAA") return 0.1;
    if (selectedRackRate === "AARP") return 0.1;
    if (selectedRackRate === "SENIOR") return 0.05;
    if (selectedRackRate === "MILITARY") return 0.15;
    if (selectedRackRate === "GOVERNMENT") return 0.2;
    return 0;
  };

  const applyRoomTypeRate = () => {
    if (typeof window.getStoredRoomRates !== "function" || !roomType.value) return;

    const storedRates = window.getStoredRoomRates();
    const nextRate = storedRates[roomType.value];

    if (typeof nextRate === "number" && Number.isFinite(nextRate)) {
      const discountedRate = nextRate * (1 - getRackRateDiscount());
      rate.value = String(Number(discountedRate.toFixed(2)));
    }
  };

  const syncCheckoutFromNights = () => {
    if (!checkIn.value) return;

    const numberOfNights = Math.max(1, Number(nights.value || 1));
    const start = new Date(`${checkIn.value}T00:00:00`);
    start.setDate(start.getDate() + numberOfNights);
    setDateValue(checkOut, start.toISOString().slice(0, 10), checkOutPicker);
  };

  const updateTotal = () => {
    const numberOfNights = calculateNights();
    const adultCount = Math.max(1, Number(reservationAdults.value || 1));
    const petCount = Math.max(0, Number(reservationPets.value || 0));
    const nightlyRate = Number(rate.value || 0);
    const nightlyAdultFee = adultCount * 10;
    const nightlyPetFee = petCount * 15;
    const subtotal = numberOfNights * (nightlyRate + nightlyAdultFee + nightlyPetFee);
    const taxAmount = subtotal * (getTaxRate() / 100);
    const totalAmount = subtotal + taxAmount;

    nights.value = String(numberOfNights || 1);
    if (total) {
      total.value = formatCurrency(totalAmount);
    }
    staySummarySubtotal.textContent = formatCurrency(subtotal);
    staySummaryTax.textContent = formatCurrency(taxAmount);
    staySummaryTotal.textContent = formatCurrency(totalAmount);
    updateStaySummary();
  };

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

  const buildReceiptRecord = (options = {}) => {
    const savedGuest =
      typeof window.upsertStoredGuest === "function"
        ? window.upsertStoredGuest(getGuestProfileFromForm())
        : getGuestProfileFromForm();

    selectedGuestId = savedGuest.id || selectedGuestId;
    setSelectedGuest(savedGuest);

    const numberOfNights = calculateNights();
    const adultCount = Math.max(1, Number(reservationAdults.value || 1));
    const petCount = Math.max(0, Number(reservationPets.value || 0));
    const nightlyRate = Number(rate.value || 0);
    const nightlyAdultFee = adultCount * 10;
    const nightlyPetFee = petCount * 15;
    const subtotalAmount = Number((numberOfNights * (nightlyRate + nightlyAdultFee + nightlyPetFee)).toFixed(2));
    const taxAmount = Number((subtotalAmount * (getTaxRate() / 100)).toFixed(2));
    const totalAmount = Number((subtotalAmount + taxAmount).toFixed(2));

    return {
      id: options.id || currentReceiptId || `receipt-${Date.now()}`,
      status: options.status || (checkinMode.value === "walkin" ? "checked-in" : "reserved"),
      guestId: savedGuest.id || "",
      confirmationNumber:
        options.confirmationNumber ||
        (checkinMode.value === "walkin" ? "" : currentConfirmationNumber),
      source: options.source || checkinMode.value,
      guest: {
        firstName: savedGuest.guest.firstName,
        lastName: savedGuest.guest.lastName,
        address1: savedGuest.guest.address1,
        address2: savedGuest.guest.address2,
        city: savedGuest.guest.city,
        state: savedGuest.guest.state,
        zip: savedGuest.guest.zip,
        country: savedGuest.guest.country,
        phone: savedGuest.guest.phone,
        email: savedGuest.guest.email,
        company: savedGuest.guest.company
      },
      stay: {
        checkInDate: checkIn.value,
        checkOutDate: checkOut.value,
        nights: numberOfNights,
        adults: Number(reservationAdults.value || 1),
        children: Number(reservationChildren.value || 0),
        pets: Number(reservationPets.value || 0),
        rate: Number(rate.value || 0),
        adultFeePerNight: 10,
        petFeePerNight: 15,
        taxRate: getTaxRate(),
        subtotalAmount,
        totalAmount,
        rackRate: rackRate.value,
        roomType: roomType.value,
        roomNumber: roomNumber.value
      },
      payment: getCurrentPaymentSnapshot(),
      notes: savedGuest.notes
    };
  };

  const saveCurrentReceipt = (options = {}) => {
    const storedReceipts = getStoredReceipts();
    const nextReceipt = buildReceiptRecord(options);
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
    currentReceiptId = nextReceipt.id;
    return nextReceipt;
  };

  const getAvailableRooms = () => {
    if (typeof window.getStoredRooms !== "function") return [];

    const selectedType = roomType.value.trim().toLowerCase();
    if (!selectedType) return [];

    return window.getStoredRooms()
      .filter((room) => room.status === "clean")
      .filter((room) => room.type.trim().toLowerCase() === selectedType)
      .sort((a, b) =>
        a.number.localeCompare(b.number, undefined, {
          numeric: true,
          sensitivity: "base"
        })
      );
  };

  const populateRoomOptions = () => {
    const availableRooms = getAvailableRooms();
    const previousValue = roomNumber.value;

    roomNumber.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = !roomType.value
      ? ""
      : availableRooms.length
        ? "Select a room"
        : "No clean rooms available";
    roomNumber.appendChild(placeholderOption);

    availableRooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.number;
      option.textContent = `${room.number} - ${room.type}`;
      roomNumber.appendChild(option);
    });

    if (availableRooms.some((room) => room.number === previousValue)) {
      roomNumber.value = previousValue;
    } else {
      roomNumber.value = checkinMode.value === "walkin" && availableRooms.length ? availableRooms[0].number : "";
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    setDateValue(checkIn, today.toISOString().slice(0, 10), checkInPicker);
    setDateValue(checkOut, tomorrow.toISOString().slice(0, 10), checkOutPicker);
  };

  const resetForm = (options = {}) => {
    const { keepFeedback = false } = options;

    reservationForm.reset();
    selectedGuestId = "";
    currentReceiptId = "";
    reservationGuestLookup.value = "";
    setSelectedGuest(null);
    hideGuestResults();
    setDefaultDates();
    roomType.selectedIndex = 0;
    applyRoomTypeRate();
    paymentType.selectedIndex = 0;
    reservationIdType.selectedIndex = 0;
    reservationAdults.value = "1";
    reservationChildren.value = "0";
    reservationPets.value = "0";
    rackRate.selectedIndex = 0;
    reservationTaxRate.value = localStorage.getItem(taxStorageKey) || "12";
    nights.value = "1";
    if (total) {
      total.value = "$0.00";
    }
    currentConfirmationNumber = generateConfirmationNumber();
    setReservationMeta();
    populateRoomOptions();
    updatePaymentFields();
    updateTotal();

    if (!keepFeedback) {
      clearFeedback();
    }
  };

  const buildCommonRecord = () => {
    const savedGuest =
      typeof window.upsertStoredGuest === "function"
        ? window.upsertStoredGuest(getGuestProfileFromForm())
        : getGuestProfileFromForm();

    selectedGuestId = savedGuest.id || selectedGuestId;
    setSelectedGuest(savedGuest);

    const numberOfNights = calculateNights();
    const adultCount = Math.max(1, Number(reservationAdults.value || 1));
    const petCount = Math.max(0, Number(reservationPets.value || 0));
    const nightlyRate = Number(rate.value || 0);
    const nightlyAdultFee = adultCount * 10;
    const nightlyPetFee = petCount * 15;
    const subtotalAmount = Number((numberOfNights * (nightlyRate + nightlyAdultFee + nightlyPetFee)).toFixed(2));
    const taxAmount = Number((subtotalAmount * (getTaxRate() / 100)).toFixed(2));
    const totalAmount = Number((subtotalAmount + taxAmount).toFixed(2));

    return {
      id: `stay-${Date.now()}`,
      createdAt: new Date().toISOString(),
      guestId: savedGuest.id || "",
      guest: {
        firstName: savedGuest.guest.firstName,
        lastName: savedGuest.guest.lastName,
        address1: savedGuest.guest.address1,
        address2: savedGuest.guest.address2,
        city: savedGuest.guest.city,
        state: savedGuest.guest.state,
        zip: savedGuest.guest.zip,
        country: savedGuest.guest.country,
        phone: savedGuest.guest.phone,
        email: savedGuest.guest.email,
        company: savedGuest.guest.company
      },
      notes: savedGuest.notes,
      stay: {
        checkInDate: checkIn.value,
        checkOutDate: checkOut.value,
        nights: numberOfNights,
        adults: Number(reservationAdults.value || 1),
        children: Number(reservationChildren.value || 0),
        pets: Number(reservationPets.value || 0),
        rate: Number(rate.value || 0),
        adultFeePerNight: 10,
        petFeePerNight: 15,
        taxRate: getTaxRate(),
        rackRate: rackRate.value,
        subtotalAmount,
        totalAmount,
        roomType: roomType.value,
        roomNumber: roomNumber.value,
        vehicle: savedGuest.vehicle
      },
      identification: {
        idType: savedGuest.identification.idType,
        idNumber: savedGuest.identification.idNumber
      },
      payment: {
        ...getCurrentPaymentSnapshot()
      }
    };
  };

  const validateCommon = () => {
    if (!firstName.value.trim()) return "First name is required.";
    if (!lastName.value.trim()) return "Last name is required.";
    if (!checkIn.value || !checkOut.value) return "Check-in and check-out dates are required.";
    if (calculateNights() <= 0) return "Check-out date must be after check-in date.";
    if (Number(reservationAdults.value || 0) < 1) return "At least 1 adult is required.";
    if (Number(reservationChildren.value || 0) < 0) return "Children cannot be negative.";
    if (Number(reservationPets.value || 0) < 0) return "Pets cannot be negative.";
    if (Number(rate.value || 0) < 0) return "Rate per night cannot be negative.";
    if (Number(reservationTaxRate.value || 0) < 0) return "Tax rate cannot be negative.";
    if (!roomType.value) return "Room type is required.";
    if (!roomNumber.value) return "Select an available room.";
    return "";
  };

  const saveReservation = () => {
    const validationMessage = validateCommon();
    if (validationMessage) {
      showFeedback(validationMessage, "error");
      return;
    }

    const reservationRecord = {
      ...buildCommonRecord(),
      confirmationNumber: currentConfirmationNumber,
      status: "reserved"
    };

    const reservations = getStoredReservations();
    reservations.push(reservationRecord);
    saveStoredReservations(reservations);
    saveCurrentReceipt({
      confirmationNumber: reservationRecord.confirmationNumber,
      status: "reserved",
      source: "reservation"
    });

    showFeedback(
      `Reservation #${reservationRecord.confirmationNumber} saved for ${reservationRecord.guest.firstName} ${reservationRecord.guest.lastName}.`,
      "success"
    );
    resetForm({ keepFeedback: true });
  };

  const completeWalkin = () => {
    const validationMessage = validateCommon();
    if (validationMessage) {
      showFeedback(validationMessage, "error");
      return;
    }

    const activeStays = getStoredStays();
    const roomAlreadyOccupied = activeStays.some(
      (stay) =>
        stay?.stay?.roomNumber === roomNumber.value &&
        (stay.status || "checked-in") === "checked-in"
    );

    if (roomAlreadyOccupied) {
      showFeedback("That room is already checked in.", "error");
      return;
    }

    const stayRecord = {
      ...buildCommonRecord(),
      source: "walk-in",
      status: "checked-in"
    };

    activeStays.push(stayRecord);
    saveStoredStays(activeStays);
    saveCurrentReceipt({
      status: "checked-in",
      source: "walk-in"
    });
    updateRoomStatus(roomNumber.value, "occupied");
    showFeedback("Walk-in checked in successfully.", "success");
    window.location.href = "inHouse.html";
  };

  checkIn.addEventListener("change", () => {
    if (checkOut.value && checkOut.value <= checkIn.value) {
      const nextDay = new Date(`${checkIn.value}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      setDateValue(checkOut, nextDay.toISOString().slice(0, 10), checkOutPicker);
    }

    updateTotal();
    clearFeedback();
  });

  checkOut.addEventListener("change", () => {
    updateTotal();
    clearFeedback();
  });

  nights.addEventListener("input", () => {
    syncCheckoutFromNights();
    updateTotal();
    clearFeedback();
  });

  rate.addEventListener("input", () => {
    updateTotal();
    clearFeedback();
  });

  reservationTaxRate.addEventListener("input", () => {
    localStorage.setItem(taxStorageKey, reservationTaxRate.value || "0");
    updateTotal();
    clearFeedback();
  });

  reservationChildren.addEventListener("input", clearFeedback);
  reservationAdults.addEventListener("input", () => {
    updateTotal();
    clearFeedback();
  });
  reservationPets.addEventListener("input", () => {
    updateTotal();
    clearFeedback();
  });
  rackRate.addEventListener("change", () => {
    applyRoomTypeRate();
    updateTotal();
    clearFeedback();
  });

  reservationGuestLookup.addEventListener("input", () => {
    renderGuestMatches(reservationGuestLookup.value);
  });

  reservationGuestLookup.addEventListener("focus", () => {
    if (reservationGuestLookup.value.trim().length >= 2) {
      renderGuestMatches(reservationGuestLookup.value);
    }
  });

  reservationGuestResults.addEventListener("click", (event) => {
    const guestButton = event.target.closest("[data-guest-id]");
    if (!guestButton) return;

    const matchingGuest = getStoredGuests().find((guestProfile) => guestProfile.id === guestButton.dataset.guestId);
    if (!matchingGuest) return;

    fillGuestFields(matchingGuest);
  });

  viewReceiptBtn.addEventListener("click", () => {
    if (!firstName.value.trim() || !lastName.value.trim()) {
      showFeedback("Enter the guest first and last name before opening the receipt.", "error");
      return;
    }

    const receipt = saveCurrentReceipt({
      status: checkinMode.value === "walkin" ? "checked-in" : "draft",
      source: checkinMode.value
    });

    if (!receipt) {
      showFeedback("Unable to create the receipt right now.", "error");
      return;
    }

    window.open(`receipt.html?id=${encodeURIComponent(receipt.id)}`, "_blank", "noopener");
  });

  document.addEventListener("click", (event) => {
    if (
      event.target === reservationGuestLookup ||
      reservationGuestResults.contains(event.target)
    ) {
      return;
    }

    hideGuestResults();
  });

  paymentType.addEventListener("change", updatePaymentFields);
  cardNumber.addEventListener("input", () => {
    cardNumber.value = formatCardNumber(cardNumber.value);
  });
  expiry.addEventListener("input", () => {
    expiry.value = formatExpiry(expiry.value);
  });

  roomType.addEventListener("change", () => {
    applyRoomTypeRate();
    populateRoomOptions();
    updateTotal();
    clearFeedback();
  });

  roomNumber.addEventListener("change", updateStaySummary);

  checkinMode.addEventListener("change", () => {
    applyModePresentation();
    setReservationMeta();
    populateRoomOptions();
    clearFeedback();
  });

  saveReservationBtn.addEventListener("click", () => {
    if (checkinMode.value === "walkin") {
      completeWalkin();
      return;
    }

    saveReservation();
  });

  cancelReservationBtn.addEventListener("click", () => {
    resetForm();
  });

  window.addEventListener("hotelhub-room-rates-updated", () => {
    applyRoomTypeRate();
    updateTotal();
  });
  window.addEventListener("hotelhub-guests-updated", () => {
    if (reservationGuestLookup.value.trim().length >= 2) {
      renderGuestMatches(reservationGuestLookup.value);
    }
  });
  window.addEventListener("hotelhub-rooms-updated", populateRoomOptions);
  window.addEventListener("storage", (event) => {
    if (event.key === taxStorageKey) {
      reservationTaxRate.value = event.newValue || "12";
      updateTotal();
    }

    if (event.key === "hotelhub_room_rates") {
      applyRoomTypeRate();
      updateTotal();
    }

    if (event.key === "hotelhub_guests" && reservationGuestLookup.value.trim().length >= 2) {
      renderGuestMatches(reservationGuestLookup.value);
    }

    if (event.key === "hotelhub_rooms") {
      populateRoomOptions();
    }
  });

  initDatePickers();
  syncModeFromQuery();
  applyModePresentation();
  resetForm();
});
