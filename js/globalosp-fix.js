/* GlobalOSP Locked Social Fix
   Load this after main.js and social-polish.js on every page.
*/

window.GLOBALOSP_VERIFIED_USERS = window.GLOBALOSP_VERIFIED_USERS || [
  "qapps",
  "elaborateedu",
  "globalosp"
];

/* Add your exact username, display name, or Firebase UID here. */
window.GLOBALOSP_VERIFIED_USERS.push(
  "jonny"
);

document.addEventListener("DOMContentLoaded", () => {
  injectPatchworkLinks();
  hardFixEditProfile();
  startVerifiedObserver();
  patchExistingLogoutNav();
});

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace("@", "")
    .trim();
}

function verifiedList() {
  return [...new Set((window.GLOBALOSP_VERIFIED_USERS || []).map(norm))];
}

function shouldVerify(values) {
  const list = verifiedList();
  return values.map(norm).some((value) => list.includes(value));
}

function badgeHTML(large = false) {
  return `<span class="verified-badge ${large ? "large" : ""}" title="Verified GlobalOSP creator">✓</span>`;
}

function injectPatchworkLinks() {
  // Desktop nav
  document.querySelectorAll(".nav-links").forEach((nav) => {
    if (![...nav.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("patchwork.html"))) {
      const a = document.createElement("a");
      a.href = "patchwork.html";
      a.className = "nav-link patchwork-link";
      a.textContent = "Patchwork";
      nav.appendChild(a);
    }

    if (![...nav.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("settings.html"))) {
      const a = document.createElement("a");
      a.href = "settings.html";
      a.className = "nav-link";
      a.textContent = "Settings";
      nav.appendChild(a);
    }
  });

  // Mobile nav
  document.querySelectorAll(".mobile-menu").forEach((menu) => {
    if (![...menu.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("patchwork.html"))) {
      const a = document.createElement("a");
      a.href = "patchwork.html";
      a.textContent = "Patchwork";
      menu.appendChild(a);
    }

    if (![...menu.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("settings.html"))) {
      const a = document.createElement("a");
      a.href = "settings.html";
      a.textContent = "Settings";
      menu.appendChild(a);
    }
  });

  // Feed sidebar
  document.querySelectorAll(".sidebar-nav").forEach((nav) => {
    if (![...nav.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("patchwork.html"))) {
      const a = document.createElement("a");
      a.href = "patchwork.html";
      a.className = "sidebar-link patchwork-link";
      a.innerHTML = `<span class="icon">✦</span><span>Patchwork</span>`;
      nav.appendChild(a);
    }

    if (![...nav.querySelectorAll("a")].some((a) => (a.getAttribute("href") || "").includes("settings.html"))) {
      const a = document.createElement("a");
      a.href = "settings.html";
      a.className = "sidebar-link";
      a.innerHTML = `<span class="icon">⚙</span><span>Settings</span>`;
      nav.appendChild(a);
    }
  });
}

function hardFixEditProfile() {
  const btn = document.querySelector("#editProfileBtn");
  const form =
    document.querySelector("#profileForm") ||
    document.querySelector("#profileEditor") ||
    document.querySelector(".profile-editor");

  if (!btn || !form) return;

  btn.type = "button";

  // Remove inline display none problems from older patches.
  if (form.style.display === "none") form.style.display = "";

  btn.onclick = null;
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    form.classList.toggle("open");

    const open = form.classList.contains("open");
    btn.textContent = open ? "Close editor" : "Edit profile";

    if (open) {
      form.style.display = "block";
      setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    } else {
      form.style.display = "";
    }
  }, true);
}

function startVerifiedObserver() {
  addVerifiedBadges();

  const observer = new MutationObserver(() => addVerifiedBadges());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  setInterval(addVerifiedBadges, 1000);
}

function addVerifiedBadges() {
  // Feed/post cards
  document.querySelectorAll(".post-card").forEach((card) => {
    const nameEl = card.querySelector(".post-name");
    const handleEl = card.querySelector(".post-handle");
    if (!nameEl || nameEl.querySelector(".verified-badge")) return;

    const name = nameEl.childNodes[0]?.textContent || nameEl.textContent;
    const handle = handleEl?.textContent || "";

    if (shouldVerify([name, handle])) {
      nameEl.insertAdjacentHTML("beforeend", " " + badgeHTML(false));
    }
  });

  // Profile page
  const profileName = document.querySelector("#profileDisplayName");
  const profileHandle = document.querySelector("#profileHandle");

  if (profileName && !profileName.querySelector(".verified-badge")) {
    const rawName = profileName.childNodes[0]?.textContent || profileName.textContent;
    const rawHandle = profileHandle?.textContent || "";

    if (shouldVerify([rawName, rawHandle])) {
      profileName.insertAdjacentHTML("beforeend", " " + badgeHTML(true));
    }
  }

  // Nav profile pill, if it shows @username
  document.querySelectorAll(".nav-actions a, .nav-actions button").forEach((el) => {
    if (el.querySelector(".verified-badge")) return;
    const text = el.textContent || "";
    if (text.includes("@") && shouldVerify([text])) {
      el.insertAdjacentHTML("beforeend", " " + badgeHTML(false));
    }
  });
}

function patchExistingLogoutNav() {
  // If nav-actions gets rewritten by auth state, keep Patchwork available by rerunning.
  setInterval(injectPatchworkLinks, 1500);
}
