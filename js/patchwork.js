const PATCHWORK_UPDATES = [
  {
    title: "Locked Social Fix",
    date: "Current",
    tags: ["verified", "profile", "navigation", "patchwork"],
    changes: [
      "Fixed verified badges so they appear in feed posts and profile names.",
      "Fixed the Edit profile button so it actually opens and closes the editor.",
      "Added Settings and Patchwork links to the navbar, mobile menu, and feed sidebar.",
      "Added this Patchwork page to track every major GlobalOSP update."
    ]
  },
  {
    title: "Social Polish + Settings",
    date: "Previous",
    tags: ["settings", "google", "auth", "profile"],
    changes: [
      "Added a full settings page with profile, account, platforms, notifications, privacy, and danger zone sections.",
      "Added Google sign-in fallback code.",
      "Added verified-user configuration.",
      "Added auth page character art."
    ]
  },
  {
    title: "Image URL Posting",
    date: "Previous",
    tags: ["posts", "images", "firestore"],
    changes: [
      "Removed Firebase Storage requirement.",
      "Added image URL support for posts.",
      "Added longer descriptions to posts.",
      "Updated feed rendering for project images."
    ]
  },
  {
    title: "Profile Page Fix",
    date: "Previous",
    tags: ["profile", "css", "firebase"],
    changes: [
      "Rebuilt profile layout styling.",
      "Fixed profile loading states.",
      "Added editable profile fields.",
      "Added connected platform links."
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#patchworkList");
  if (!root) return;

  root.innerHTML = PATCHWORK_UPDATES.map((update) => `
    <article class="patch-card">
      <div class="patch-card-head">
        <h2>${escapePatch(update.title)}</h2>
        <span class="patch-date">${escapePatch(update.date)}</span>
      </div>
      <div class="patch-tags">
        ${update.tags.map((tag) => `<span class="patch-tag">${escapePatch(tag)}</span>`).join("")}
      </div>
      <ul>
        ${update.changes.map((change) => `<li>${escapePatch(change)}</li>`).join("")}
      </ul>
    </article>
  `).join("");
});

function escapePatch(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
