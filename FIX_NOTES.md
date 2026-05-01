# GlobalOSP CSS/Profile Fix

This patch keeps the same site/code, but fixes:

- profile.html staying on "Loading..." forever
- profile page being pushed too far left
- unstyled profile inputs/dropdowns/textareas
- Firestore profile posts query requiring an index immediately
- profile page crashing when one element is missing

## What to upload

Replace these files in your repo:

- css/style.css
- js/main.js

You can also upload the full ZIP if that is easier.

## Firestore note

The profile page now avoids the immediate composite index issue by not using:
where("authorId", "==", uid).orderBy("createdAt")

Later, for best performance, you can add that index and switch it back.
