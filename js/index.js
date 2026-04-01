document.addEventListener("DOMContentLoaded", () => {
  const authStorageKey = "hotelhub-authenticated";
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const feedback = document.getElementById("loginFeedback");

  const hideFeedback = () => {
    if (!feedback) return;
    feedback.textContent = "";
    feedback.classList.add("hidden");
  };

  const showFeedback = (message) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove("hidden");
  };

  if (localStorage.getItem(authStorageKey) === "true") {
    window.location.replace("dashboard.html");
    return;
  }

  if (!loginForm || !usernameInput || !passwordInput) return;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === "admin" && password === "password") {
      localStorage.setItem(authStorageKey, "true");
      hideFeedback();
      window.location.replace("dashboard.html");
      return;
    }

    showFeedback("Invalid login. Use admin / password.");
  });

  usernameInput.addEventListener("input", hideFeedback);
  passwordInput.addEventListener("input", hideFeedback);
});
