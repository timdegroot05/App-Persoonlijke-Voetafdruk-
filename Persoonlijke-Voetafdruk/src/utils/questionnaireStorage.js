import { getCurrentWeekInfo, getWeeklyCheckinWeekInfo } from "./weeklyResults"

const PROFILE_KEY = "profile-questionnaire"
const WEEKLY_KEY = "weekly-questionnaire-history"
const USERNAME_KEY = "profile-username"

export function getWeekKey(date = new Date()) {
  return getCurrentWeekInfo(date).weekStart
}

export function getProfileAnswers() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveProfileAnswers(answers) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(answers))
  return answers
}

export function hasCompletedProfileQuestionnaire() {
  return Object.keys(getProfileAnswers()).length > 0
}

export function getProfileUsername() {
  try {
    return localStorage.getItem(USERNAME_KEY) || ""
  } catch {
    return ""
  }
}

export function saveProfileUsername(username) {
  const cleanedUsername = String(username || "").trim()
  localStorage.setItem(USERNAME_KEY, cleanedUsername)
  return cleanedUsername
}

export function getWeeklyHistory() {
  try {
    return JSON.parse(localStorage.getItem(WEEKLY_KEY)) || []
  } catch {
    return []
  }
}

export function getWeeklyEntry(weekKey = getWeekKey()) {
  return getWeeklyHistory().find((entry) => entry.weekKey === weekKey) || null
}

export function getLatestWeeklyAnswers() {
  return getWeeklyHistory()[0]?.answers || {}
}

export function saveWeeklyAnswers(answers, weekKey = getWeekKey()) {
  const history = getWeeklyHistory().filter((entry) => entry.weekKey !== weekKey)
  const nextEntry = {
    weekKey,
    answers,
    updatedAt: new Date().toISOString(),
  }

  const nextHistory = [nextEntry, ...history].slice(0, 12)
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(nextHistory))
  return nextEntry
}

export function isWeeklyQuestionnaireDue() {
  return !getWeeklyEntry(getWeeklyCheckinWeekInfo().weekStart)
}
