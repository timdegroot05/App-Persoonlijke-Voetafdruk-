import {
  auth,
} from "./firebase";

import {
  signInAnonymously,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
  updateProfile,
} from "firebase/auth";

/**
 * Logt een gebruiker anoniem in.
 * Dit gebruik je wanneer iemand de app opent en nog geen account heeft.
 */
export async function loginAnoniem() {
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Koppelt een anonieme gebruiker aan een echt account
 * nadat de vragenlijst is ingevuld.
 */
export async function registreerNaVragenlijst(email, password) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Geen huidige gebruiker gevonden.");
  }

  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(user, credential);

  return result.user;
}

/**
 * Laat een bestaande gebruiker inloggen met email en wachtwoord.
 */
export async function loginMetEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Logt de huidige gebruiker uit.
 */
export async function logoutGebruiker() {
  await signOut(auth);
}

/**
 * Geeft de huidige gebruiker terug.
 */
export function getCurrentUser() {
  return auth.currentUser;
}

export async function updateCurrentUserName(name) {
  if (!auth.currentUser) {
    throw new Error("Geen huidige gebruiker gevonden.");
  }

  await updateProfile(auth.currentUser, {
    displayName: String(name || "").trim() || null,
  });

  return auth.currentUser;
}
