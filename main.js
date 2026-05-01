// ═══════════════════════════════════════════
//  GlobalOSP — main.js
// ═══════════════════════════════════════════

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach(el => observer.observe(el));
}

// ── Feed tab switching ──
const feedTabs = document.querySelectorAll('.feed-tab');
feedTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    feedTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // In a real app, load the appropriate feed here
    const feedPosts = document.getElementById('feedPosts');
    if (feedPosts) {
      feedPosts.style.opacity = '0';
      setTimeout(() => { feedPosts.style.opacity = '1'; }, 200);
    }
  });
});

// ── Post action buttons (star / repost) ──
document.querySelectorAll('.pa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const num = parseInt(match[1]);
    const isActive = btn.dataset.active === 'true';

    if (isActive) {
      btn.dataset.active = 'false';
      btn.style.color = '';
      btn.textContent = text.replace(num, num - 1);
    } else {
      btn.dataset.active = 'true';
      btn.style.color = 'var(--accent)';
      btn.textContent = text.replace(num, num + 1);

      // Micro-animation
      btn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ], { duration: 250, easing: 'ease-out' });
    }
  });
});

// ── Compose box auto-resize ──
const composeInputs = document.querySelectorAll('.compose-input');
composeInputs.forEach(input => {
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  });
});

// ── Toast notification helper ──
function showToast(message, emoji = '✅') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${emoji}</span> ${message} <span class="toast-close">✕</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  const close = toast.querySelector('.toast-close');
  close.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Auth form handling ──
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('[type="submit"]');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      showToast('Welcome back!', '👋');
      setTimeout(() => { window.location.href = 'feed.html'; }, 1000);
    } catch (err) {
      showToast(err.message, '❌');
      btn.textContent = 'Sign in';
      btn.disabled = false;
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = signupForm.querySelector('[type="submit"]');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });

      // Save profile to Firestore
      await firebase.firestore().collection('users').doc(cred.user.uid).set({
        name,
        username,
        email,
        bio: '',
        platforms: [],
        followers: 0,
        following: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast('Account created! Welcome to GlobalOSP 🎉', '🚀');
      setTimeout(() => { window.location.href = 'feed.html'; }, 1200);
    } catch (err) {
      showToast(err.message, '❌');
      btn.textContent = 'Create account';
      btn.disabled = false;
    }
  });
}

// ── GitHub OAuth ──
document.querySelectorAll('.btn-github').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const provider = new firebase.auth.GithubAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      showToast('Signed in with GitHub!', '🐙');
      setTimeout(() => { window.location.href = 'feed.html'; }, 1000);
    } catch (err) {
      showToast(err.message, '❌');
    }
  });
});

// ── Post submission (feed.html) ──
const postBtn = document.getElementById('postBtn');
const postInput = document.getElementById('postInput');
const postPlatform = document.getElementById('postPlatform');
if (postBtn && postInput) {
  postBtn.addEventListener('click', async () => {
    const text = postInput.value.trim();
    const platform = postPlatform?.value || 'Other';
    if (!text) return;

    postBtn.textContent = 'Sharing…';
    postBtn.disabled = true;

    try {
      const user = firebase.auth().currentUser;
      if (!user) { showToast('Please sign in first', '🔒'); return; }

      await firebase.firestore().collection('posts').add({
        text,
        platform,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorHandle: user.email?.split('@')[0] || 'user',
        stars: 0,
        reposts: 0,
        comments: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      postInput.value = '';
      postInput.style.height = 'auto';
      showToast('Project shared!', '🚀');
      loadFeed(); // refresh
    } catch (err) {
      showToast(err.message, '❌');
    }

    postBtn.textContent = 'Share';
    postBtn.disabled = false;
  });
}

// ── Load feed from Firestore ──
async function loadFeed() {
  const feedPosts = document.getElementById('feedPosts');
  if (!feedPosts) return;

  feedPosts.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-400)">Loading posts…</div>';

  try {
    const snapshot = await firebase.firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      feedPosts.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--gray-400)">No posts yet. Be the first to share a project! 🚀</div>';
      return;
    }

    feedPosts.innerHTML = '';
    snapshot.forEach(doc => {
      const p = doc.data();
      const card = buildPostCard(doc.id, p);
      feedPosts.appendChild(card);
    });
  } catch (err) {
    feedPosts.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--gray-400)">Could not load posts. Make sure Firebase is configured.</div>`;
    console.warn('Firestore load error:', err);
  }
}

function buildPostCard(id, p) {
  const initials = (p.authorName || 'U').substring(0, 2).toUpperCase();
  const colors = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const tagClass = platformTagClass(p.platform);
  const time = p.createdAt ? timeAgo(p.createdAt.toDate()) : 'now';

  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.id = id;
  card.innerHTML = `
    <div class="post-avatar" style="background:${color}">${initials}</div>
    <div class="post-body">
      <div class="post-meta">
        <strong>${escHtml(p.authorName)}</strong>
        <span class="post-handle">@${escHtml(p.authorHandle)}</span>
        <span class="post-time">· ${time}</span>
      </div>
      <div class="post-platform-tag ${tagClass}">${escHtml(p.platform)}</div>
      <p class="post-text">${escHtml(p.text)}</p>
      ${p.link ? `<div class="post-link-preview"><span class="plp-icon">🔗</span><div><div class="plp-title">${escHtml(p.linkTitle || 'Project Link')}</div><div class="plp-url">${escHtml(p.link)}</div></div></div>` : ''}
      ${p.tags?.length ? `<div class="post-tags">${p.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="post-actions">
        <button class="pa-btn">💬 ${p.comments || 0}</button>
        <button class="pa-btn">🔁 ${p.reposts || 0}</button>
        <button class="pa-btn">⭐ ${p.stars || 0}</button>
      </div>
    </div>
  `;

  // Reattach pa-btn listeners
  card.querySelectorAll('.pa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      const match = text.match(/(\d+)/);
      if (!match) return;
      const num = parseInt(match[1]);
      const isActive = btn.dataset.active === 'true';
      btn.dataset.active = isActive ? 'false' : 'true';
      btn.style.color = isActive ? '' : 'var(--accent)';
      btn.textContent = text.replace(num, isActive ? num - 1 : num + 1);
      btn.animate([{transform:'scale(1)'},{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:250,easing:'ease-out'});
    });
  });

  return card;
}

function platformTagClass(platform) {
  if (!platform) return 'github-tag';
  const p = platform.toLowerCase();
  if (p.includes('github')) return 'github-tag';
  if (p.includes('replit')) return 'replit-tag';
  if (p.includes('roblox')) return 'roblox-tag';
  return 'github-tag';
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  return Math.floor(diff / 86400) + 'd';
}

// ── Auth state observer ──
if (typeof firebase !== 'undefined') {
  firebase.auth().onAuthStateChanged(user => {
    const feedPage = document.getElementById('feedPosts');
    if (feedPage) loadFeed();

    // Update nav if user is signed in
    const navActions = document.querySelector('.nav-actions');
    if (navActions && user) {
      navActions.innerHTML = `
        <a href="profile.html" class="btn btn-ghost">@${user.email?.split('@')[0]}</a>
        <button class="btn btn-primary" id="logoutBtn">Log out</button>
      `;
      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await firebase.auth().signOut();
        window.location.href = 'index.html';
      });
    }
  });
}

// Initial feed load (for feed page without auth observer)
if (document.getElementById('feedPosts') && typeof firebase === 'undefined') {
  // Demo mode — show static cards already in HTML
  console.log('Firebase not configured — showing demo posts');
}
