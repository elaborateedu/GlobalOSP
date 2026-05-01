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
  apiKey: "AIzaSyDYuqJZ1MC1sKzoODegxy1ecb3ix4ZZp8M",
  authDomain: "globalosp-123.firebaseapp.com",
  projectId: "globalosp-123",
  storageBucket: "globalosp-123.firebasestorage.app",
  messagingSenderId: "861685247215",
  appId: "1:861685247215:web:6c0f40699b8f37ed8dbf1a"
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
