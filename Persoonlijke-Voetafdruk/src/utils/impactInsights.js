import { questions } from "../data/questions"
import { calculateImpact } from "./calculateImpact"

const HISTORY_KEY = "impact-history"

export function buildImpactSnapshot(answers) {
  const safeAnswers = Array.isArray(answers) ? answers : []
  const result = calculateImpact(safeAnswers, questions)
  const totalScore = Math.max(0, Math.round(100 - result.total))
  const dailyEmission = Number((4 + result.total * 0.45).toFixed(1))
  const weeklyEmission = Number((dailyEmission * 7).toFixed(1))

  const dominantCategory =
    Object.entries(result.categories).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "energie"

  return {
    id: `${Date.now()}-${safeAnswers.join("-")}`,
    answersKey: safeAnswers.join("-"),
    createdAt: new Date().toISOString(),
    totalScore,
    totalImpact: result.total,
    dailyEmission,
    weeklyEmission,
    categories: result.categories,
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
