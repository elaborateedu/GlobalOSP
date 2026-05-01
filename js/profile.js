// GlobalOSP profile.js
// Handles only profile.html. It does not replace your main.js.

(function () {
  const $ = (selector, parent = document) => parent.querySelector(selector);

  const demoProfile = {
    uid: "demo",
    name: "GlobalOSP Builder",
    username: "builder",
    bio: "Sharing projects from GitHub, Replit, Roblox Studio, Scratch, GitLab, and anywhere else builders create.",
    website: "https://github.com/elaborateedu/GlobalOSP",
    location: "Internet",
    platforms: [
      { name: "GitHub", url: "https://github.com/elaborateedu/GlobalOSP" },
      { name: "GlobalOSP", url: "https://github.com/elaborateedu/GlobalOSP" }
    ],
    followers: 0,
    following: 0,
    postsCount: 0
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupModal();
    setupEditor();
    loadProfile();
  });

  function setupNav() {
    const hamburger = $("#hamburger");
    const mobileMenu = $("#mobileMenu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
      });
    }
  }

  function setupModal() {
    const modal = $("#commentModal");
    const close = $("#commentClose");

    if (close && modal) {
      close.addEventListener("click", () => {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
      });
    }
  }

  function setupEditor() {
    const editBtn = $("#editProfileBtn");
    const editor = $("#profileForm");

    if (editBtn && editor) {
      editBtn.addEventListener("click", () => {
        editor.classList.toggle("open");
      });
    }

    if (editor) {
      editor.addEventListener("submit", saveProfile);
    }
  }

  function firebaseReady() {
    return typeof firebase !== "undefined" && firebase.apps && firebase.apps.length;
  }

  function loadProfile() {
    if (!firebaseReady()) {
      renderProfile(demoProfile, [], null);
      return;
    }

    firebase.auth().onAuthStateChanged(async (user) => {
      updateNav(user);

      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid") || user?.uid;

      if (!uid) {
        showLoggedOut();
        return;
      }

      try {
        const db = firebase.firestore();
        let profileSnap = await db.collection("users").doc(uid).get();

        if (!profileSnap.exists && user && uid === user.uid) {
          await createMissingProfile(user);
          profileSnap = await db.collection("users").doc(uid).get();
        }

        if (!profileSnap.exists) {
          showError("Profile not found.");
          return;
        }

        const profile = { uid, ...profileSnap.data() };
        const posts = await getUserPosts(uid);

        renderProfile(profile, posts, user);
      } catch (error) {
        console.error(error);
        showError(`Could not load profile: ${cleanError(error)}`);
      }
    });
  }

  async function createMissingProfile(user) {
    const username = normalizeUsername(user.displayName || user.email?.split("@")[0] || "builder");

    await firebase.firestore().collection("users").doc(user.uid).set({
      name: user.displayName || username,
      username,
      email: user.email || "",
      bio: "",
      website: "",
      location: "Internet",
      platforms: [],
      followers: 0,
      following: 0,
      postsCount: 0,
      photoURL: user.photoURL || "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async function getUserPosts(uid) {
    const db = firebase.firestore();

    try {
      const snapshot = await db.collection("posts")
        .where("authorId", "==", uid)
        .limit(30)
        .get();

      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
    } catch (error) {
      console.warn("Profile posts could not load:", error);
      return [];
    }
  }

  function renderProfile(profile, posts, currentUser) {
    const isOwnProfile = currentUser && currentUser.uid === profile.uid;

    setText("profileDisplayName", profile.name || "Unnamed Builder");
    setText("profileHandle", `@${profile.username || "builder"}`);
    setText("profileBioText", profile.bio || "No bio yet.");
    setText("profileLocationText", `📍 ${profile.location || "Internet"}`);
    setText("postsCount", profile.postsCount || posts.length || 0);
    setText("followersCount", profile.followers || profile.followersCount || 0);
    setText("followingCount", profile.following || profile.followingCount || 0);

    const website = $("#profileWebsiteLink");
    if (website) {
      website.textContent = profile.website || "No website";
      website.href = profile.website || "#";
    }

    const avatar = $("#profileAvatar");
    if (avatar) {
      avatar.textContent = initials(profile.name || profile.username || "GO");
      avatar.style.backgroundImage = profile.photoURL ? `url("${profile.photoURL}")` : "";
    }

    const platforms = $("#profilePlatformsWrap");
    if (platforms) {
      const list = Array.isArray(profile.platforms) ? profile.platforms : [];

      platforms.innerHTML = list.length
        ? list.map((item) => `<a class="tag" href="${escapeAttr(item.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(item.name || "Link")}</a>`).join("")
        : `<span class="tag">No connected platforms yet</span>`;
    }

    const editBtn = $("#editProfileBtn");
    const followBtn = $("#followBtn");

    if (editBtn) editBtn.classList.toggle("hidden", !isOwnProfile);
    if (followBtn) followBtn.classList.toggle("hidden", isOwnProfile || !currentUser);

    if (isOwnProfile) {
      setValue("profileName", profile.name || "");
      setValue("profileLocation", profile.location || "");
      setValue("profileBio", profile.bio || "");
      setValue("profileWebsite", profile.website || "");
      setValue("profilePlatforms", (profile.platforms || []).map((p) => `${p.name}|${p.url}`).join("\n"));
    }

    renderPosts(posts);
  }

  function renderPosts(posts) {
    const root = $("#profilePosts");
    if (!root) return;

    if (!posts.length) {
      root.innerHTML = `<div class="empty-state">No posts yet.</div>`;
      return;
    }

    root.innerHTML = posts.map((post) => `
      <article class="post-card">
        <div class="post-avatar">${initials(post.authorName || "U")}</div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-name">${escapeHtml(post.authorName || "Anonymous")}</span>
            <span class="post-handle">@${escapeHtml(post.authorHandle || "user")}</span>
          </div>
          <span class="post-platform-tag">${escapeHtml(post.platform || "Project")}</span>
          <p class="post-text">${escapeHtml(post.text || "")}</p>
        </div>
      </article>
    `).join("");
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!firebaseReady()) {
      alert("Firebase is not loaded.");
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const data = {
      name: value("profileName"),
      location: value("profileLocation"),
      bio: value("profileBio"),
      website: value("profileWebsite"),
      platforms: parsePlatforms(value("profilePlatforms")),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await firebase.firestore().collection("users").doc(user.uid).set(data, { merge: true });
      await user.updateProfile({ displayName: data.name });
      alert("Profile saved.");
      loadProfile();
    } catch (error) {
      alert(cleanError(error));
    }
  }

  function updateNav(user) {
    const nav = $("#navActions");
    if (!nav) return;

    if (!user) {
      nav.innerHTML = `
        <a href="login.html" class="btn btn-ghost">Log in</a>
        <a href="signup.html" class="btn btn-primary">Sign up</a>
      `;
      return;
    }

    nav.innerHTML = `
      <a href="profile.html" class="btn btn-ghost">Profile</a>
      <button class="btn btn-primary" id="logoutBtn" type="button">Log out</button>
    `;

    $("#logoutBtn")?.addEventListener("click", async () => {
      await firebase.auth().signOut();
      window.location.href = "index.html";
    });
  }

  function showLoggedOut() {
    const root = $("#profileRoot");
    if (!root) return;

    root.innerHTML = `
      <article class="profile-card">
        <div class="empty-state">
          Log in to view and edit your profile.
          <br><br>
          <a class="btn btn-primary" href="login.html">Log in</a>
        </div>
      </article>
    `;
  }

  function showError(message) {
    const root = $("#profileRoot");
    if (!root) return;

    root.innerHTML = `
      <article class="profile-card">
        <div class="empty-state">${escapeHtml(message)}</div>
      </article>
    `;
  }

  function parsePlatforms(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, url] = line.split("|").map((part) => part.trim());
        return { name: name || "Link", url: url || "#" };
      });
  }

  function value(id) {
    return $(`#${id}`)?.value.trim() || "";
  }

  function setValue(id, val) {
    const el = $(`#${id}`);
    if (el) el.value = val;
  }

  function setText(id, val) {
    const el = $(`#${id}`);
    if (el) el.textContent = val;
  }

  function normalizeUsername(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || "builder";
  }

  function initials(text) {
    return String(text)
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GO";
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(text) {
    return escapeHtml(text).replaceAll("`", "&#096;");
  }

  function cleanError(error) {
    return (error?.message || String(error)).replace(/^Firebase:\s*/i, "");
  }
})();
