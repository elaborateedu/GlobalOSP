# GlobalOSP Social Polish + Settings

Upload/add these files:

- css/social-polish.css
- js/social-polish.js
- settings.html

Also update pages:

## For login.html and signup.html
Add this CSS after css/style.css:

```html
<link rel="stylesheet" href="css/social-polish.css" />
```

Change:
```html
<main class="auth-page">
```

to:
```html
<main class="auth-page auth-split">
```

Then paste the `LOGIN_ART_SNIPPET.html` content right before:
```html
</main>
```

## For feed.html and profile.html
Add this CSS:
```html
<link rel="stylesheet" href="css/social-polish.css" />
```

Add this script AFTER `js/main.js`:
```html
<script src="js/social-polish.js"></script>
```

## For navbar
Add a Settings link wherever you want:
```html
<a class="nav-link" href="settings.html">Settings</a>
```

## Verified users
Open `js/social-polish.js`, edit:
```js
window.GLOBALOSP_VERIFIED_USERS = [
  "qapps",
  "elaborateedu",
  "globalosp"
];
```

Use usernames, display names, or handles.
