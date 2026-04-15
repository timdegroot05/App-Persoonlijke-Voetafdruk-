import { calculateImpact } from "./calculateImpact"
import {
  initialProfileQuestions,
  getVisibleQuestions,
} from "../data/questionnaires"
import { weeklyQuestions } from "../data/questions"

const HISTORY_KEY = "impact-history"

export function buildImpactSnapshot(profileAnswers = {}, weeklyAnswers = {}) {
  const visibleProfileQuestions = getVisibleQuestions(initialProfileQuestions, profileAnswers)
  const visibleWeeklyQuestions = getVisibleQuestions(weeklyQuestions, weeklyAnswers)
  const profileResult = calculateImpact(profileAnswers, visibleProfileQuestions)
  const weeklyResult = calculateImpact(weeklyAnswers, visibleWeeklyQuestions)
  const totalImpact = profileResult.total + weeklyResult.total
  const categories = {}
  const maxImpact =
    visibleProfileQuestions.reduce(
      (sum, question) => sum + Math.max(...question.answers.map((answer) => answer.impact)),
      0
    ) +
    visibleWeeklyQuestions.reduce(
      (sum, question) => sum + Math.max(...question.answers.map((answer) => answer.impact)),
      0
    )

  Object.entries(profileResult.categories).forEach(([category, value]) => {
    categories[category] = (categories[category] || 0) + value
  })

  Object.entries(weeklyResult.categories).forEach(([category, value]) => {
    categories[category] = (categories[category] || 0) + value
  })

  const totalScore = Math.max(
    0,
    Math.round(((Math.max(0, maxImpact - totalImpact)) / Math.max(1, maxImpact)) * 100)
  )
  const dailyEmission = Number((3.5 + totalImpact * 0.28).toFixed(1))
  const weeklyEmission = Number((dailyEmission * 7).toFixed(1))

  const dominantCategory =
    Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "energie"

  return {
    id: `${Date.now()}-${dominantCategory}-${totalImpact}`,
    answersKey: JSON.stringify({ profileAnswers, weeklyAnswers }),
    createdAt: new Date().toISOString(),
    totalScore,
    totalImpact,
    dailyEmission,
    weeklyEmission,
    categories,
    dominantCategory,
  }
}

export function getImpactHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export function saveImpactSnapshot(snapshot) {
  const history = getImpactHistory()
  const latest = history[0]

  if (latest?.answersKey === snapshot.answersKey) {
    return history
  }

  const nextHistory = [snapshot, ...history].slice(0, 8)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
  return nextHistory
}

export function getFocusLabel(category) {
  const labels = {
    voeding: "Voeding",
    transport: "Vervoer",
    energie: "Energie",
    wonen: "Wonen",
  }

  return labels[category] || "Leefstijl"
}

export function getPersonalInsight(snapshot) {
  const focusCategory = snapshot?.dominantCategory || "energie"

  const insightByCategory = {
    voeding: {
      title: "Voeding is nu je grootste kans",
      body: "Minder vlees en vaker lokaal kiezen kan snel zichtbaar verschil maken.",
    },
    transport: {
      title: "Vervoer vraagt nu de meeste aandacht",
      body: "Vooral korte ritten vervangen door fiets of OV geeft vaak snelle winst.",
    },
    energie: {
      title: "Energieverbruik blijft belangrijk",
      body: "Groene stroom en minder sluipverbruik zijn hier de slimste eerste stappen.",
    },
    wonen: {
      title: "Thuisgebruik bepaalt veel",
      body: "Kleine keuzes rond verwarming en apparaten stapelen snel op.",
    },
  }

  return insightByCategory[focusCategory] || insightByCategory.energie
}
