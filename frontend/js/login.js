function showLoginError(message) {
  const errorBox = document.getElementById("loginError");
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

function hideLoginError() {
  const errorBox = document.getElementById("loginError");
  errorBox.classList.add("d-none");
  errorBox.textContent = "";
}

async function handleLogin(event) {
  event.preventDefault();
  hideLoginError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );

    if (!result || !result.access_token) {
      throw new Error("Login failed");
    }

    setToken(result.access_token);
    window.location.href = "dashboard.html";
  } catch (error) {
    showLoginError(error.message);
  }
}

function initLoginPage() {
  redirectIfAuthenticated();
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

document.addEventListener("DOMContentLoaded", initLoginPage);
