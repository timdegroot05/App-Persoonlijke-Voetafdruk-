import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}