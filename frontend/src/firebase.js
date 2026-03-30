import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrDVBnbZl0bIxnGbct-90N80HZ2NtSV1c",
  authDomain: "gaurk-7883d.firebaseapp.com",
  projectId: "gaurk-7883d",
  storageBucket: "gaurk-7883d.firebasestorage.app",
  messagingSenderId: "6532733581",
  appId: "1:6532733581:web:1bdf7bcc454ac73e6ca0c4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
