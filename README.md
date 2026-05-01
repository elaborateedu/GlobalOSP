# GlobalOSP Clean Replacement v3

Delete your old repo files and upload everything inside this folder.

## Included
- Styled login/signup pages
- Google/GitHub/Roblox icon buttons
- Black Roblox button
- Styled comment boxes and form inputs
- Smaller, cleaner site scale
- Homepage with real GlobalOSP logo
- Header with Explore, Feed, Profile, Settings, Patchwork
- Edit Profile redirects to Settings
- UID-based verified badges
- Username duplicate/reserved-name check
- Follow/unfollow
- Full post page
- Global search
- Patchwork updates

## Verified setup
Open `js/app.js` and replace:

const VERIFIED_UIDS = ["REPLACE_WITH_YOUR_FIREBASE_UID"];

with your Firebase Auth UID.

## Firebase rules
Paste `firestore.rules` into Firebase Firestore Rules and publish.
