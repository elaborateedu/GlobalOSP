// ═══════════════════════════════════════════
//  GlobalOSP — firebase-config.js
//
//  1. Go to https://console.firebase.google.com
//  2. Create a project named "globalosp"
//  3. Add a Web App (</> icon)
//  4. Copy your config object below
//  5. In Firebase Console:
//     - Enable Authentication → Email/Password + GitHub
//     - Enable Firestore Database
//     - Set Firestore rules (see bottom of this file)
// ═══════════════════════════════════════════

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// ═══════════════════════════════════════════
//  Recommended Firestore Security Rules
//  (paste into Firebase Console → Firestore → Rules)
// ═══════════════════════════════════════════
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: anyone can read, only owner can write
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Posts: anyone can read, signed-in users can create
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
*/
