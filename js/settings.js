document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("settings-page")) return;

  const numberInput = document.getElementById("settingsRoomNumber");
  const typeInput = document.getElementById("settingsRoomType");
  const statusInput = document.getElementById("settingsRoomStatus");
  const tableBody = document.querySelector(".data-table tbody");
  const addBtn = document.getElementById("settingsSaveBtn");
  const clearBtn = document.getElementById("settingsClearBtn");
  const saveRatesBtn = document.getElementById("settingsSaveRatesBtn");
  const resetRatesBtn = document.getElementById("settingsResetRatesBtn");
  const rateInputs = Array.from(document.querySelectorAll("[data-room-type]"));

  if (
    !numberInput ||
    !typeInput ||
    !statusInput ||
    !tableBody ||
    !addBtn ||
    !clearBtn ||
    !saveRatesBtn ||
    !resetRatesBtn ||
    !rateInputs.length
  ) {
    return;
  }

  let rooms = window.getStoredRooms();
  let editingIndex = null;

  const formatStatusLabel = (status) => {
    if (status === "occupied") return "Occupied";
    if (status === "dirty") return "Dirty";
    if (status === "ooo") return "OOO";
    return "Clean";
  };

  const formatRoomTypeLabel = (roomType) => {
    const roomTypeMap = {
      "NS Q": "Non Smoking Queen",
      "NS QQ": "Non Smoking Double Queen",
      "NS QQQ": "Non Smoking Triple Queen",
      "NS K": "Non Smoking King",
      "SM Q": "Smoking Queen",
      "SM K": "Smoking King"
    };

    return roomTypeMap[roomType] || roomType;
  };

  const getStatusBadgeClass = (status) => {
    if (status === "occupied") return "occupied";
    if (status === "dirty") return "cleaning";
    if (status === "ooo") return "reserved";
    return "arriving";
  };

  const sortRooms = () => {
    rooms.sort((a, b) =>
      a.number.localeCompare(b.number, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );
  };

  const resetForm = () => {
    numberInput.value = "";
    if (typeInput.options.length > 0) {
      typeInput.selectedIndex = 0;
    }
    statusInput.value = "clean";
    editingIndex = null;
    addBtn.textContent = "Add Room";
  };

  const syncRateInputs = () => {
    const storedRates =
      typeof window.getStoredRoomRates === "function" ? window.getStoredRoomRates() : {};

    rateInputs.forEach((input) => {
      const roomType = input.dataset.roomType || "";
      input.value = String(storedRates[roomType] ?? 129);
    });
  };

  const saveRates = () => {
    const nextRates = rateInputs.reduce((accumulator, input) => {
      const roomType = input.dataset.roomType || "";
      accumulator[roomType] = Number(input.value || 0);
      return accumulator;
    }, {});

    if (typeof window.saveStoredRoomRates === "function") {
      window.saveStoredRoomRates(nextRates);
    } else {
      localStorage.setItem("hotelhub_room_rates", JSON.stringify(nextRates));
      window.dispatchEvent(new Event("hotelhub-room-rates-updated"));
    }
  };

  const persistAndRefresh = () => {
    sortRooms();
    window.saveStoredRooms(rooms);
    renderRooms();
    window.dispatchEvent(new Event("hotelhub-rooms-updated"));
  };

  const renderRooms = () => {
    const storedRates =
      typeof window.getStoredRoomRates === "function" ? window.getStoredRoomRates() : {};

    if (!rooms.length) {
      tableBody.innerHTML = `
        <tr class="settings-empty-row">
          <td colspan="5">
            <div class="settings-empty-state">
              <strong>No rooms added yet.</strong>
              <span>Add your first room above to start building the room inventory.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rooms
      .map((room, index) => {
        const roomRate = Number(storedRates[room.type] ?? 129);

        return `
          <tr>
            <td>
              <div class="settings-room-cell">
                <strong class="settings-room-number">${room.number}</strong>
                <span class="settings-room-subtext">Room inventory</span>
              </div>
            </td>
            <td>
              <div class="settings-type-cell">
                <span class="settings-type-code">${room.type}</span>
                <span class="settings-type-name">${formatRoomTypeLabel(room.type)}</span>
              </div>
            </td>
            <td>
              <div class="settings-rate-cell">
                <strong>$${roomRate.toFixed(2)}</strong>
                <span>per night</span>
              </div>
            </td>
            <td>
              <span class="badge ${getStatusBadgeClass(room.status)}">${formatStatusLabel(room.status)}</span>
            </td>
            <td>
              <div class="settings-room-actions">
                <button type="button" class="settings-action-btn settings-action-btn--edit edit-room" data-index="${index}">Edit</button>
                <button type="button" class="settings-action-btn settings-action-btn--delete delete-room" data-index="${index}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  const upsertRoom = () => {
    const roomNumber = numberInput.value.trim();
    const roomType = typeInput.value.trim();
    const roomStatus = statusInput.value.trim().toLowerCase();

    if (!roomNumber) {
      numberInput.focus();
      return;
    }

    const duplicateIndex = rooms.findIndex((room, index) => {
      return room.number.toLowerCase() === roomNumber.toLowerCase() && index !== editingIndex;
    });

    if (duplicateIndex !== -1) {
      alert("That room number already exists.");
      numberInput.focus();
      return;
    }

    const nextRoom = {
      number: roomNumber,
      type: roomType,
      status: roomStatus || "clean"
    };

    if (editingIndex !== null) {
      rooms[editingIndex] = nextRoom;
    } else {
      rooms.push(nextRoom);
    }

    persistAndRefresh();
    resetForm();
  };

  addBtn.addEventListener("click", upsertRoom);
  clearBtn.addEventListener("click", resetForm);
  saveRatesBtn.addEventListener("click", saveRates);
  resetRatesBtn.addEventListener("click", () => {
    localStorage.removeItem("hotelhub_room_rates");
    syncRateInputs();
    window.dispatchEvent(new Event("hotelhub-room-rates-updated"));
  });

  numberInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      upsertRoom();
    }
  });

  tableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-room");
    const deleteButton = event.target.closest(".delete-room");

    if (editButton) {
      const index = Number(editButton.dataset.index);
      const room = rooms[index];

      if (!room) return;

      numberInput.value = room.number;
      typeInput.value = room.type;
      statusInput.value = room.status;
      editingIndex = index;
      addBtn.textContent = "Save Room";
      numberInput.focus();
      return;
    }

    if (deleteButton) {
      const index = Number(deleteButton.dataset.index);

      if (Number.isNaN(index) || !rooms[index]) return;

      rooms.splice(index, 1);

      if (editingIndex === index) {
        resetForm();
      } else if (editingIndex !== null && index < editingIndex) {
        editingIndex -= 1;
      }

      persistAndRefresh();
    }
  });

  renderRooms();
  resetForm();
  syncRateInputs();
});
