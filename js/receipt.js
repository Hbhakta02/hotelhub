document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("receipt-page")) return;

  const params = new URLSearchParams(window.location.search);
  const receiptId = params.get("id") || "";

  const title = document.getElementById("receiptTitle");
  const subtitle = document.getElementById("receiptSubtitle");
  const printReceiptBtn = document.getElementById("printReceiptBtn");
  const createdAt = document.getElementById("receiptCreatedAt");
  const status = document.getElementById("receiptStatus");
  const guestName = document.getElementById("receiptGuestName");
  const phone = document.getElementById("receiptPhone");
  const email = document.getElementById("receiptEmail");
  const confirmation = document.getElementById("receiptConfirmation");
  const checkIn = document.getElementById("receiptCheckIn");
  const checkOut = document.getElementById("receiptCheckOut");
  const room = document.getElementById("receiptRoom");
  const nights = document.getElementById("receiptNights");
  const paymentType = document.getElementById("receiptPaymentType");
  const card = document.getElementById("receiptCard");
  const expiry = document.getElementById("receiptExpiry");
  const rate = document.getElementById("receiptRate");
  const tax = document.getElementById("receiptTax");
  const total = document.getElementById("receiptTotal");

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const receipts = (() => {
    try {
      const saved = localStorage.getItem("hotelhub_receipts");
      const parsed = JSON.parse(saved || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const receipt = receipts.find((entry) => entry.id === receiptId);

  if (!receipt) {
    if (title) title.textContent = "Receipt Not Found";
    if (subtitle) subtitle.textContent = "No saved receipt matches this record.";
    return;
  }

  if (title) {
    title.textContent = receipt.confirmationNumber
      ? `Receipt #${receipt.confirmationNumber}`
      : "Walk-In Receipt";
  }

  if (subtitle) {
    subtitle.textContent = receipt.status === "checked-in"
      ? "Checked-in guest receipt."
      : "Reservation receipt.";
  }

  if (createdAt) {
    createdAt.textContent = receipt.createdAt
      ? new Date(receipt.createdAt).toLocaleDateString("en-US")
      : "--";
  }

  if (status) {
    status.textContent = receipt.status || "--";
  }

  if (guestName) guestName.textContent = `${receipt.guest?.firstName || ""} ${receipt.guest?.lastName || ""}`.trim() || "--";
  if (phone) phone.textContent = receipt.guest?.phone || "--";
  if (email) email.textContent = receipt.guest?.email || "--";
  if (confirmation) confirmation.textContent = receipt.confirmationNumber || "--";
  if (checkIn) checkIn.textContent = receipt.stay?.checkInDate || "--";
  if (checkOut) checkOut.textContent = receipt.stay?.checkOutDate || "--";
  if (room) {
    room.textContent = receipt.stay?.roomNumber
      ? `${receipt.stay.roomNumber} - ${receipt.stay?.roomType || ""}`.trim()
      : receipt.stay?.roomType || "--";
  }
  if (nights) nights.textContent = String(receipt.stay?.nights ?? "--");
  if (paymentType) paymentType.textContent = receipt.payment?.paymentType || "--";
  if (card) card.textContent = receipt.payment?.cardNumberLast4 ? `**** ${receipt.payment.cardNumberLast4}` : "--";
  if (expiry) expiry.textContent = receipt.payment?.expiry || "--";
  if (rate) rate.textContent = formatCurrency(receipt.stay?.rate);
  if (tax) tax.textContent = formatCurrency((Number(receipt.stay?.subtotalAmount || 0) * Number(receipt.stay?.taxRate || 0)) / 100);
  if (total) total.textContent = formatCurrency(receipt.stay?.totalAmount);

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => {
      window.print();
    });
  }
});
