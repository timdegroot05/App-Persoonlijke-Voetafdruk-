import { buildImpactSnapshot } from "./impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "./questionnaireStorage"
import { getAugmentedWeeklyResults } from "./customActivities"

export const FOREST_GAME_KEY = "forest-clean-game"
export const DEFAULT_WEEKLY_GOAL = 150

export function readJsonStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // De app blijft bruikbaar als opslag tijdelijk niet beschikbaar is.
  }
}

export function getSafeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

export function getWeeklyGoal() {
  try {
    const storedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(storedGoal) && storedGoal > 0 ? storedGoal : DEFAULT_WEEKLY_GOAL
  } catch {
    return DEFAULT_WEEKLY_GOAL
  }
}

export function getForestGameState() {
  const stored = readJsonStorage(FOREST_GAME_KEY, {})

  return {
    completedIds: Array.isArray(stored.completedIds) ? stored.completedIds : [],
    badIds: Array.isArray(stored.badIds) ? stored.badIds : [],
    tokens: getSafeNumber(stored.tokens, 0),
    battlePoints: getSafeNumber(stored.battlePoints, 0),
    xp: getSafeNumber(stored.xp, 0),
    seeds: getSafeNumber(stored.seeds, 0),
    collectibles: Array.isArray(stored.collectibles) ? stored.collectibles : [],
    purchasedCosmetics: Array.isArray(stored.purchasedCosmetics) ? stored.purchasedCosmetics : [],
    season: stored.season || "spring",
    raw: stored,
  }
}

export function saveForestGameState(nextGame) {
  writeJsonStorage(FOREST_GAME_KEY, nextGame)
}

export function getWeeklyEmission() {
  const profileAnswers = getProfileAnswers()
  const weeklyAnswers = getLatestWeeklyAnswers()
  const weeklyResults = getAugmentedWeeklyResults()
  const latestWeekly = Array.isArray(weeklyResults) ? weeklyResults[0] : null

  if (latestWeekly?.totalEmission != null) {
    return getSafeNumber(latestWeekly.totalEmission, 0)
  }

  try {
    const snapshot = buildImpactSnapshot(profileAnswers, weeklyAnswers)
    return getSafeNumber(snapshot.weeklyEmission, 0)
  } catch {
    return 0
  }
}

export function getDailyEmission(weeklyEmission = getWeeklyEmission()) {
  return Number((getSafeNumber(weeklyEmission, 0) / 7).toFixed(1))
}

export function calculateForestScore({ weeklyEmission, weeklyGoal, completedCount = 0, badCount = 0, recoveryBonus = 0 }) {
  const goal = Math.max(1, getSafeNumber(weeklyGoal, DEFAULT_WEEKLY_GOAL))
  const dataScore = Math.round(((goal - getSafeNumber(weeklyEmission, 0)) / goal) * 100 + 70)
  return Math.max(0, Math.min(100, dataScore + completedCount * 2 - badCount * 12 + getSafeNumber(recoveryBonus, 0)))
}

export function calculateForestStatus(score) {
  if (score < 25) {
    return {
      id: "critical",
      label: "Kritiek bos",
      title: "Kritiek bos",
      message: "Je bos staat onder zware druk door hoge uitstoot.",
    }
  }

  if (score < 45) {
    return {
      id: "bad",
      label: "Beschadigd bos",
      title: "Beschadigd bos",
      message: "Je bos is beschadigd. Herstelacties helpen direct.",
    }
  }

  if (score < 65) {
    return {
      id: "vulnerable",
      label: "Kwetsbaar bos",
      title: "Kwetsbaar bos",
      message: "Je bos heeft aandacht nodig. Kleine keuzes maken verschil.",
    }
  }

  if (score < 80) {
    return {
      id: "recovering",
      label: "Herstellend bos",
      title: "Herstellend bos",
      message: "Je bos herstelt en wordt langzaam groener.",
    }
  }

  return {
    id: "healthy",
    label: "Gezond bos",
    title: "Gezond bos",
    message: "Je bos leeft goed. Je zit netjes op koers.",
  }
}

export function getForestOverview() {
  const game = getForestGameState()
  const weeklyGoal = getWeeklyGoal()
  const baseWeeklyEmission = getWeeklyEmission()
  const savedKg = game.completedIds.length * 1.8
  const badKg = game.badIds.length * 45
  const weeklyEmission = Number(Math.max(0, baseWeeklyEmission + badKg - Math.min(savedKg, weeklyGoal * 0.22)).toFixed(1))
  const recoveryBonus = getSafeNumber(localStorage.getItem("forestRecoveryBonus"), 0)
  const score = calculateForestScore({
    weeklyEmission,
    weeklyGoal,
    completedCount: game.completedIds.length,
    badCount: game.badIds.length,
    recoveryBonus,
  })
  const status = calculateForestStatus(score)

  return {
    game,
    weeklyGoal,
    weeklyEmission,
    dailyEmission: getDailyEmission(weeklyEmission),
    score,
    status,
    savedKg: Number(savedKg.toFixed(1)),
    badKg: Number(badKg.toFixed(1)),
  }
}
