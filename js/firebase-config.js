const firebaseConfig = {
  apiKey: "AIzaSyDYuqJZ1MC1sKzoODegxy1ecb3ix4ZZp8M",
  authDomain: "globalosp-123.firebaseapp.com",
  projectId: "globalosp-123",
  storageBucket: "globalosp-123.firebasestorage.app",
  messagingSenderId: "861685247215",
  appId: "1:861685247215:web:6c0f40699b8f37ed8dbf1a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
