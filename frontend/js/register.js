function showRegisterError(message) {
  const errorBox = document.getElementById("registerError");
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

function hideRegisterError() {
  const errorBox = document.getElementById("registerError");
  errorBox.classList.add("d-none");
  errorBox.textContent = "";
}

async function handleRegister(event) {
  event.preventDefault();
  hideRegisterError();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await apiRequest(
      "/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      false
    );

    const loginResult = await apiRequest(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );

    if (!loginResult || !loginResult.access_token) {
      throw new Error("Registration succeeded but login failed");
    }

    setToken(loginResult.access_token);
    window.location.href = "dashboard.html";
  } catch (error) {
    showRegisterError(error.message);
  }
}

function initRegisterPage() {
  redirectIfAuthenticated();
  document.getElementById("registerForm").addEventListener("submit", handleRegister);
}

document.addEventListener("DOMContentLoaded", initRegisterPage);
