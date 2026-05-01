/* GlobalOSP social polish patch
   Load this AFTER js/main.js.
   It adds:
   - verified badges
   - fixed Google buttons when main.js missed them
   - settings page functionality
*/

window.GLOBALOSP_VERIFIED_USERS = [
  "qapps",
  "elaborateedu",
  "globalosp"
];

function globalospEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function globalospVerified(item = {}) {
  const verified = window.GLOBALOSP_VERIFIED_USERS.map((x) => String(x).toLowerCase());
  const values = [
    item.uid,
    item.authorId,
    item.username,
    item.handle,
    item.authorHandle,
    item.name,
    item.authorName
  ].filter(Boolean).map((x) => String(x).toLowerCase());

  return values.some((x) => verified.includes(x));
}

function globalospVerifiedBadge(item = {}, large = false) {
  return globalospVerified(item)
    ? `<span class="verified-badge ${large ? "large" : ""}" title="Verified GlobalOSP creator">✓</span>`
    : "";
}

document.addEventListener("DOMContentLoaded", () => {
  setupGoogleFallback();
  setupSettingsPage();
  setTimeout(addVerifiedBadgesToExistingDOM, 500);
  setInterval(addVerifiedBadgesToExistingDOM, 2000);
});

function setupGoogleFallback() {
  document.querySelectorAll(".btn-google").forEach((button) => {
    if (button.dataset.googleReady === "true") return;
    button.dataset.googleReady = "true";

    button.addEventListener("click", async () => {
      try {
        if (typeof firebase === "undefined" || !firebase.apps.length) {
          alert("Firebase is not loaded.");
          return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await firebase.auth().signInWithPopup(provider);

        const db = firebase.firestore();
        const user = result.user;
        const ref = db.collection("users").doc(user.uid);
        const snap = await ref.get();

        if (!snap.exists) {
          const username = (user.displayName || user.email.split("@")[0] || "builder")
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 24);

          await ref.set({
            name: user.displayName || username,
            username,
            handle: username,
            email: user.email || "",
            bio: "",
            location: "",
            website: "",
            platforms: [],
            photoURL: user.photoURL || "",
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }

        window.location.href = "feed.html";
      } catch (error) {
        console.error(error);
        alert((error.message || String(error)).replace(/^Firebase:\s*/i, ""));
      }
    });
  });
}

function addVerifiedBadgesToExistingDOM() {
  const verified = window.GLOBALOSP_VERIFIED_USERS.map((x) => x.toLowerCase());

  document.querySelectorAll(".post-card").forEach((card) => {
    const nameEl = card.querySelector(".post-name");
    const handleEl = card.querySelector(".post-handle");
    if (!nameEl || nameEl.querySelector(".verified-badge")) return;

    const name = nameEl.textContent.trim().toLowerCase();
    const handle = (handleEl?.textContent || "").replace("@", "").trim().toLowerCase();

    if (verified.includes(name) || verified.includes(handle)) {
      nameEl.insertAdjacentHTML("beforeend", ` <span class="verified-badge" title="Verified GlobalOSP creator">✓</span>`);
    }
  });

  const profileName = document.querySelector("#profileDisplayName");
  const profileHandle = document.querySelector("#profileHandle");

  if (profileName && !profileName.querySelector(".verified-badge")) {
    const name = profileName.textContent.trim().toLowerCase();
    const handle = (profileHandle?.textContent || "").replace("@", "").trim().toLowerCase();

    if (verified.includes(name) || verified.includes(handle)) {
      profileName.insertAdjacentHTML("beforeend", ` <span class="verified-badge large" title="Verified GlobalOSP creator">✓</span>`);
    }
  }
}

function setupSettingsPage() {
  const root = document.querySelector("[data-settings-page]");
  if (!root) return;

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.settingsTab;

      document.querySelectorAll("[data-settings-tab]").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll("[data-settings-panel]").forEach((p) => p.classList.remove("active"));

      button.classList.add("active");
      document.querySelector(`[data-settings-panel="${target}"]`)?.classList.add("active");
    });
  });

  if (typeof firebase === "undefined" || !firebase.apps.length) {
    return;
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const db = firebase.firestore();
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};

    setVal("settingsName", data.name || user.displayName || "");
    setVal("settingsUsername", data.username || "");
    setVal("settingsBio", data.bio || "");
    setVal("settingsLocation", data.location || "");
    setVal("settingsWebsite", data.website || "");
    setVal("settingsPhotoURL", data.photoURL || user.photoURL || "");
    setVal("settingsPlatforms", (data.platforms || []).map((p) => `${p.name}|${p.url}`).join("\n"));
    setVal("settingsEmail", user.email || "");

    document.querySelector("#settingsProfileForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const update = {
        name: val("settingsName"),
        username: val("settingsUsername").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24),
        handle: val("settingsUsername").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24),
        bio: val("settingsBio"),
        location: val("settingsLocation"),
        website: val("settingsWebsite"),
        photoURL: val("settingsPhotoURL"),
        platforms: parsePlatformLines(val("settingsPlatforms")),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await ref.set(update, { merge: true });
      await user.updateProfile({ displayName: update.name, photoURL: update.photoURL });
      alert("Settings saved.");
    });

    document.querySelector("#logoutEverywhereBtn")?.addEventListener("click", async () => {
      await firebase.auth().signOut();
      window.location.href = "index.html";
    });
  });
}

function val(id) {
  return document.querySelector(`#${id}`)?.value.trim() || "";
}

function setVal(id, value) {
  const el = document.querySelector(`#${id}`);
  if (el) el.value = value;
}

function parsePlatformLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, url] = line.split("|").map((x) => x.trim());
      return { name: name || "Link", url: url || "#" };
    });
}
