import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBac_1HRajMx64pT8u1VJbbSdBASl41j_w",
  authDomain: "persoonlijke-voetafruk.firebaseapp.com",
  projectId: "persoonlijke-voetafruk",
  storageBucket: "persoonlijke-voetafruk.firebasestorage.app",
  messagingSenderId: "11565120506",
  appId: "1:11565120506:web:48c3bee2f34ab599264243",
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
