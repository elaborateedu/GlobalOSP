# GlobalOSP — Global Open Source Projects

A social platform for developers and creators to share projects from any platform: GitHub, Replit, Roblox Studio, Scratch, GitLab, websites, or any URL.

## What changed in this upgrade

- Real `profile.html`
- Editable logged-in profile
- Public profile pages using `profile.html?uid=USER_ID`
- Social feed with Firestore posts
- Project title, URL, platform, and tags
- Stars
- Reposts
- Comments
- Follow/unfollow system
- GitHub OAuth support
- Email/password auth
- Demo mode if Firebase is not loaded
- Updated Firestore security rules

## Files

```txt
index.html
feed.html
login.html
signup.html
profile.html
css/style.css
js/main.js
js/firebase-config.js
assets/logo-icon.svg
firestore.rules
```

## Firebase setup

1. Enable Authentication.
2. Enable Email/Password.
3. Enable GitHub provider.
4. Add your GitHub Pages domain to Firebase Authentication → Settings → Authorized domains.
5. Paste `firestore.rules` into Firestore → Rules.
6. Publish the rules.

## Firestore indexes you may be asked to create

Firebase may ask for indexes when using:

- `posts` ordered by `createdAt`
- `posts` filtered by `authorId` and ordered by `createdAt`

If the console gives you a link, click it and create the index.

## GitHub Pages

Upload these files to the root of your repo, then use GitHub Pages from the main branch.
