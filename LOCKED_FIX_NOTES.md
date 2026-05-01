# LOCKED GlobalOSP Fix

Upload/add these files:

```txt
css/globalosp-fix.css
js/globalosp-fix.js
js/patchwork.js
patchwork.html
```

Then add these two lines to the bottom of EVERY page, after `js/main.js` and after `js/social-polish.js` if you use it:

```html
<link rel="stylesheet" href="css/globalosp-fix.css">
<script src="js/globalosp-fix.js"></script>
```

For HTML, the CSS line goes in `<head>`, and the script goes at the bottom before `</body>`.

Add this to pages:
- index.html
- feed.html
- profile.html
- settings.html
- login.html
- signup.html

## Verified users

Open:

```txt
js/globalosp-fix.js
```

Edit this list:

```js
window.GLOBALOSP_VERIFIED_USERS = window.GLOBALOSP_VERIFIED_USERS || [
  "qapps",
  "elaborateedu",
  "globalosp"
];

window.GLOBALOSP_VERIFIED_USERS.push(
  "jonny"
);
```

Put your exact GlobalOSP username/handle in there.

## Patchwork

To add a future update, open:

```txt
js/patchwork.js
```

Add a new object at the top of `PATCHWORK_UPDATES`.

## Why your last fix did not work

The previous fix depended on the existing page structure being exactly right. This one is more aggressive:
- it uses a MutationObserver for verified badges
- it re-adds nav links if your auth code rewrites the nav
- it directly toggles the profile form
- it includes a real Patchwork page
