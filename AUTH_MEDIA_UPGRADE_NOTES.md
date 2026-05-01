# Auth + Photo Posting Upgrade Notes

## Files to upload

Replace:
- `feed.html`
- `login.html`
- `signup.html`
- `js/main.js`

Add:
- `css/auth-media.css`
- `storage.rules`

## Firebase console steps

### Google login
1. Firebase Console → Authentication → Sign-in method
2. Enable **Google**
3. Save
4. Authentication → Settings → Authorized domains
5. Add your GitHub Pages domain, such as `elaborateedu.github.io`

Firebase supports Google sign-in directly in the Web SDK.

### Photo posts
1. Firebase Console → Build → Storage
2. Click Get Started
3. Paste the included `storage.rules`
4. Publish

Posts now save:
- `description`
- `imageURL`
- `imagePath`

Images upload to:
`posts/{uid}/{timestamp_filename}`

## Roblox login reality check

Firebase does **not** include Roblox as a built-in auth provider.

Roblox does support OAuth 2.0, but to use it properly with Firebase you need a backend:

1. User clicks "Continue with Roblox"
2. Site redirects to Roblox OAuth
3. Backend receives the OAuth callback
4. Backend verifies the Roblox user
5. Backend uses Firebase Admin SDK to create a Firebase custom token
6. Frontend signs in with `signInWithCustomToken`

You cannot safely do the full Roblox OAuth secret/token exchange inside GitHub Pages because it would expose secrets.

Good backend options:
- Firebase Cloud Functions
- Cloudflare Workers
- Vercel serverless functions
- Render/Express server

## Firestore rules

Your Firestore rules must allow posts with the new fields:
- description
- imageURL
- imagePath

If your current rules only check `text`, loosen/expand the create rule so logged-in users can create posts with these fields.
