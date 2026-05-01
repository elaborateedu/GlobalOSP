// GlobalOSP — main.js
// Social platform logic: auth, posts, likes, reposts, comments, profiles, follow system.

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const isFirebaseReady = () => typeof firebase !== "undefined" && firebase.apps && firebase.apps.length;

const demoPosts = [
  {
    id: "demo-1",
    authorName: "jdev42",
    authorHandle: "jdev42",
    authorId: "demo",
    authorPhoto: "",
    platform: "GitHub",
    text: "Just shipped v2.0 of my open-source CLI tool for scaffolding React apps. Feedback welcome!",
    projectTitle: "create-react-fast",
    projectUrl: "https://github.com/jdev42/create-react-fast",
    tags: ["TypeScript", "React", "CLI"],
    commentsCount: 12,
    repostsCount: 8,
    starsCount: 47,
    createdAt: null
  },
  {
    id: "demo-2",
    authorName: "robloxlua",
    authorHandle: "robloxlua",
    authorId: "demo",
    authorPhoto: "",
    platform: "Roblox Studio",
    text: "Open-sourced my entire combat system framework for Roblox. Took 6 months to build — free for the community.",
    projectTitle: "Roblox Combat Framework",
    projectUrl: "https://www.roblox.com",
    tags: ["Lua", "Roblox", "GameDev"],
    commentsCount: 34,
    repostsCount: 21,
    starsCount: 192,
    createdAt: null
  },
  {
    id: "demo-3",
    authorName: "maxreplit",
    authorHandle: "maxreplit",
    authorId: "demo",
    authorPhoto: "",
    platform: "Replit",
    text: "Built a tiny ML model that classifies dog breeds in under 100ms — runs entirely in the browser via ONNX.",
    projectTitle: "dog-breed-classifier",
    projectUrl: "https://replit.com",
    tags: ["Python", "ML", "ONNX"],
    commentsCount: 9,
    repostsCount: 15,
    starsCount: 88,
    createdAt: null
  }
];

document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  setupReveal();
  setupAuthForms();
  setupGithubButtons();
  setupCompose();
  setupProfileEditor();
  setupCommentModal();
  watchAuthState();
  loadFeed();
  loadProfilePage();
});

function setupNavbar() {
  const navbar = $("#navbar");
  if (navbar) {
    window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 10));
  }

  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
  }
}

function setupReveal() {
  const revealEls = $$(".reveal");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => observer.observe(el));
}

function showToast(message, emoji = "✅") {
  const existing = $(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${emoji}</span><span>${escapeHtml(message)}</span><button class="toast-close" aria-label="Close">×</button>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  $(".toast-close", toast).addEventListener("click", () => hideToast(toast));
  setTimeout(() => hideToast(toast), 3800);
}

function hideToast(toast) {
  if (!toast) return;
  toast.classList.remove("show");
  setTimeout(() => toast.remove(), 300);
}

function setupAuthForms() {
  const loginForm = $("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");

      const email = $("#email").value.trim();
      const password = $("#password").value;
      const button = loginForm.querySelector("[type='submit']");
      setLoading(button, "Signing in…");

      try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast("Welcome back!");
        setTimeout(() => (window.location.href = "feed.html"), 700);
      } catch (error) {
        showToast(cleanFirebaseError(error), "❌");
        setLoading(button, "Sign in", false);
      }
    });
  }

  const signupForm = $("#signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");

      const name = $("#name").value.trim();
      const username = normalizeUsername($("#username").value);
      const email = $("#email").value.trim();
      const password = $("#password").value;
      const button = signupForm.querySelector("[type='submit']");

      if (!username) return showToast("Choose a username.", "❌");

      setLoading(button, "Creating account…");

      try {
        await reserveUsername(username);
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name || username });

        await db.collection("users").doc(cred.user.uid).set({
          name: name || username,
          username,
          handle: username,
          email,
          bio: "",
          location: "",
          website: "",
          platforms: [],
          photoURL: "",
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast("Account created!");
        setTimeout(() => (window.location.href = "feed.html"), 900);
      } catch (error) {
        showToast(cleanFirebaseError(error), "❌");
        setLoading(button, "Create account", false);
      }
    });
  }
}

async function reserveUsername(username) {
  const usernameRef = db.collection("usernames").doc(username);
  const snap = await usernameRef.get();
  if (snap.exists) throw new Error("That username is already taken.");
  await usernameRef.set({
    uid: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function setupGithubButtons() {
  $$(".btn-github").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");

      try {
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope("read:user");
        const result = await auth.signInWithPopup(provider);
        await ensureUserProfile(result.user, result.additionalUserInfo);
        showToast("Signed in with GitHub!");
        setTimeout(() => (window.location.href = "feed.html"), 800);
      } catch (error) {
        showToast(cleanFirebaseError(error), "❌");
      }
    });
  });
}

async function ensureUserProfile(user, extraInfo = null) {
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return;

  const githubUsername = extraInfo?.username || user.email?.split("@")[0] || "builder";
  const username = normalizeUsername(githubUsername) || `user${Date.now()}`;

  await ref.set({
    name: user.displayName || username,
    username,
    handle: username,
    email: user.email || "",
    bio: "",
    location: "",
    website: extraInfo?.profile?.html_url || "",
    platforms: extraInfo?.profile?.html_url ? [{ name: "GitHub", url: extraInfo.profile.html_url }] : [],
    photoURL: user.photoURL || "",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

function setupCompose() {
  const postInput = $("#postInput");
  if (postInput) {
    postInput.addEventListener("input", () => {
      postInput.style.height = "auto";
      postInput.style.height = `${postInput.scrollHeight}px`;
      updateCharCount();
    });
  }

  const postBtn = $("#postBtn");
  if (postBtn) {
    postBtn.addEventListener("click", createPost);
  }
}

function updateCharCount() {
  const counter = $("#charCount");
  const input = $("#postInput");
  if (!counter || !input) return;
  counter.textContent = `${input.value.length}/500`;
}

async function createPost() {
  if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");

  const user = auth.currentUser;
  if (!user) {
    showToast("Please sign in first.", "❌");
    setTimeout(() => (window.location.href = "login.html"), 900);
    return;
  }

  const text = $("#postInput").value.trim();
  const platform = $("#postPlatform").value;
  const projectTitle = $("#projectTitle")?.value.trim() || "";
  const projectUrl = $("#projectUrl")?.value.trim() || "";
  const tags = parseTags($("#postTags")?.value || "");
  const button = $("#postBtn");

  if (!text && !projectUrl) return showToast("Write something or add a project link.", "❌");
  if (text.length > 500) return showToast("Posts must be 500 characters or less.", "❌");

  setLoading(button, "Sharing…");

  try {
    const profile = await getProfile(user.uid);
    await db.collection("posts").add({
      text,
      platform,
      projectTitle,
      projectUrl,
      tags,
      authorId: user.uid,
      authorName: profile?.name || user.displayName || "Anonymous",
      authorHandle: profile?.username || user.email?.split("@")[0] || "user",
      authorPhoto: profile?.photoURL || user.photoURL || "",
      commentsCount: 0,
      repostsCount: 0,
      starsCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("users").doc(user.uid).set({
      postsCount: firebase.firestore.FieldValue.increment(1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    $("#postInput").value = "";
    if ($("#projectTitle")) $("#projectTitle").value = "";
    if ($("#projectUrl")) $("#projectUrl").value = "";
    if ($("#postTags")) $("#postTags").value = "";
    updateCharCount();

    showToast("Project shared!");
  } catch (error) {
    showToast(cleanFirebaseError(error), "❌");
  }

  setLoading(button, "Share", false);
}

function loadFeed() {
  const feedPosts = $("#feedPosts");
  if (!feedPosts) return;

  if (!isFirebaseReady()) {
    feedPosts.innerHTML = "";
    demoPosts.forEach((post) => feedPosts.appendChild(buildPostCard(post.id, post)));
    return;
  }

  feedPosts.innerHTML = `<div class="empty-state">Loading posts…</div>`;

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .limit(40)
    .onSnapshot((snapshot) => {
      feedPosts.innerHTML = "";
      if (snapshot.empty) {
        feedPosts.innerHTML = `<div class="empty-state">No posts yet. Be the first to share a project.</div>`;
        return;
      }

      snapshot.forEach((doc) => {
        feedPosts.appendChild(buildPostCard(doc.id, { id: doc.id, ...doc.data() }));
      });
    }, (error) => {
      console.warn(error);
      feedPosts.innerHTML = `<div class="empty-state">Could not load posts. Check Firebase rules and indexes.</div>`;
    });
}

function buildPostCard(id, post) {
  const card = document.createElement("article");
  card.className = "post-card";
  card.dataset.id = id;
  const initials = getInitials(post.authorName || post.authorHandle || "U");
  const time = post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : "demo";
  const profileHref = post.authorId && post.authorId !== "demo" ? `profile.html?uid=${encodeURIComponent(post.authorId)}` : "profile.html";

  card.innerHTML = `
    <a class="post-avatar" href="${profileHref}" style="${post.authorPhoto ? `background-image:url('${escapeAttr(post.authorPhoto)}')` : ""}">
      ${post.authorPhoto ? "" : initials}
    </a>

    <div class="post-body">
      <div class="post-meta">
        <a class="post-name" href="${profileHref}">${escapeHtml(post.authorName || "Anonymous")}</a>
        <span class="post-handle">@${escapeHtml(post.authorHandle || "user")}</span>
        <span class="post-time">· ${escapeHtml(time)}</span>
      </div>

      <span class="post-platform-tag ${platformTagClass(post.platform)}">${escapeHtml(post.platform || "Other")}</span>

      <p class="post-text">${linkify(escapeHtml(post.text || ""))}</p>

      ${post.projectUrl || post.projectTitle ? `
        <a class="post-link-preview" href="${escapeAttr(post.projectUrl || "#")}" target="_blank" rel="noreferrer">
          <span class="plp-icon">↗</span>
          <span>
            <strong>${escapeHtml(post.projectTitle || "Project link")}</strong>
            <small>${escapeHtml(post.projectUrl || "")}</small>
          </span>
        </a>
      ` : ""}

      ${post.tags?.length ? `<div class="post-tags">${post.tags.map((tag) => `<button class="tag" data-tag="${escapeAttr(tag)}">#${escapeHtml(tag)}</button>`).join("")}</div>` : ""}

      <div class="post-actions">
        <button class="pa-btn" data-action="comment">💬 ${post.commentsCount || 0}</button>
        <button class="pa-btn" data-action="repost">↻ ${post.repostsCount || 0}</button>
        <button class="pa-btn" data-action="star">⭐ ${post.starsCount || 0}</button>
      </div>
    </div>
  `;

  $$("[data-action]", card).forEach((button) => {
    button.addEventListener("click", () => handlePostAction(id, button.dataset.action, post));
  });

  return card;
}

async function handlePostAction(postId, action, post) {
  if (action === "comment") return openCommentModal(postId, post);

  if (!isFirebaseReady() || postId.startsWith("demo")) {
    showToast("Sign in to use this on real posts.");
    return;
  }

  const user = auth.currentUser;
  if (!user) return showToast("Please sign in first.", "❌");

  const actionCollection = action === "star" ? "stars" : "reposts";
  const countField = action === "star" ? "starsCount" : "repostsCount";
  const actionRef = db.collection("posts").doc(postId).collection(actionCollection).doc(user.uid);
  const postRef = db.collection("posts").doc(postId);

  try {
    await db.runTransaction(async (tx) => {
      const actionSnap = await tx.get(actionRef);
      if (actionSnap.exists) {
        tx.delete(actionRef);
        tx.update(postRef, { [countField]: firebase.firestore.FieldValue.increment(-1) });
      } else {
        tx.set(actionRef, { userId: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        tx.update(postRef, { [countField]: firebase.firestore.FieldValue.increment(1) });
      }
    });
  } catch (error) {
    showToast(cleanFirebaseError(error), "❌");
  }
}

function setupCommentModal() {
  const modal = $("#commentModal");
  if (!modal) return;

  $$(".modal-close", modal).forEach((button) => {
    button.addEventListener("click", closeCommentModal);
  });

  $("#commentSubmit")?.addEventListener("click", submitComment);
}

function openCommentModal(postId, post) {
  const modal = $("#commentModal");
  if (!modal) {
    showToast("Comments UI missing.", "❌");
    return;
  }

  modal.dataset.postId = postId;
  $("#commentPostPreview").textContent = post.text || "Project post";
  $("#commentInput").value = "";
  $("#commentsList").innerHTML = `<div class="empty-state">Loading comments…</div>`;
  modal.classList.add("open");

  if (!isFirebaseReady() || postId.startsWith("demo")) {
    $("#commentsList").innerHTML = `<div class="empty-state">Demo post. Real comments work after Firebase is connected.</div>`;
    return;
  }

  db.collection("posts").doc(postId).collection("comments")
    .orderBy("createdAt", "asc")
    .limit(50)
    .onSnapshot((snapshot) => {
      const list = $("#commentsList");
      list.innerHTML = "";

      if (snapshot.empty) {
        list.innerHTML = `<div class="empty-state">No comments yet.</div>`;
        return;
      }

      snapshot.forEach((doc) => {
        const c = doc.data();
        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `
          <strong>${escapeHtml(c.authorName || "Anonymous")}</strong>
          <p>${escapeHtml(c.text || "")}</p>
        `;
        list.appendChild(item);
      });
    });
}

function closeCommentModal() {
  $("#commentModal")?.classList.remove("open");
}

async function submitComment() {
  if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");

  const user = auth.currentUser;
  if (!user) return showToast("Please sign in first.", "❌");

  const modal = $("#commentModal");
  const postId = modal?.dataset.postId;
  const text = $("#commentInput").value.trim();
  if (!postId || !text) return;

  try {
    const profile = await getProfile(user.uid);
    await db.collection("posts").doc(postId).collection("comments").add({
      text,
      authorId: user.uid,
      authorName: profile?.name || user.displayName || "Anonymous",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("posts").doc(postId).update({
      commentsCount: firebase.firestore.FieldValue.increment(1)
    });

    $("#commentInput").value = "";
  } catch (error) {
    showToast(cleanFirebaseError(error), "❌");
  }
}

async function getProfile(uid) {
  if (!uid || !isFirebaseReady()) return null;
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

function setupProfileEditor() {
  const editProfileBtn = $("#editProfileBtn");
  const profileForm = $("#profileForm");

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      $("#profileEditor")?.classList.toggle("open");
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");
      const user = auth.currentUser;
      if (!user) return showToast("Please sign in first.", "❌");

      const data = {
        name: $("#profileName").value.trim(),
        bio: $("#profileBio").value.trim(),
        website: $("#profileWebsite").value.trim(),
        location: $("#profileLocation").value.trim(),
        platforms: parsePlatformLinks($("#profilePlatforms").value),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        await db.collection("users").doc(user.uid).set(data, { merge: true });
        await user.updateProfile({ displayName: data.name });
        showToast("Profile updated.");
        loadProfilePage();
      } catch (error) {
        showToast(cleanFirebaseError(error), "❌");
      }
    });
  }

  $("#followBtn")?.addEventListener("click", followProfileUser);
}

async function loadProfilePage() {
  const profileRoot = $("#profileRoot");
  if (!profileRoot) return;

  const loadingHTML = `
    <div class="profile-card-main">
      <div class="empty-state">Loading profile…</div>
    </div>
  `;

  if (!isFirebaseReady()) {
    renderProfile({
      uid: "demo",
      name: "GlobalOSP Builder",
      username: "builder",
      bio: "Sharing games, websites, apps, bots, and experiments from every platform.",
      website: "https://github.com/elaborateedu/GlobalOSP",
      location: "Internet",
      platforms: [{ name: "GitHub", url: "https://github.com/elaborateedu/GlobalOSP" }],
      followersCount: 128,
      followingCount: 42,
      postsCount: 3
    }, demoPosts);
    return;
  }

  profileRoot.dataset.loading = "true";

  auth.onAuthStateChanged(async (currentUser) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid") || currentUser?.uid;

      if (!uid) {
        profileRoot.innerHTML = `
          <div class="profile-card-main">
            <div class="empty-state">
              Log in to view and edit your profile.
              <br><br>
              <a class="btn btn-primary" href="login.html">Log in</a>
            </div>
          </div>
        `;
        return;
      }

      const profileSnap = await db.collection("users").doc(uid).get();

      if (!profileSnap.exists) {
        profileRoot.innerHTML = `
          <div class="profile-card-main">
            <div class="empty-state">
              Profile not found. If you just signed in with GitHub, refresh once or create a post so your profile can be created.
            </div>
          </div>
        `;
        return;
      }

      let posts = [];
      try {
        // No orderBy here, so it will not get stuck waiting for a Firestore composite index.
        const postSnap = await db.collection("posts")
          .where("authorId", "==", uid)
          .limit(20)
          .get();

        posts = postSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const ad = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bd = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bd - ad;
          });
      } catch (postError) {
        console.warn("Could not load profile posts:", postError);
        posts = [];
      }

      const profile = { uid, ...profileSnap.data() };
      renderProfile(profile, posts, currentUser);
    } catch (error) {
      console.error("Profile load failed:", error);
      profileRoot.innerHTML = `
        <div class="profile-card-main">
          <div class="empty-state">
            Could not load profile. Check your Firebase rules and console errors.
            <br><br>
            ${escapeHtml(cleanFirebaseError(error))}
          </div>
        </div>
      `;
    }
  });
}

function renderProfile(profile, posts = [], currentUser = null) {
  const setText = (id, value) => {
    const el = $(`#${id}`);
    if (el) el.textContent = value;
  };

  const setValue = (id, value) => {
    const el = $(`#${id}`);
    if (el) el.value = value;
  };

  setText("profileDisplayName", profile.name || "Unnamed Builder");
  setText("profileHandle", `@${profile.username || profile.handle || "builder"}`);
  setText("profileBioText", profile.bio || "No bio yet.");
  setText("profileLocationText", profile.location || "No location");
  setText("followersCount", profile.followersCount || 0);
  setText("followingCount", profile.followingCount || 0);
  setText("postsCount", profile.postsCount || posts.length || 0);

  const websiteLink = $("#profileWebsiteLink");
  if (websiteLink) {
    websiteLink.textContent = profile.website || "No website";
    websiteLink.href = profile.website || "#";
  }

  const avatar = $("#profileAvatar");
  if (avatar) {
    avatar.textContent = getInitials(profile.name || profile.username || "U");
    avatar.style.backgroundImage = profile.photoURL ? `url('${escapeAttr(profile.photoURL)}')` : "";
  }

  const platformWrap = $("#profilePlatformsWrap");
  if (platformWrap) {
    platformWrap.innerHTML = (profile.platforms || []).length
      ? profile.platforms.map((p) => `<a class="tag" href="${escapeAttr(p.url)}" target="_blank" rel="noreferrer">${escapeHtml(p.name)}</a>`).join("")
      : `<span class="tag">No connected platforms</span>`;
  }

  const isOwnProfile = currentUser && currentUser.uid === profile.uid;

  const editBtn = $("#editProfileBtn");
  if (editBtn) editBtn.style.display = isOwnProfile ? "inline-flex" : "none";

  const followBtn = $("#followBtn");
  if (followBtn) {
    followBtn.style.display = !isOwnProfile && currentUser ? "inline-flex" : "none";
    followBtn.dataset.uid = profile.uid || "";
  }

  if (isOwnProfile) {
    setValue("profileName", profile.name || "");
    setValue("profileBio", profile.bio || "");
    setValue("profileWebsite", profile.website || "");
    setValue("profileLocation", profile.location || "");
    setValue("profilePlatforms", (profile.platforms || []).map((p) => `${p.name}|${p.url}`).join("\n"));
  }

  const postsWrap = $("#profilePosts");
  if (!postsWrap) return;

  postsWrap.innerHTML = "";
  if (!posts.length) {
    postsWrap.innerHTML = `<div class="empty-state">No posts yet.</div>`;
    return;
  }

  posts.forEach((post) => postsWrap.appendChild(buildPostCard(post.id || "demo", post)));
}

async function followProfileUser() {
  if (!isFirebaseReady()) return showToast("Firebase is not loaded.", "❌");
  const currentUser = auth.currentUser;
  const targetUid = $("#followBtn").dataset.uid;

  if (!currentUser || !targetUid || currentUser.uid === targetUid) return;

  const followingRef = db.collection("users").doc(currentUser.uid).collection("following").doc(targetUid);
  const followerRef = db.collection("users").doc(targetUid).collection("followers").doc(currentUser.uid);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(followingRef);
      if (snap.exists) {
        tx.delete(followingRef);
        tx.delete(followerRef);
        tx.update(db.collection("users").doc(currentUser.uid), { followingCount: firebase.firestore.FieldValue.increment(-1) });
        tx.update(db.collection("users").doc(targetUid), { followersCount: firebase.firestore.FieldValue.increment(-1) });
      } else {
        tx.set(followingRef, { uid: targetUid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        tx.set(followerRef, { uid: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        tx.update(db.collection("users").doc(currentUser.uid), { followingCount: firebase.firestore.FieldValue.increment(1) });
        tx.update(db.collection("users").doc(targetUid), { followersCount: firebase.firestore.FieldValue.increment(1) });
      }
    });

    showToast("Follow updated.");
    loadProfilePage();
  } catch (error) {
    showToast(cleanFirebaseError(error), "❌");
  }
}

function watchAuthState() {
  if (!isFirebaseReady()) return;

  auth.onAuthStateChanged(async (user) => {
    const navActions = $(".nav-actions");
    if (navActions) {
      if (user) {
        const profile = await getProfile(user.uid);
        const handle = profile?.username || user.email?.split("@")[0] || "profile";
        navActions.innerHTML = `
          <a class="btn btn-ghost" href="profile.html">@${escapeHtml(handle)}</a>
          <button class="btn btn-primary" id="logoutBtn">Log out</button>
        `;
        $("#logoutBtn").addEventListener("click", async () => {
          await auth.signOut();
          window.location.href = "index.html";
        });
      } else {
        navActions.innerHTML = `
          <a href="login.html" class="btn btn-ghost">Log in</a>
          <a href="signup.html" class="btn btn-primary">Sign up</a>
        `;
      }
    }

    const compose = $(".compose-box");
    if (compose) compose.classList.toggle("signed-out", !user);
  });
}

function setLoading(button, text, disabled = true) {
  if (!button) return;
  button.textContent = text;
  button.disabled = disabled;
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

function parsePlatformLinks(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, url] = line.split("|").map((x) => x.trim());
      return { name: name || "Link", url: url || "#" };
    })
    .slice(0, 8);
}

function normalizeUsername(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

function platformTagClass(platform = "") {
  const p = platform.toLowerCase();
  if (p.includes("github")) return "github-tag";
  if (p.includes("replit")) return "replit-tag";
  if (p.includes("roblox")) return "roblox-tag";
  if (p.includes("scratch")) return "scratch-tag";
  return "github-tag";
}

function getInitials(name) {
  return (name || "U")
    .split(/\s+/)
    .map((x) => x[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function timeAgo(date) {
  const diff = Math.max(1, (Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function linkify(text) {
  return text.replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank" rel="noreferrer">$1</a>`);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function cleanFirebaseError(error) {
  const message = error?.message || String(error);
  return message.replace(/^Firebase:\s*/i, "").replace(/\s*\([^)]+\)\.?$/, ".");
}
