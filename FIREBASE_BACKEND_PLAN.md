# GlobalOSP Firebase Backend Plan

## 1. Firebase setup
Create a Firebase project, add a Web App, copy the config, then enable:
- Authentication: Email/Password first, Google/GitHub later
- Firestore Database
- Storage

## 2. Firestore collections

users/{userId}
- username
- displayName
- bio
- photoURL
- createdAt
- connectedServices: github, gitlab, replit, roblox, itch, vercel, netlify

projects/{projectId}
- title
- description
- type
- service
- url
- imageURL
- tags
- ownerId
- ownerName
- status: published / draft / removed
- createdAt
- updatedAt
- likesCount
- commentsCount

threads/{threadId}
- title
- body
- category
- authorId
- authorName
- projectId optional
- createdAt
- repliesCount

threads/{threadId}/replies/{replyId}
- body
- authorId
- authorName
- createdAt

blogPosts/{postId}
- title
- slug
- body
- excerpt
- authorId
- published
- createdAt
- updatedAt

reports/{reportId}
- type
- targetId
- reason
- reporterId
- createdAt
- status

## 3. Starter Firestore rules

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(userId) { return signedIn() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read: if true;
      allow create, update: if isOwner(userId);
    }

    match /projects/{projectId} {
      allow read: if resource.data.status == "published" || signedIn();
      allow create: if signedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.ownerId == request.auth.uid;
    }

    match /threads/{threadId} {
      allow read: if true;
      allow create: if signedIn() && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.authorId == request.auth.uid;

      match /replies/{replyId} {
        allow read: if true;
        allow create: if signedIn() && request.resource.data.authorId == request.auth.uid;
        allow update, delete: if signedIn() && resource.data.authorId == request.auth.uid;
      }
    }

    match /blogPosts/{postId} {
      allow read: if resource.data.published == true;
      allow write: if signedIn();
    }

    match /reports/{reportId} {
      allow create: if signedIn();
      allow read, update, delete: if false;
    }
  }
}

## 4. Storage folders
- users/{uid}/avatar.png
- projects/{projectId}/cover.png
- projects/{projectId}/screenshots/{imageName}
- blog/{postId}/{imageName}

## 5. Next code step
Create firebase.js and connect login.html, submit.html, and forums.html to Firebase.
