import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEjMpKFA9GVo202ukzV8jPg-CZYetBcz8",
  authDomain: "main-website-88cfa.firebaseapp.com",
  projectId: "main-website-88cfa",
  storageBucket: "main-website-88cfa.firebasestorage.app",
  messagingSenderId: "677255019985",
  appId: "1:677255019985:web:9da3d19e87bfeee908f4f0",
  measurementId: "G-08NFHQ1E5D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
