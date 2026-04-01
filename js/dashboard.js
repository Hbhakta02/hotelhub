document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("dashboard-page")) return;

  const dashboardCalendarHead = document.getElementById("dashboardCalendarHead");
  const dashboardRoomRows = document.getElementById("dashboardRoomRows");
  const dashboardMonthLabel = document.getElementById("dashboardMonthLabel");
  const dashboardMonthPrev = document.getElementById("dashboardMonthPrev");
  const dashboardMonthNext = document.getElementById("dashboardMonthNext");

  const availableRoomsStat = document.getElementById("availableRooms");
  const occupiedRoomsStat = document.getElementById("occupiedRooms");
  const dirtyUnavailableRoomsStat = document.getElementById("dirtyUnavailableRooms");
  const oooRoomsStat = document.getElementById("oooRooms");

  const today = new Date();
  const todayKey = getDateKey(today);

  let currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

  function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatMonthYear(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  }

  function formatHeaderDay(date) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  function formatHeaderDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getStoredRoomsSafe() {
    if (typeof window.getStoredRooms === "function") {
      return window.getStoredRooms();
    }
    return [];
  }

  function getStoredReservationsSafe() {
    try {
      const savedReservations = localStorage.getItem("hotelhub_reservations");
      const parsedReservations = JSON.parse(savedReservations || "[]");
      return Array.isArray(parsedReservations) ? parsedReservations : [];
    } catch {
      return [];
    }
  }

  function getStoredStaysSafe() {
    try {
      const savedStays = localStorage.getItem("hotelhub_active_stays");
      const parsedStays = JSON.parse(savedStays || "[]");
      return Array.isArray(parsedStays) ? parsedStays : [];
    } catch {
      return [];
    }
  }

  function getReservationStatusLabel(status) {
    if (status === "checked-in") return "Occupied";
    if (status === "reserved") return "Reserved";
    return "";
  }

  function isDateWithinStay(dateKey, checkInDate, checkOutDate) {
    if (!dateKey || !checkInDate || !checkOutDate) return false;
    return dateKey >= checkInDate && dateKey < checkOutDate;
  }

  function getCalendarDates() {
    const dates = [];
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(currentMonthDate);

    const isCurrentRealMonth =
      year === today.getFullYear() && month === today.getMonth();

    const startDay = isCurrentRealMonth ? today.getDate() : 1;

    for (let day = startDay; day <= daysInMonth; day += 1) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  }

  function getRoomCellLabel(room, date) {
    const dateKey = getDateKey(date);

    if (room.status === "ooo") {
      return "OOO";
    }

    const activeStay = getStoredStaysSafe().find(
      (stay) =>
        stay?.stay?.roomNumber === room.number &&
        (stay.status || "checked-in") === "checked-in" &&
        isDateWithinStay(dateKey, stay?.stay?.checkInDate, stay?.stay?.checkOutDate)
    );

    if (activeStay) {
      return "Occupied";
    }

    const activeReservation = getStoredReservationsSafe().find(
      (reservation) =>
        reservation?.stay?.roomNumber === room.number &&
        (reservation.status || "reserved") === "reserved" &&
        isDateWithinStay(dateKey, reservation?.stay?.checkInDate, reservation?.stay?.checkOutDate)
    );

    if (activeReservation) {
      return getReservationStatusLabel(activeReservation.status);
    }

    if (room.status === "dirty" && dateKey === todayKey) {
      return "Dirty";
    }

    if (room.status === "occupied" && dateKey === todayKey) {
      return "Occupied";
    }

    return "Vacant";
  }

  function getCellClassByLabel(label) {
    if (label === "Occupied") return "checkedin-cell";
    if (label === "Reserved") return "reserved-cell";
    if (label === "Dirty") return "cleaning-cell";
    if (label === "OOO") return "ooo-cell";
    return "available-cell";
  }

  function renderMonthLabel() {
    if (!dashboardMonthLabel) return;
    dashboardMonthLabel.textContent = formatMonthYear(currentMonthDate);
  }

  function renderCalendarHeader() {
    if (!dashboardCalendarHead) return;

    const dates = getCalendarDates();

    const headerCells = dates
      .map((date) => {
        const isToday = getDateKey(date) === todayKey;

        return `
          <div class="calendar-cell calendar-header-cell ${isToday ? "today-cell" : ""}">
            <span class="calendar-day">${formatHeaderDay(date)}</span>
            <span class="calendar-date">${formatHeaderDate(date)}</span>
          </div>
        `;
      })
      .join("");

    dashboardCalendarHead.innerHTML = `
      <div class="calendar-room-col calendar-room-col--header sticky-room-col">Room</div>
      ${headerCells}
    `;
  }

  function renderRoomRows() {
    if (!dashboardRoomRows) return;

    const rooms = getStoredRoomsSafe().sort((a, b) =>
      a.number.localeCompare(b.number, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

    const dates = getCalendarDates();

    dashboardRoomRows.innerHTML = rooms
      .map((room) => {
        const cells = dates
          .map((date) => {
            const label = getRoomCellLabel(room, date);
            const cellClass = getCellClassByLabel(label);

            return `<div class="calendar-cell ${cellClass}">${label}</div>`;
          })
          .join("");

        return `
          <div class="room-calendar-grid">
            <div class="calendar-room-col sticky-room-col">
              <strong>${room.number}</strong>
              <span>${room.type}</span>
            </div>
            ${cells}
          </div>
        `;
      })
      .join("");

    const occupiedRooms = rooms.filter((room) => room.status === "occupied").length;
    const dirtyRooms = rooms.filter((room) => room.status === "dirty").length;
    const oooRooms = rooms.filter((room) => room.status === "ooo").length;
    const availableRooms = rooms.filter((room) => room.status === "clean").length;

    if (availableRoomsStat) availableRoomsStat.textContent = String(availableRooms);
    if (occupiedRoomsStat) occupiedRoomsStat.textContent = String(occupiedRooms);
    if (dirtyUnavailableRoomsStat) dirtyUnavailableRoomsStat.textContent = String(dirtyRooms);
    if (oooRoomsStat) oooRoomsStat.textContent = String(oooRooms);
  }

  function renderDashboard() {
    renderMonthLabel();
    renderCalendarHeader();
    renderRoomRows();
  }

  if (dashboardMonthPrev) {
    dashboardMonthPrev.addEventListener("click", () => {
      currentMonthDate = new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() - 1,
        1
      );
      renderDashboard();
    });
  }

  if (dashboardMonthNext) {
    dashboardMonthNext.addEventListener("click", () => {
      currentMonthDate = new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() + 1,
        1
      );
      renderDashboard();
    });
  }

  renderDashboard();
  window.addEventListener("hotelhub-rooms-updated", renderDashboard);
  window.addEventListener("hotelhub-stays-updated", renderDashboard);
  window.addEventListener("storage", (event) => {
    if (
      event.key === "hotelhub_rooms" ||
      event.key === "hotelhub_reservations" ||
      event.key === "hotelhub_active_stays"
    ) {
      renderDashboard();
    }
  });
});
