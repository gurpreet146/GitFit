function showProfileMessage(message, isError = false) {
  const box = document.getElementById("profileMessage");
  box.textContent = message;
  box.classList.remove("d-none", "alert-success", "alert-danger");
  box.classList.add(isError ? "alert-danger" : "alert-success");
}

async function loadProfile() {
  const profile = await apiRequest("/profile", {}, true);
  if (!profile) {
    return;
  }

  document.getElementById("name").value = profile.name;
  document.getElementById("email").value = profile.email;
  document.getElementById("weight").value = profile.weight ?? "";
  document.getElementById("height").value = profile.height ?? "";
}

async function handleProfileUpdate(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    weight: document.getElementById("weight").value === "" ? null : Number(document.getElementById("weight").value),
    height: document.getElementById("height").value === "" ? null : Number(document.getElementById("height").value),
  };

  if (!payload.name || !payload.email) {
    showProfileMessage("Name and email are required", true);
    return;
  }

  if (payload.weight !== null && payload.weight < 0) {
    showProfileMessage("Weight must be 0 or greater", true);
    return;
  }

  if (payload.height !== null && payload.height < 0) {
    showProfileMessage("Height must be 0 or greater", true);
    return;
  }

  try {
    await apiRequest(
      "/profile",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    );
    showProfileMessage("Profile updated successfully");
  } catch (error) {
    showProfileMessage(error.message, true);
  }
}

function initProfilePage() {
  requireAuthPage();
  attachLogoutHandlers();
  document.getElementById("profileForm").addEventListener("submit", handleProfileUpdate);
  loadProfile().catch((error) => showProfileMessage(error.message, true));
}

document.addEventListener("DOMContentLoaded", initProfilePage);
