const PROFILE_KEY = "profile-questionnaire"
const WEEKLY_KEY = "weekly-questionnaire-history"

export function getWeekKey(date = new Date()) {
  const localDate = new Date(date)
  const day = localDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  localDate.setHours(0, 0, 0, 0)
  localDate.setDate(localDate.getDate() + diff)

  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, "0")
  const dayOfMonth = String(localDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${dayOfMonth}`
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
  return !getWeeklyEntry()
}
