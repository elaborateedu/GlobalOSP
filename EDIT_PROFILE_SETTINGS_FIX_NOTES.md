# GlobalOSP Edit Profile + Settings Fix

Upload this file:

js/edit-profile-settings-fix.js

Then add this script tag at the bottom of these pages, AFTER main.js and social-polish.js:

<script src="js/edit-profile-settings-fix.js"></script>

Add it to:
- profile.html
- feed.html
- index.html
- login.html/signup.html optional, only if you want Settings link there

This patch:
- makes the Edit profile button open/close the profile editor
- automatically adds a Settings link to the nav
- automatically adds a Settings link to the feed sidebar
