function getToken() {
  return localStorage.getItem("gitfit_token");
}

function setToken(token) {
  localStorage.setItem("gitfit_token", token);
}

function clearToken() {
  localStorage.removeItem("gitfit_token");
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function requireAuthPage() {
  if (!getToken()) {
    redirectToLogin();
  }
}

function redirectIfAuthenticated() {
  if (getToken()) {
    window.location.href = "dashboard.html";
  }
}

async function apiRequest(path, options = {}, requiresAuth = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      redirectToLogin();
      return null;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const rawBody = await response.text();
  let data = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { detail: rawBody };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && requiresAuth) {
      clearToken();
      redirectToLogin();
      return null;
    }
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

function attachLogoutHandlers() {
  const logoutButtons = document.querySelectorAll("[data-action='logout']");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearToken();
      redirectToLogin();
    });
  });
}
