/* GlobalOSP Edit Profile + Settings Link Fix
   Load this AFTER js/main.js and AFTER js/social-polish.js if you have it.
*/

document.addEventListener("DOMContentLoaded", () => {
  addSettingsLinks();
  fixEditProfileButton();
});

function addSettingsLinks() {
  const settingsHref = "settings.html";

  // Desktop nav
  document.querySelectorAll(".nav-links").forEach((nav) => {
    const alreadyHasSettings = Array.from(nav.querySelectorAll("a")).some((a) =>
      (a.getAttribute("href") || "").includes("settings.html")
    );

    if (!alreadyHasSettings) {
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = settingsHref;
      link.textContent = "Settings";
      nav.appendChild(link);
    }
  });

  // Mobile nav
  document.querySelectorAll(".mobile-menu").forEach((menu) => {
    const alreadyHasSettings = Array.from(menu.querySelectorAll("a")).some((a) =>
      (a.getAttribute("href") || "").includes("settings.html")
    );

    if (!alreadyHasSettings) {
      const link = document.createElement("a");
      link.href = settingsHref;
      link.textContent = "Settings";
      menu.appendChild(link);
    }
  });

  // Sidebar nav if it exists
  document.querySelectorAll(".sidebar-nav").forEach((nav) => {
    const alreadyHasSettings = Array.from(nav.querySelectorAll("a")).some((a) =>
      (a.getAttribute("href") || "").includes("settings.html")
    );

    if (!alreadyHasSettings) {
      const link = document.createElement("a");
      link.className = "sidebar-link";
      link.href = settingsHref;
      link.innerHTML = `<span class="icon">⚙</span><span>Settings</span>`;
      nav.appendChild(link);
    }
  });
}

function fixEditProfileButton() {
  const editBtn = document.querySelector("#editProfileBtn");
  const form = document.querySelector("#profileForm");

  if (!editBtn || !form) return;

  // Make sure it is clickable and not accidentally submitting anything.
  editBtn.setAttribute("type", "button");

  editBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    form.classList.toggle("open");

    const isOpen = form.classList.contains("open");
    editBtn.textContent = isOpen ? "Close editor" : "Edit profile";

    if (isOpen) {
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, true);
}
