import { calculateImpact } from "./calculateImpact"

const HISTORY_KEY = "impact-history"

export function buildImpactSnapshot(profileAnswers = {}, weeklyAnswers = {}) {
  const footprint = calculateImpact(profileAnswers, weeklyAnswers)
  const weeklyEmission = footprint.totale_weekuitstoot
  const dailyEmission = Number((weeklyEmission / 7).toFixed(1))
  const totalScore = Math.max(0, Math.min(100, Math.round(100 - weeklyEmission)))
  const categories = footprint.categories
  const focusCategories = Object.entries(categories).filter(
    ([category]) => category !== "achtergrondimpact"
  )
  const dominantCategory =
    focusCategories.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "energie"

  return {
    id: `${Date.now()}-${dominantCategory}-${weeklyEmission}`,
    answersKey: JSON.stringify({ profileAnswers, weeklyAnswers }),
    createdAt: new Date().toISOString(),
    totalScore,
    totalImpact: weeklyEmission,
    dailyEmission,
    weeklyEmission,
    categories,
    dominantCategory,
    breakdown: {
      aangepaste_woninguitstoot: footprint.aangepaste_woninguitstoot,
      auto_uitstoot: footprint.auto_uitstoot,
      ov_uitstoot: footprint.ov_uitstoot,
      voeding_uitstoot: footprint.voeding_uitstoot,
      consumptie_uitstoot: footprint.consumptie_uitstoot,
    },
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
    achtergrondimpact: "Achtergrondimpact",
    voeding: "Voeding",
    transport: "Transport",
    energie: "Energie",
    wonen: "Wonen",
    consumptie: "Consumptie",
  }

  return labels[category] || "Leefstijl"
}

export function getPersonalInsight(snapshot) {
  const focusCategory = snapshot?.dominantCategory || "energie"

  const insightByCategory = {
    voeding: {
      title: "Voeding is nu je grootste kans",
      body: "Minder vlees en vaker plantaardig eten kan je weekuitstoot snel verlagen.",
    },
    transport: {
      title: "Transport vraagt nu de meeste aandacht",
      body: "Minder autokilometers en slim OV-gebruik leveren hier de meeste winst op.",
    },
    energie: {
      title: "Energieverbruik blijft belangrijk",
      body: "Douchen, verwarming en energiebesparing bepalen samen een groot deel van je woninguitstoot.",
    },
    wonen: {
      title: "Thuisgebruik bepaalt veel",
      body: "Woningtype, isolatie en energiebron vormen de basis van je weekuitstoot thuis.",
    },
    consumptie: {
      title: "Consumptie schiet deze week omhoog",
      body: "Nieuwe aankopen, vooral elektronica en kleding, kunnen je totale uitstoot flink verhogen.",
    },
  }

  return insightByCategory[focusCategory] || insightByCategory.energie
}
