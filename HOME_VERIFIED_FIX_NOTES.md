# GlobalOSP Home + Verified + Upload UI Fix

Upload/replace:

- index.html
- css/home-upgrade.css
- js/verified.js

Also add this line in the `<head>` of pages that have posts/profile UI if it is not already there:

```html
<link rel="stylesheet" href="css/home-upgrade.css">
```

And add this BEFORE `js/main.js` on pages that render posts/profile names:

```html
<script src="js/verified.js"></script>
```

## Verified users

Open:

```txt
js/verified.js
```

Then edit:

```js
const VERIFIED_USERS = [
  "qapps",
  "elaborateedu",
  "globalosp"
];
```

You can put either:
- username
- display name
- Firebase UID

## Important

To actually show the badge beside names, your `main.js` needs to call:

```js
verifiedBadgeHTML(post)
```

next to post author names, and:

```js
verifiedBadgeHTML(profile, true)
```

next to profile names.

If you want, send your current `js/main.js` and I will patch the exact file instead of giving a general patch.
