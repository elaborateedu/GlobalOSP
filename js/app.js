
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

const VERIFIED_UIDS = ["REPLACE_WITH_YOUR_FIREBASE_UID"];
const RESERVED = ["elaborateedu", "globalosp", "admin", "support", "official", "verified", "qapps"];
const PAGES = [
  ["Home", "index.html", "Landing page"],
  ["Feed", "feed.html", "Project posts"],
  ["Profile", "profile.html", "Creator profile"],
  ["Settings", "settings.html", "Account settings"],
  ["Patchwork", "patchwork.html", "Updates"],
  ["Post", "post.html", "Post viewer"]
];

const DEMO = [
  {
    id: "demo1",
    authorId: "demo",
    authorName: "qapps",
    authorHandle: "qapps",
    platform: "GitHub",
    text: "Welcome to GlobalOSP v3.",
    description: "This is the clean replacement build with polished auth pages, styled inputs, search, follows, and full post view.",
    projectTitle: "GlobalOSP",
    projectUrl: "https://github.com/elaborateedu/GlobalOSP",
    tags: ["globalosp", "update"],
    commentsCount: 2,
    repostsCount: 1,
    starsCount: 8
  }
];

const PATCHES = [
  {
    title: "Clean Replacement v3",
    date: "Current",
    tags: ["full replacement", "ui polish", "auth", "forms"],
    changes: [
      "Rebuilt the whole site cleanly as one replacement ZIP.",
      "Styled comments, forms, settings inputs, and modal inputs.",
      "Fixed auth footer links: Create account and Log in are blue and correct.",
      "Added Google, GitHub, and Roblox icons to auth buttons.",
      "Made Roblox auth button black.",
      "Reduced the overall site scale so it no longer feels oversized."
    ]
  },
  {
    title: "Full Working Site v2",
    date: "Previous",
    tags: ["search", "follow", "post view", "verified", "settings"],
    changes: [
      "Homepage graphic uses the actual GlobalOSP logo.",
      "Header includes Explore, Feed, Profile, Settings, and Patchwork.",
      "Edit profile sends users to Settings.",
      "Verified badges are Firebase UID-based, not username-based.",
      "Added follow/unfollow, full post view, and global search."
    ]
  }
];

function ready() {
  return typeof firebase !== "undefined" && firebase.apps && firebase.apps.length;
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

function isVerified(item = {}) {
  return VERIFIED_UIDS.includes(item.uid) || VERIFIED_UIDS.includes(item.authorId);
}

function badge(item = {}, big = false) {
  return isVerified(item) ? ` <span class="verified ${big ? "big" : ""}">✓</span>` : "";
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupAuthState();
  setupAuthForms();
  setupCompose();
  setupComments();
  loadFeed();
  loadPostDetail();
  loadProfile();
  setupSettings();
  loadPatchwork();
  setupSearch();
});

function setupNav() {
  $("#hamb")?.addEventListener("click", () => $("#mobile")?.classList.toggle("open"));
}

async function getUser(uid) {
  if (!ready() || !uid) return null;
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? { uid, ...snap.data() } : null;
}

async function ensureUser(user, username) {
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return;

  username = norm(username || user.displayName || user.email?.split("@")[0] || "builder") || `user${Date.now()}`;

  await ref.set({
    name: user.displayName || username,
    username,
    handle: username,
    email: user.email || "",
    bio: "",
    location: "",
    website: "",
    photoURL: user.photoURL || "",
    platforms: [],
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

function setupAuthState() {
  if (!ready()) return;

  auth.onAuthStateChanged(async (user) => {
    const nav = $("#navActions");
    if (!nav) return;

    if (!user) {
      nav.innerHTML = `<a href="login.html" class="btn btn-ghost">Log in</a><a href="signup.html" class="btn btn-primary">Sign up</a>`;
      return;
    }

    const profile = await getUser(user.uid);
    nav.innerHTML = `
      <a href="profile.html" class="btn btn-ghost">@${esc(profile?.username || user.email?.split("@")[0] || "me")}${badge({ uid: user.uid })}</a>
      <button class="btn btn-primary" id="logout">Log out</button>
    `;

    $("#logout").onclick = async () => {
      await auth.signOut();
      location.href = "index.html";
    };
  });
}

function setupAuthForms() {
  $("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await auth.signInWithEmailAndPassword($("#email").value.trim(), $("#password").value);
      location.href = "feed.html";
    } catch (error) {
      alert(error.message);
    }
  });

  $("#signupForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = norm($("#username").value);

    if (RESERVED.includes(username)) return alert("That username is reserved.");

    try {
      const cred = await auth.createUserWithEmailAndPassword($("#email").value.trim(), $("#password").value);
      await cred.user.updateProfile({ displayName: $("#name").value.trim() || username });
      await ensureUser(cred.user, username);
      location.href = "feed.html";
    } catch (error) {
      alert(error.message);
    }
  });

  $$(".btn-google").forEach((button) => {
    button.onclick = async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await auth.signInWithPopup(provider);
        await ensureUser(result.user);
        location.href = "feed.html";
      } catch (error) {
        alert(error.message);
      }
    };
  });

  $$(".btn-github").forEach((button) => {
    button.onclick = async () => {
      try {
        const provider = new firebase.auth.GithubAuthProvider();
        const result = await auth.signInWithPopup(provider);
        await ensureUser(result.user, result.additionalUserInfo?.username);
        location.href = "feed.html";
      } catch (error) {
        alert(error.message);
      }
    };
  });

  $$(".btn-roblox").forEach((button) => {
    button.onclick = () => alert("Roblox login needs a backend/custom token flow.");
  });
}

function setupCompose() {
  const input = $("#postInput");
  input?.addEventListener("input", () => {
    $("#count").textContent = `${input.value.length}/500`;
  });

  $("#postBtn")?.addEventListener("click", async () => {
    if (!ready()) return alert("Firebase not loaded.");

    const user = auth.currentUser;
    if (!user) return location.href = "login.html";

    const text = $("#postInput").value.trim();
    const description = $("#desc").value.trim();
    const platform = $("#platform").value;
    const title = $("#title").value.trim();
    const url = $("#url").value.trim();
    const image = $("#image").value.trim();
    const tags = $("#tags").value.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8);

    if (!text && !url && !image) return alert("Write something or add a link/image.");

    if (image && !/^https?:\/\/.+\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(image)) {
      return alert("Image must be a direct image URL.");
    }

    const profile = await getUser(user.uid);

    await db.collection("posts").add({
      text,
      description,
      platform,
      projectTitle: title,
      projectUrl: url,
      imageURL: image,
      tags,
      authorId: user.uid,
      authorName: profile?.name || user.displayName || "Anonymous",
      authorHandle: profile?.username || "user",
      authorPhoto: profile?.photoURL || "",
      commentsCount: 0,
      repostsCount: 0,
      starsCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("users").doc(user.uid).set({
      postsCount: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });

    ["postInput", "desc", "title", "url", "image", "tags"].forEach((id) => $("#" + id).value = "");
    $("#count").textContent = "0/500";
  });
}

function buildPostCard(id, post) {
  const article = document.createElement("article");
  article.className = "post";

  const profileURL = post.authorId !== "demo" ? `profile.html?uid=${post.authorId}` : "profile.html";
  const detailURL = id && !String(id).startsWith("demo") ? `post.html?id=${id}` : "#";
  const initials = (post.authorName || "U").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  article.innerHTML = `
    <a class="post-avatar" href="${profileURL}" style="${post.authorPhoto ? `background-image:url('${esc(post.authorPhoto)}')` : ""}">${post.authorPhoto ? "" : initials}</a>
    <div style="flex:1;min-width:0;">
      <div>
        <a class="post-name" href="${profileURL}">${esc(post.authorName || "Anonymous")}${badge({ authorId: post.authorId })}</a>
        <span class="muted">@${esc(post.authorHandle || "user")}</span>
      </div>

      <a href="${detailURL}">
        <span class="platform">${esc(post.platform || "Other")}</span>
        ${post.text ? `<p>${esc(post.text)}</p>` : ""}
        ${post.description ? `<p class="muted">${esc(post.description)}</p>` : ""}
        ${post.imageURL ? `<img class="post-img" src="${esc(post.imageURL)}" alt="Post image">` : ""}
      </a>

      ${post.projectUrl || post.projectTitle ? `
        <a class="preview" target="_blank" rel="noreferrer" href="${esc(post.projectUrl || "#")}">
          <b>${esc(post.projectTitle || "Project link")}</b><br>
          <span class="muted">${esc(post.projectUrl || "")}</span>
        </a>` : ""}

      <div>${(post.tags || []).map((tag) => `<span class="tag">#${esc(tag)}</span>`).join("")}</div>

      <div class="actions-row">
        <button data-action="comment">💬 ${post.commentsCount || 0}</button>
        <button data-action="repost">↻ ${post.repostsCount || 0}</button>
        <button data-action="star">⭐ ${post.starsCount || 0}</button>
      </div>
    </div>
  `;

  $$("[data-action]", article).forEach((button) => {
    button.onclick = () => handlePostAction(id, button.dataset.action, post);
  });

  return article;
}

function loadFeed() {
  const root = $("#feed");
  if (!root) return;

  if (!ready()) {
    DEMO.forEach((post) => root.appendChild(buildPostCard(post.id, post)));
    return;
  }

  db.collection("posts").orderBy("createdAt", "desc").limit(50).onSnapshot((snapshot) => {
    root.innerHTML = "";

    if (snapshot.empty) {
      root.innerHTML = `<div class="empty">No posts yet.</div>`;
      return;
    }

    snapshot.forEach((doc) => root.appendChild(buildPostCard(doc.id, { id: doc.id, ...doc.data() })));
  });
}

async function handlePostAction(id, type, post) {
  if (type === "comment") return openComments(id, post);

  if (!ready() || String(id).startsWith("demo")) return alert("Sign in to use this.");

  const user = auth.currentUser;
  if (!user) return location.href = "login.html";

  const collection = type === "star" ? "stars" : "reposts";
  const field = type === "star" ? "starsCount" : "repostsCount";
  const actionRef = db.collection("posts").doc(id).collection(collection).doc(user.uid);
  const postRef = db.collection("posts").doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(actionRef);

    if (snap.exists) {
      tx.delete(actionRef);
      tx.update(postRef, { [field]: firebase.firestore.FieldValue.increment(-1) });
    } else {
      tx.set(actionRef, { userId: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      tx.update(postRef, { [field]: firebase.firestore.FieldValue.increment(1) });
    }
  });
}

function setupComments() {
  $$(".close").forEach((button) => button.onclick = () => $("#modal")?.classList.remove("open"));
  $("#sendComment")?.addEventListener("click", sendComment);
}

function openComments(id, post) {
  const modal = $("#modal");
  if (!modal) return;

  modal.dataset.id = id;
  $("#commentPreview").textContent = post.text || post.description || "Post";
  $("#commentInput").value = "";
  $("#comments").innerHTML = `<div class="empty">Loading...</div>`;
  modal.classList.add("open");

  if (!ready() || String(id).startsWith("demo")) {
    $("#comments").innerHTML = `<div class="empty">Demo comments.</div>`;
    return;
  }

  db.collection("posts").doc(id).collection("comments").orderBy("createdAt", "asc").onSnapshot((snapshot) => {
    const comments = $("#comments");
    comments.innerHTML = "";

    if (snapshot.empty) {
      comments.innerHTML = `<div class="empty">No comments.</div>`;
      return;
    }

    snapshot.forEach((doc) => {
      const comment = doc.data();
      comments.innerHTML += `<div class="comment-item"><b>${esc(comment.authorName || "Anonymous")}</b><p>${esc(comment.text || "")}</p></div>`;
    });
  });
}

async function sendComment() {
  const user = auth.currentUser;
  if (!user) return location.href = "login.html";

  const id = $("#modal").dataset.id;
  const text = $("#commentInput").value.trim();
  if (!text) return;

  const profile = await getUser(user.uid);

  await db.collection("posts").doc(id).collection("comments").add({
    text,
    authorId: user.uid,
    authorName: profile?.name || user.displayName || "Anonymous",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await db.collection("posts").doc(id).update({
    commentsCount: firebase.firestore.FieldValue.increment(1)
  });

  $("#commentInput").value = "";
}

function loadPostDetail() {
  const root = $("#postDetail");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    root.innerHTML = `<div class="empty">No post selected.</div>`;
    return;
  }

  if (!ready()) {
    root.innerHTML = `<div class="empty">Firebase required.</div>`;
    return;
  }

  db.collection("posts").doc(id).onSnapshot((doc) => {
    root.innerHTML = "";

    if (!doc.exists) {
      root.innerHTML = `<div class="empty">Post not found.</div>`;
      return;
    }

    root.appendChild(buildPostCard(doc.id, { id: doc.id, ...doc.data() }));
  });
}

function loadProfile() {
  const root = $("#profileRoot");
  if (!root) return;

  $("#editProfileBtn")?.addEventListener("click", () => location.href = "settings.html");
  $("#followBtn")?.addEventListener("click", followUser);

  if (!ready()) return;

  auth.onAuthStateChanged(async (user) => {
    let uid = new URLSearchParams(location.search).get("uid") || user?.uid;

    if (!uid) {
      root.innerHTML = `<div class="empty">Log in to view your profile.</div>`;
      return;
    }

    let profile = await getUser(uid);

    if (!profile && user && uid === user.uid) {
      await ensureUser(user);
      profile = await getUser(uid);
    }

    if (!profile) {
      root.innerHTML = `<div class="empty">Profile not found.</div>`;
      return;
    }

    renderProfile(profile, user);

    let posts = [];
    try {
      const snapshot = await db.collection("posts").where("authorId", "==", uid).limit(20).get();
      posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {}

    const postRoot = $("#profilePosts");
    postRoot.innerHTML = posts.length ? "" : `<div class="empty">No posts yet.</div>`;
    posts.forEach((post) => postRoot.appendChild(buildPostCard(post.id, post)));
  });
}

function renderProfile(profile, user) {
  $("#pname").innerHTML = `${esc(profile.name || "Unnamed")}${badge({ uid: profile.uid }, true)}`;
  $("#phandle").textContent = "@" + (profile.username || "user");
  $("#pbio").textContent = profile.bio || "No bio yet.";
  $("#ploc").textContent = profile.location ? "📍 " + profile.location : "📍 No location";
  $("#pweb").textContent = profile.website || "No website";
  $("#pweb").href = profile.website || "#";
  $("#followers").textContent = profile.followersCount || 0;
  $("#following").textContent = profile.followingCount || 0;
  $("#postsCount").textContent = profile.postsCount || 0;

  const avatar = $("#pavatar");
  avatar.textContent = (profile.name || "U").split(" ").map((x) => x[0]).join("").slice(0, 2);
  avatar.style.backgroundImage = profile.photoURL ? `url('${esc(profile.photoURL)}')` : "";

  $("#platforms").innerHTML = (profile.platforms || []).length
    ? profile.platforms.map((item) => `<a class="tag" target="_blank" rel="noreferrer" href="${esc(item.url)}">${esc(item.name)}</a>`).join("")
    : `<span class="tag">No platforms</span>`;

  const own = user && user.uid === profile.uid;
  $("#editProfileBtn").style.display = own ? "inline-flex" : "none";
  $("#followBtn").style.display = (!own && user) ? "inline-flex" : "none";
  $("#followBtn").dataset.uid = profile.uid;
}

async function followUser() {
  const user = auth.currentUser;
  const target = $("#followBtn").dataset.uid;

  if (!user) return location.href = "login.html";

  const followingRef = db.collection("users").doc(user.uid).collection("following").doc(target);
  const followerRef = db.collection("users").doc(target).collection("followers").doc(user.uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(followingRef);

    if (snap.exists) {
      tx.delete(followingRef);
      tx.delete(followerRef);
      tx.update(db.collection("users").doc(user.uid), { followingCount: firebase.firestore.FieldValue.increment(-1) });
      tx.update(db.collection("users").doc(target), { followersCount: firebase.firestore.FieldValue.increment(-1) });
    } else {
      tx.set(followingRef, { uid: target });
      tx.set(followerRef, { uid: user.uid });
      tx.update(db.collection("users").doc(user.uid), { followingCount: firebase.firestore.FieldValue.increment(1) });
      tx.update(db.collection("users").doc(target), { followersCount: firebase.firestore.FieldValue.increment(1) });
    }
  });

  location.reload();
}

function setupSettings() {
  const root = $("[data-settings]");
  if (!root) return;

  $$("[data-tab]").forEach((button) => {
    button.onclick = () => {
      $$("[data-tab]").forEach((item) => item.classList.remove("active"));
      $$("[data-panel]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $(`[data-panel="${button.dataset.tab}"]`).classList.add("active");
    };
  });

  if (!ready()) return;

  auth.onAuthStateChanged(async (user) => {
    if (!user) return location.href = "login.html";

    const profile = await getUser(user.uid) || {};
    setValue("sname", profile.name || user.displayName || "");
    setValue("suser", profile.username || "");
    setValue("sbio", profile.bio || "");
    setValue("sloc", profile.location || "");
    setValue("sweb", profile.website || "");
    setValue("sphoto", profile.photoURL || "");
    setValue("splat", (profile.platforms || []).map((item) => `${item.name}|${item.url}`).join("\n"));
    setValue("semail", user.email || "");

    $("#suser").oninput = async () => {
      const result = await usernameOK(norm($("#suser").value), user.uid);
      $("#ustatus").textContent = result.msg;
      $("#ustatus").className = "username-status " + (result.ok ? "good" : "bad");
    };

    $("#settingsForm").onsubmit = async (event) => {
      event.preventDefault();

      const username = norm(getValue("suser"));
      const check = await usernameOK(username, user.uid);

      if (!check.ok) return alert(check.msg);

      const data = {
        name: getValue("sname"),
        username,
        handle: username,
        bio: getValue("sbio"),
        location: getValue("sloc"),
        website: getValue("sweb"),
        photoURL: getValue("sphoto"),
        platforms: parsePlatforms(getValue("splat")),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("users").doc(user.uid).set(data, { merge: true });
      await user.updateProfile({ displayName: data.name, photoURL: data.photoURL });
      alert("Saved.");
    };
  });
}

async function usernameOK(username, uid) {
  if (!username) return { ok: false, msg: "Username required." };
  if (RESERVED.includes(username)) return { ok: false, msg: "That username is reserved." };

  const snapshot = await db.collection("users").where("username", "==", username).limit(1).get();
  if (snapshot.empty) return { ok: true, msg: "Username available." };

  return snapshot.docs[0].id === uid
    ? { ok: true, msg: "This is your username." }
    : { ok: false, msg: "Username already taken." };
}

function parsePlatforms(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, url] = line.split("|").map((part) => part.trim());
    return { name: name || "Link", url: url || "#" };
  });
}

function setValue(id, value) {
  const element = $("#" + id);
  if (element) element.value = value;
}

function getValue(id) {
  return $("#" + id)?.value.trim() || "";
}

function loadPatchwork() {
  const root = $("#patches");
  if (!root) return;

  root.innerHTML = PATCHES.map((patch) => `
    <article class="patch">
      <h2>${esc(patch.title)}</h2>
      <p class="muted">${esc(patch.date)}</p>
      <p>${patch.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</p>
      <ul>${patch.changes.map((change) => `<li>${esc(change)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function setupSearch() {
  const input = $("#globalSearch");
  const results = $("#searchResults");
  if (!input || !results) return;

  input.oninput = async () => {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      results.classList.remove("open");
      return;
    }

    const items = [];
    PAGES.filter((page) => page.join(" ").toLowerCase().includes(query)).forEach((page) => {
      items.push({ title: page[0], url: page[1], desc: "Page · " + page[2] });
    });

    if (ready()) {
      try {
        const posts = await db.collection("posts").limit(25).get();
        posts.forEach((doc) => {
          const post = doc.data();
          const haystack = [post.text, post.description, post.projectTitle, post.authorName, post.authorHandle, post.platform, (post.tags || []).join(" ")].join(" ").toLowerCase();

          if (haystack.includes(query)) {
            items.push({
              title: post.projectTitle || post.text?.slice(0, 40) || "Post",
              url: `post.html?id=${doc.id}`,
              desc: `Post · @${post.authorHandle || "user"}`
            });
          }
        });

        const users = await db.collection("users").limit(30).get();
        users.forEach((doc) => {
          const user = doc.data();
          const haystack = [user.name, user.username, user.bio].join(" ").toLowerCase();

          if (haystack.includes(query)) {
            items.push({
              title: user.name || user.username,
              url: `profile.html?uid=${doc.id}`,
              desc: `Profile · @${user.username || "user"}`
            });
          }
        });
      } catch (error) {}
    }

    results.innerHTML = items.length
      ? items.slice(0, 10).map((item) => `<a class="search-item" href="${esc(item.url)}"><strong>${esc(item.title)}</strong><span>${esc(item.desc)}</span></a>`).join("")
      : `<div class="search-item"><strong>No results</strong><span>Try another search.</span></div>`;

    results.classList.add("open");
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-search")) results.classList.remove("open");
  });
}
