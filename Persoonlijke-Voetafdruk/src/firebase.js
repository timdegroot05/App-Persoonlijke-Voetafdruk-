import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBac_1HRajMx64pT8u1VJbbSdBASl41j_w",
  authDomain: "persoonlijke-voetafruk.firebaseapp.com",
  projectId: "persoonlijke-voetafruk",
  storageBucket: "persoonlijke-voetafruk.firebasestorage.app",
  messagingSenderId: "11565120506",
  appId: "1:11565120506:web:30fe8f14f026ed2d264243"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
