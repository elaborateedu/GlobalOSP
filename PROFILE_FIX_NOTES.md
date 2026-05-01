# GlobalOSP Locked Profile Fix

Replace/add these files:

- profile.html
- css/profile.css
- js/profile.js

Do not delete your existing files.

## Why the screenshot looked broken

Your profile content was rendering like raw/default HTML:
- page content was not inside a centered profile shell
- the comments modal was visible because it had no profile-specific hidden styling
- the edit form inputs were not being targeted by the existing CSS
- the profile loader could get stuck if the user document did not exist yet

This patch:
- makes profile.html a complete page
- keeps your existing css/style.css
- adds css/profile.css after it
- adds js/profile.js only for profile behavior
- auto-creates a missing user profile for the logged-in user

## Firestore rules

No new rule is required if your rules already allow logged-in users to read/write their own users/{uid} doc and read posts.

For best results, users should have:
- read: public
- create/update: only owner

Posts should have:
- read: public
- create: logged in
