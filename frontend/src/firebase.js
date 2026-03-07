import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnbZGK1sXki8oQ212VhyVMfPWZ2tTNxZI",
  authDomain: "clara-e1216.firebaseapp.com",
  projectId: "clara-e1216",
  storageBucket: "clara-e1216.firebasestorage.app",
  messagingSenderId: "470879131934",
  appId: "1:470879131934:web:817e32722552d3cece510f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);