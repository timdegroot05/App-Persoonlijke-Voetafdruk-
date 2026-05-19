import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Maakt een user-document aan als deze nog niet bestaat.
 * Werkt met de uid van Firebase Auth.
 */
export async function createUserDocument(user) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Gebruiker",
      email: user.email || null,
      isAnonymous: user.isAnonymous,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      latestFootprint: {
        dailyCo2: 0,
        weeklyCo2: 0,
        totalScore: 0,
      },
      questionnaireAnswers: {
        profile: {},
        weekly: {},
      },
    });
  } else {
    await setDoc(
      userRef,
      {
        name: user.displayName || "Gebruiker",
        email: user.email || null,
        isAnonymous: user.isAnonymous,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/**
 * Slaat de ingevulde vragenlijst en berekende footprint op.
 * Deze functie update alleen de data die met de vragenlijst te maken heeft.
 */
export async function saveQuestionnaire(uid, weeklyAnswers, footprint, profileAnswers = null) {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const nextQuestionnaireAnswers =
    profileAnswers === null
      ? weeklyAnswers
      : {
          profile: profileAnswers,
          weekly: weeklyAnswers,
        };

  await setDoc(
    userRef,
    {
      questionnaireAnswers: nextQuestionnaireAnswers,
      latestFootprint: footprint,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveUserName(uid, name) {
  if (!uid) return;

  const cleanedName = String(name || "").trim();
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      name: cleanedName || "Gebruiker",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserName(uid) {
  if (!uid) return "";

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return "";
  }

  return userSnap.data()?.name || "";
}
