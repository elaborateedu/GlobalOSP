# GlobalOSP Full Working Site v2

Replace your repo contents with this folder.

Fixed:
- Homepage right icon is the real GlobalOSP logo.
- Header has all pages.
- Edit Profile goes to settings.html.
- Verified badges use Firebase UID, not usernames.
- Usernames are checked against taken/reserved names.
- Follow/unfollow added.
- Post full view added with post.html?id=POST_ID.
- Global search added for pages, posts, and profiles.

Set verified users:
Open js/app.js and replace:
const VERIFIED_UIDS=["REPLACE_WITH_YOUR_FIREBASE_UID"];

Paste firestore.rules into Firebase Rules.
