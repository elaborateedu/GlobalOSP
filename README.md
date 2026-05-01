# GlobalOSP — Global Open Source Projects

A social platform for developers to share projects from **any** platform — GitHub, Replit, Roblox Studio, Scratch, GitLab, or any URL.

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/globalosp.git
cd globalosp
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (`globalosp` or similar)
3. Add a **Web App** (`</>` icon on the project homepage)
4. Copy the config snippet
5. Open `js/firebase-config.js` and paste your config values

#### Enable Firebase services:
- **Authentication** → Sign-in method → Enable **Email/Password** and **GitHub**
  - For GitHub: create an OAuth App at github.com/settings/developers
- **Firestore Database** → Create database (start in production mode)
  - Paste the security rules from the bottom of `js/firebase-config.js`

### 3. Uncomment Firebase scripts

In `index.html`, `feed.html`, `login.html`, `signup.html` — uncomment the Firebase `<script>` tags at the bottom and also uncomment the `<script src="js/firebase-config.js">` line.

### 4. Deploy to GitHub Pages

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Then go to **Settings → Pages → Source → main branch → / (root)** and save.

Your site will be live at: `https://YOUR_USERNAME.github.io/globalosp/`

---

## 📁 File Structure

```
globalosp/
├── index.html          # Landing page
├── feed.html           # Main social feed
├── login.html          # Sign in
├── signup.html         # Create account
├── profile.html        # (coming soon)
├── css/
│   └── style.css       # All styles
├── js/
│   ├── main.js         # App logic + Firebase integration
│   └── firebase-config.js  # Your Firebase config (fill this in!)
└── assets/
    └── logo-icon.svg   # GlobalOSP logo
```

## 🎨 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript — zero dependencies, GitHub Pages ready
- **Backend**: Firebase (Auth + Firestore)
- **Fonts**: Syne (display) + Instrument Sans (body) + DM Mono
- **Hosting**: GitHub Pages

## ✨ Features

- Platform-agnostic project sharing (GitHub, Replit, Roblox, Scratch, etc.)
- X-style social feed with real-time posts
- GitHub OAuth + email/password auth
- Stars, reposts, comments
- Platform tags and hashtags
- Responsive mobile layout

## 🛣️ Roadmap

- [ ] Profile pages
- [ ] Real-time comments
- [ ] Notifications
- [ ] Search and explore
- [ ] Project collections / bookmarks
- [ ] Follow system

---

Built with ❤️ by developers, for developers.
