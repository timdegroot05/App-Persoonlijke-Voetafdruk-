import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { LuTrees } from "react-icons/lu"
import { buildImpactSnapshot } from "../utils/impactInsights"
import {
  compareWeeklyResults,
  formatWeekRangeLabel,
  getStoredWeeklyResults,
  getWeekInfoFromKey,
} from "../utils/weeklyResults"

const MAX_TREES = 5
const MIN_TREES = 1
const DEFAULT_WEEKLY_GOAL = 150
const FULL_FOREST_MARGIN_RATIO = 0.45
const TREE_STEP_PERCENTAGE = 20

const TEST_SCENARIOS = [
  {
    id: "high",
    label: "Hoge uitstoot",
    helper: "1 plantje",
    emissionRatio: 1.18,
    dominantCategory: "transport",
  },
  {
    id: "good",
    label: "Normaal",
    helper: "3 bomen",
    emissionRatio: 0.75,
    dominantCategory: "energie",
  },
  {
    id: "great",
    label: "Lage uitstoot",
    helper: "vol bos",
    emissionRatio: 0.5,
    dominantCategory: "voeding",
  },
]

const FOREST_LEVELS = [
  {
    name: "Start",
    badge: "Begin",
    motivation:
      "Je bos is nog klein. Minder uitstoot geeft straks meer groei.",
  },
  {
    name: "Bezig",
    badge: "Groei",
    motivation:
      "Je bent op weg. Elke kleine verbetering helpt.",
  },
  {
    name: "Groen",
    badge: "Goed",
    motivation:
      "Je zit onder je doel. Je bos groeit verder.",
  },
  {
    name: "Mooi bos",
    badge: "Sterk",
    motivation:
      "Goede week. Je ziet duidelijk verschil.",
  },
  {
    name: "Vol bos",
    badge: "Top",
    motivation:
      "Je zit ruim onder je doel. Je bos is vol.",
  },
]

const FOREST_ITEMS = [
  { type: "small", layer: "front" },
  { type: "round", layer: "back" },
  { type: "pine", layer: "front" },
  { type: "wide", layer: "back" },
  { type: "tall", layer: "front" },
]

const GROUND_ITEMS = ["grass-1", "grass-2", "grass-3", "grass-4", "grass-5"]

const CLASSIC_FOREST_ITEMS = ["🌱", "🌿", "🌲", "🌳", "🌲"]

const VISUAL_MODES = [
  {
    id: "animated",
    label: "Animatie",
  },
  {
    id: "calm",
    label: "Rustig",
  },
  {
    id: "game",
    label: "Game",
  },
  {
    id: "classic",
    label: "Oud",
  },
]

const ACTIVITY_ACTIONS = [
  {
    id: "bike",
    title: "Fietsrit gekozen",
    category: "transport",
    reductionKg: 4,
    description: "Vervang een korte autorit door fiets of lopen.",
  },
  {
    id: "plantMeal",
    title: "Plantaardige maaltijd",
    category: "voeding",
    reductionKg: 3,
    description: "Kies vandaag een maaltijd zonder vlees.",
  },
  {
    id: "energy",
    title: "Energie besparen",
    category: "energie",
    reductionKg: 2.5,
    description: "Zet apparaten uit en douche iets korter.",
  },
]

const ADVICE_BY_CATEGORY = {
  transport: {
    title: "Pak eerst transport aan",
    body: "Je grootste winst zit nu in reizen. Eén korte autorit vervangen helpt je bos direct groeien.",
  },
  voeding: {
    title: "Voeding is je snelste kans",
    body: "Een plantaardige maaltijd is makkelijk te doen en geeft meteen minder CO₂ in je weekscore.",
  },
  energie: {
    title: "Let op energie thuis",
    body: "Korter douchen, verwarming lager en apparaten uitzetten geven snel resultaat.",
  },
  wonen: {
    title: "Thuis valt winst te halen",
    body: "Kijk naar verwarming, isolatie en energiegebruik. Kleine aanpassingen tellen mee.",
  },
  consumptie: {
    title: "Koop iets minder nieuw",
    body: "Tweedehands kiezen of een aankoop uitstellen helpt je voetafdruk direct omlaag.",
  },
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function roundKg(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Number(Math.max(0, number).toFixed(1)) : 0
}

function getSafeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

function readStorageItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorageItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Als localStorage niet beschikbaar is, blijft de demo lokaal in het scherm werken.
  }
}

function readJsonStorage(key, fallback) {
  try {
    const value = JSON.parse(readStorageItem(key))
    return value ?? fallback
  } catch {
    return fallback
  }
}

function getLatestWeeklyEntry() {
  const history = readJsonStorage("weekly-questionnaire-history", [])
  return Array.isArray(history) ? history[0] || null : null
}

function getDataForForest() {
  const profileAnswers = readJsonStorage("profile-questionnaire", {})
  const weeklyEntry = getLatestWeeklyEntry()
  const weeklyAnswers = weeklyEntry?.answers || {}
  const legacyAnswers = readJsonStorage("answers", {})
  const hasProfileData = Object.keys(profileAnswers || {}).length > 0
  const hasWeeklyData = Object.keys(weeklyAnswers || {}).length > 0
  const hasLegacyData = Object.keys(legacyAnswers || {}).length > 0

  if (hasProfileData || hasWeeklyData) {
    return {
      profileAnswers: profileAnswers || {},
      weeklyAnswers,
      sourceLabel: hasWeeklyData
        ? "Profiel + laatste weekmeting"
        : "Alleen profielgegevens",
      weekKey: weeklyEntry?.weekKey || "geen weekmeting",
      hasRealData: true,
    }
  }

  return {
    profileAnswers: hasLegacyData ? legacyAnswers : {},
    weeklyAnswers: {},
    sourceLabel: hasLegacyData ? "Oude answers fallback" : "Standaard fallback",
    weekKey: hasLegacyData ? "oude opslag" : "nog geen meting",
    hasRealData: hasLegacyData,
  }
}

function getWeeklyGoal() {
  return getSafeNumber(readStorageItem("weekly-goal"), DEFAULT_WEEKLY_GOAL) || DEFAULT_WEEKLY_GOAL
}

function getStoredVisualMode() {
  const storedMode = readStorageItem("forest-visual-mode")
  return VISUAL_MODES.some((mode) => mode.id === storedMode) ? storedMode : "animated"
}

function buildSafeImpactSnapshot(profileAnswers, weeklyAnswers) {
  try {
    return buildImpactSnapshot(profileAnswers, weeklyAnswers)
  } catch {
    return buildImpactSnapshot({}, {})
  }
}

function buildScenarioSnapshot(baseSnapshot, weeklyGoal, scenarioId) {
  const scenario = TEST_SCENARIOS.find((item) => item.id === scenarioId)

  if (!scenario) {
    return baseSnapshot
  }

  const weeklyEmission = roundKg(weeklyGoal * scenario.emissionRatio)

  return {
    ...baseSnapshot,
    weeklyEmission,
    totalImpact: weeklyEmission,
    dominantCategory: scenario.dominantCategory,
  }
}

function getVisualState(treeCount) {
  if (treeCount >= MAX_TREES) {
    return "full"
  }

  if (treeCount >= 4) {
    return "strong"
  }

  if (treeCount >= 2) {
    return "growing"
  }

  return "start"
}

function getCoachMessage({ savedKg, treeCount }) {
  if (savedKg <= 0) {
    return "Je zit nog boven je doel. Begin met één kleine actie."
  }

  if (treeCount >= MAX_TREES) {
    return "Goed bezig. Je bos staat vol."
  }

  return `Je zit ${savedKg} kg CO₂e onder je doel.`
}

function calculateForestProgress({ weeklyEmission, weeklyGoal, activityReduction = 0 }) {
  // Het weekdoel is de basis voor alle verhoudingen. Minimaal 1 voorkomt delen door 0.
  const safeWeeklyGoal = Math.max(1, weeklyGoal)
  const safeWeeklyEmission = roundKg(weeklyEmission - activityReduction)
  const emissionRatio = safeWeeklyEmission / safeWeeklyGoal
  const isAboveGoal = emissionRatio > 1
  const savedKg = roundKg(safeWeeklyGoal - safeWeeklyEmission)
  const excessKg = roundKg(safeWeeklyEmission - safeWeeklyGoal)

  // De marge onder het doel wordt vertaald naar bosgroei. Bij 45% marge is het bos vol.
  const marginRatio = clamp(1 - emissionRatio, 0, FULL_FOREST_MARGIN_RATIO)
  const forestScore = Math.round((marginRatio / FULL_FOREST_MARGIN_RATIO) * 100)

  // Boven het doel blijft er altijd 1 zaailing staan; onder het doel groeit het bos in stappen.
  const treeCount = isAboveGoal
    ? MIN_TREES
    : clamp(
        Math.max(MIN_TREES, Math.ceil(forestScore / TREE_STEP_PERCENTAGE)),
        MIN_TREES,
        MAX_TREES
      )

  const nextTreeTargetScore =
    treeCount >= MAX_TREES ? 100 : treeCount * TREE_STEP_PERCENTAGE
  const nextTreeTargetMarginRatio =
    (nextTreeTargetScore / 100) * FULL_FOREST_MARGIN_RATIO
  const extraMarginNeeded = Math.max(0, nextTreeTargetMarginRatio - marginRatio)
  const kgUntilNextTree = roundKg(excessKg + extraMarginNeeded * safeWeeklyGoal)
  const progressPercentage =
    treeCount >= MAX_TREES ? 100 : Math.max(isAboveGoal ? 8 : 12, forestScore)

  return {
    weeklyEmission: safeWeeklyEmission,
    weeklyGoal: roundKg(safeWeeklyGoal),
    savedKg,
    marginText:
      savedKg > 0
        ? `${savedKg} kg onder doel`
        : `${excessKg} kg boven doel`,
    treeCount,
    level: FOREST_LEVELS[treeCount - 1] || FOREST_LEVELS[0],
    visualState: getVisualState(treeCount),
    kgUntilNextTree,
    coachMessage: getCoachMessage({ savedKg, treeCount }),
    progressPercentage,
    forestPoints: forestScore,
  }
}

function buildForestScene(treeCount) {
  return {
    trees: FOREST_ITEMS.slice(0, treeCount),
    classicTrees: CLASSIC_FOREST_ITEMS.slice(0, treeCount),
    groundItems: GROUND_ITEMS.slice(0, Math.max(2, treeCount)),
  }
}

function getStoredForestActivities(weekKey) {
  const activities = readJsonStorage("forest-activities", [])

  if (!Array.isArray(activities)) {
    return []
  }

  return activities.filter((activity) => activity.weekKey === weekKey)
}

function saveForestActivitiesForWeek(weekKey, nextWeekActivities) {
  const activities = readJsonStorage("forest-activities", [])
  const otherWeeks = Array.isArray(activities)
    ? activities.filter((activity) => activity.weekKey !== weekKey)
    : []

  writeStorageItem(
    "forest-activities",
    JSON.stringify([...nextWeekActivities, ...otherWeeks].slice(0, 24))
  )
}

function getAdviceForCategory(category) {
  return ADVICE_BY_CATEGORY[category] || {
    title: "Kies één kleine actie",
    body: "Begin met iets simpels. Een kleine duurzame keuze kan je bos al laten groeien.",
  }
}

function getRecommendedActivity(category) {
  return ACTIVITY_ACTIONS.find((activity) => activity.category === category) || ACTIVITY_ACTIONS[0]
}

function getWeekLabel(weekKey) {
  try {
    const weekInfo = getWeekInfoFromKey(weekKey)
    return formatWeekRangeLabel(weekInfo.weekStart, weekInfo.weekEnd)
  } catch {
    return "Geen weekdata"
  }
}

function getComparisonText(weeklyResults, currentEmission, currentWeekKey) {
  const previousWeek = weeklyResults.find((week) => week.weekStart !== currentWeekKey)

  if (!previousWeek) {
    return "Nog geen vorige week"
  }

  const comparison = compareWeeklyResults(
    { totalEmission: currentEmission },
    previousWeek
  )

  if (!comparison || comparison.trend === "equal") {
    return "Gelijk gebleven"
  }

  const difference = Math.abs(comparison.difference)

  return comparison.trend === "lower"
    ? `${difference} kg minder`
    : `${difference} kg meer`
}

function BosVisualisatie() {
  const navigate = useNavigate()
  const [activeScenario, setActiveScenario] = useState("real")
  const [visualMode, setVisualMode] = useState(getStoredVisualMode)
  const forestData = useMemo(() => getDataForForest(), [])
  const [appliedActivities, setAppliedActivities] = useState(() =>
    getStoredForestActivities(forestData.weekKey)
  )
  const weeklyGoal = useMemo(() => getWeeklyGoal(), [])
  const weeklyResults = useMemo(() => getStoredWeeklyResults(), [])

  const realSnapshot = useMemo(() => {
    return buildSafeImpactSnapshot(forestData.profileAnswers, forestData.weeklyAnswers)
  }, [forestData.profileAnswers, forestData.weeklyAnswers])

  const snapshot = useMemo(() => {
    return buildScenarioSnapshot(realSnapshot, weeklyGoal, activeScenario)
  }, [activeScenario, realSnapshot, weeklyGoal])

  const activityReduction = useMemo(() => {
    return roundKg(
      appliedActivities.reduce((total, activity) => total + getSafeNumber(activity.reductionKg), 0)
    )
  }, [appliedActivities])

  const forestProgress = useMemo(() => {
    return calculateForestProgress({
      weeklyEmission: snapshot?.weeklyEmission,
      weeklyGoal,
      activityReduction,
    })
  }, [activityReduction, snapshot, weeklyGoal])

  const { trees, classicTrees, groundItems } = useMemo(() => {
    return buildForestScene(forestProgress.treeCount)
  }, [forestProgress.treeCount])

  const focusCategory = snapshot?.dominantCategory ?? "energie"
  const advice = getAdviceForCategory(snapshot?.dominantCategory ?? "energie")
  const recommendedActivity = getRecommendedActivity(focusCategory)
  const weekLabel = getWeekLabel(forestData.weekKey)
  const comparisonText = getComparisonText(
    weeklyResults,
    forestProgress.weeklyEmission,
    forestData.weekKey
  )
  const applyActivity = (activity) => {
    if (appliedActivities.some((item) => item.id === activity.id)) {
      return
    }

    const nextActivities = [
      ...appliedActivities,
      {
        ...activity,
        weekKey: forestData.weekKey,
        completedAt: new Date().toISOString(),
      },
    ]

    setAppliedActivities(nextActivities)
    saveForestActivitiesForWeek(forestData.weekKey, nextActivities)
  }

  const resetActivities = () => {
    setAppliedActivities([])
    saveForestActivitiesForWeek(forestData.weekKey, [])
  }

  const changeVisualMode = (mode) => {
    setVisualMode(mode)
    writeStorageItem("forest-visual-mode", mode)
  }

  return (
    <div className="calculator-page forest-page">
      <AppHeader title="Bos" icon={<LuTrees />} />

      <div className="calculator-card forest-card">
        <p className="section-label dark">CO₂-bos</p>
        <h1 className="calculator-title">Jouw bos</h1>
        <p className="calculator-text">
          Minder uitstoot betekent meer bomen.
        </p>

        <div className="forest-section-heading">
          <h2 className="forest-subtitle">Weergave</h2>
          <div className="forest-mode-toggle" aria-label="Kies bosweergave">
            {VISUAL_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`forest-mode-button${visualMode === mode.id ? " active" : ""}`}
                onClick={() => changeVisualMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`forest-visual ${visualMode} forest-density-${forestProgress.treeCount} forest-state-${forestProgress.visualState}`}
          aria-label={`Bosvisualisatie met ${forestProgress.treeCount} van maximaal ${MAX_TREES} bomen`}
        >
          <div className="forest-sky" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          {visualMode === "classic" ? (
            <div className="forest-emoji-line">
              {classicTrees.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="forest-emoji-tree"
                  style={{ "--tree-index": index }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <div className="forest-tree-line">
              {trees.map((item, index) => (
                <div
                  key={`${item.type}-${index}`}
                  className={`forest-tree ${item.type} ${item.layer}`}
                  style={{ "--tree-index": index }}
                >
                  <span className="forest-tree-leaves" />
                  <span className="forest-tree-trunk" />
                </div>
              ))}
            </div>
          )}

          <div className="forest-ground" aria-hidden="true">
            <div className="forest-ground-top" />
            <div className="forest-ground-details">
              {groundItems.map((item, index) => (
                <span key={`${item}-${index}`} className={`forest-grass ${item}`} />
              ))}
            </div>
          </div>
        </div>

        <p className="forest-visual-caption">
          Minder uitstoot is meer bos.
        </p>

        <div className="forest-main-result">
          <div>
            <span>Bomen</span>
            <strong>{forestProgress.treeCount}/5 bomen</strong>
          </div>
          <div>
            <span>Uitstoot</span>
            <strong>{forestProgress.weeklyEmission} kg</strong>
          </div>
        </div>

        <div className="forest-tree-meter" aria-label={`${forestProgress.treeCount} van 5 bomen`}>
          {Array.from({ length: MAX_TREES }).map((_, index) => (
            <span
              key={index}
              className={index < forestProgress.treeCount ? "filled" : ""}
            />
          ))}
        </div>

        <div className="forest-example-panel" aria-label="Voorbeeld bekijken">
          <span>Voorbeeld</span>
          <div className="forest-example-buttons">
            <button
              type="button"
              className={`forest-example-button${activeScenario === "real" ? " active" : ""}`}
              onClick={() => setActiveScenario("real")}
            >
              Jouw data
            </button>
            {TEST_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`forest-example-button${activeScenario === scenario.id ? " active" : ""}`}
                onClick={() => setActiveScenario(scenario.id)}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <div className="forest-data-strip">
          <div>
            <span>Week</span>
            <strong>{weekLabel}</strong>
          </div>
          <div>
            <span>Vergelijking</span>
            <strong>{comparisonText}</strong>
          </div>
        </div>

        <div className="forest-simple-action">
          <button
            type="button"
            className={`forest-action-card${
              appliedActivities.some((item) => item.id === recommendedActivity.id)
                ? " completed"
                : ""
            }`}
            onClick={() => applyActivity(recommendedActivity)}
            disabled={appliedActivities.some((item) => item.id === recommendedActivity.id)}
          >
            <span>{recommendedActivity.title}</span>
            <strong>-{recommendedActivity.reductionKg} kg CO₂e</strong>
            <small>
              {appliedActivities.some((item) => item.id === recommendedActivity.id)
                ? "Deze actie telt mee."
                : recommendedActivity.description}
            </small>
          </button>
          {activityReduction > 0 && (
            <button type="button" className="forest-reset-button" onClick={resetActivities}>
              Reset acties
            </button>
          )}
        </div>

        <div className="forest-advice-card simple">
          <span>Tip</span>
          <strong>{advice.title}</strong>
          <p>{advice.body}</p>
          <div className="forest-advice-actions">
            <button
              type="button"
              onClick={() =>
                navigate("/activiteiten", {
                  state: { focusCategory },
                })
              }
            >
              Meer acties
            </button>
            <button type="button" onClick={() => navigate("/tips")}>
              Tips
            </button>
          </div>
        </div>

        <button
          type="button"
          className="forest-game-link-button"
          onClick={() => navigate("/bos-game")}
        >
          Speel Red het bos
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

export default BosVisualisatie
