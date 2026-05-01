/* GlobalOSP verified system patch
   Add usernames or Firebase UIDs below.
   Examples:
   const VERIFIED_USERS = ["qapps", "yourFirebaseUID"];
*/

const VERIFIED_USERS = [
  "qapps",
  "elaborateedu",
  "globalosp"
];

function isVerifiedUser(postOrProfile = {}) {
  const values = [
    postOrProfile.uid,
    postOrProfile.authorId,
    postOrProfile.username,
    postOrProfile.handle,
    postOrProfile.authorHandle,
    postOrProfile.name,
    postOrProfile.authorName
  ].filter(Boolean).map((x) => String(x).toLowerCase());

  return values.some((value) => VERIFIED_USERS.map((x) => String(x).toLowerCase()).includes(value));
}

function verifiedBadgeHTML(item, large = false) {
  return isVerifiedUser(item)
    ? `<span class="verified-badge ${large ? "large" : ""}" title="Verified GlobalOSP creator">✓</span>`
    : "";
}
