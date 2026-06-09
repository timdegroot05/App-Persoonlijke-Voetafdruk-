import { useEffect, useMemo, useState } from "react"
import { buildImpactSnapshot } from "../../utils/impactInsights"
import { getProfileUsername } from "../../utils/questionnaireStorage"
import { auth } from "../../firebase"
import { watchAuthState } from "../../authState"
import "./ForestVisualization.css"

const DEFAULT_WEEKLY_GOAL = 150
const STORAGE_KEY = "forest-clean-game"

const ACTIONS = [
  {
    id: "bike-school",
    title: "Fiets naar school",
    description: "Laat de auto staan en kies de fiets.",
    savedKg: 2.5,
    tokens: 18,
    compliment: "Goed bezig, dit is een sterke keuze.",
    impact: "Fietsen vermindert uitstoot en maakt de lucht rond school of werk schoner.",
  },
  {
    id: "vegetarian",
    title: "Eet vegetarisch",
    description: "Kies vandaag een maaltijd zonder vlees.",
    savedKg: 1.8,
    tokens: 14,
    compliment: "Mooie keuze, je maakt je bord klimaatvriendelijker.",
    impact: "Een plantaardige maaltijd vraagt vaak minder land, water en CO2.",
  },
  {
    id: "short-shower",
    title: "Douche korter",
    description: "Bespaar warm water en energie.",
    savedKg: 0.9,
    tokens: 10,
    compliment: "Netjes, kleine gewoontes tellen echt op.",
    impact: "Korter douchen bespaart warm water en verlaagt energieverbruik.",
  },
  {
    id: "devices-off",
    title: "Zet apparaten uit",
    description: "Voorkom sluipverbruik in huis.",
    savedKg: 0.7,
    tokens: 8,
    compliment: "Slim gedaan, je voorkomt onnodige verspilling.",
    impact: "Minder stroomverbruik betekent minder druk op energiebronnen.",
  },
  {
    id: "public-transport",
    title: "Openbaar vervoer",
    description: "Reis duurzamer met bus, tram of trein.",
    savedKg: 3.2,
    tokens: 22,
    compliment: "Sterke actie, dit heeft veel impact.",
    impact: "Samen reizen verlaagt de uitstoot per persoon en houdt steden leefbaarder.",
  },
  {
    id: "led-lamps",
    title: "LED lampen",
    description: "Gebruik zuinige verlichting.",
    savedKg: 2,
    tokens: 16,
    compliment: "Goed geregeld, je huis wordt zuiniger.",
    impact: "LED-verlichting gebruikt minder energie en gaat langer mee.",
  },
  {
    id: "reusable-bottle",
    title: "Hervulbare fles",
    description: "Gebruik vandaag geen wegwerpflesje.",
    savedKg: 0.4,
    tokens: 7,
    compliment: "Lekker praktisch, minder afval is direct zichtbaar.",
    impact: "Herbruikbare spullen zorgen voor minder plastic en minder productie-uitstoot.",
  },
  {
    id: "local-food",
    title: "Eet lokaal",
    description: "Kies iets uit de buurt of van het seizoen.",
    savedKg: 1.1,
    tokens: 11,
    compliment: "Mooie bewuste keuze.",
    impact: "Lokaal en seizoensgebonden eten kan transport en opslag verminderen.",
  },
  {
    id: "repair-item",
    title: "Repareer iets",
    description: "Maak iets langer bruikbaar in plaats van nieuw kopen.",
    savedKg: 2.8,
    tokens: 20,
    compliment: "Heel goed, dit is circulair denken.",
    impact: "Repareren voorkomt nieuwe productie en spaart grondstoffen.",
  },
]

const SHOP_ITEMS = [
  {
    id: "flower-field",
    title: "Bloemenveld",
    description: "Meer kleur in het gras.",
    cost: 25,
    className: "cosmetic-flower-field",
  },
  {
    id: "birdhouse",
    title: "Vogelhuisje",
    description: "Een gezellige plek voor vogels.",
    cost: 40,
    className: "cosmetic-birdhouse",
  },
  {
    id: "rainbow",
    title: "Regenboog",
    description: "Een vrolijke lucht boven je bos.",
    cost: 55,
    className: "cosmetic-rainbow",
  },
  {
    id: "bench",
    title: "Bosbankje",
    description: "Een rustige plek in je bos.",
    cost: 35,
    className: "cosmetic-bench",
  },
]

const SEASONS = [
  { id: "spring", label: "Lente" },
  { id: "summer", label: "Zomer" },
  { id: "autumn", label: "Herfst" },
  { id: "winter", label: "Winter" },
]

const ACHIEVEMENTS = [
  {
    id: "first-tree",
    title: "Eerste boom",
    description: "Voltooi je eerste duurzame actie.",
    check: ({ completedCount }) => completedCount >= 1,
  },
  {
    id: "forest-starter",
    title: "Bosstarter",
    description: "Plant 3 bomen in je bos.",
    check: ({ completedCount }) => completedCount >= 3,
  },
  {
    id: "climate-helper",
    title: "Klimaathelper",
    description: "Bespaar minimaal 10 kg CO2.",
    check: ({ savedKg }) => savedKg >= 10,
  },
  {
    id: "shopper",
    title: "Bosstylist",
    description: "Koop je eerste cosmetische item.",
    check: ({ purchasedCount }) => purchasedCount >= 1,
  },
  {
    id: "streak-3",
    title: "3 dagen streak",
    description: "Kom 3 dagen terug naar je bos.",
    check: ({ streak }) => streak >= 3,
  },
  {
    id: "prestige-1",
    title: "Prestige ster",
    description: "Bereik je eerste prestige-reset.",
    check: ({ prestige }) => prestige >= 1,
  },
]

const WILDLIFE = [
  { id: "butterfly", label: "Vlinder", threshold: 1, className: "wildlife-butterfly" },
  { id: "bird", label: "Vogel", threshold: 3, className: "wildlife-bird" },
  { id: "rabbit", label: "Konijn", threshold: 5, className: "wildlife-rabbit" },
  { id: "deer", label: "Hert", threshold: 7, className: "wildlife-deer" },
]

const BATTLE_QUESTIONS = [
  {
    question: "Welke keuze verlaagt meestal je uitstoot bij korte afstanden?",
    options: ["Auto pakken", "Fietsen of lopen", "Verwarming hoger zetten", "Extra lichten aanzetten"],
    correctIndex: 1,
    explanation: "Fietsen of lopen veroorzaakt bijna geen directe CO2-uitstoot.",
  },
  {
    question: "Wat helpt om energie thuis te besparen?",
    options: ["Lampen aan laten", "Verwarming lager zetten", "Ramen open met verwarming aan", "Elke dag droger gebruiken"],
    correctIndex: 1,
    explanation: "De verwarming lager zetten bespaart veel energie.",
  },
  {
    question: "Welke maaltijd heeft vaak een lagere CO2-impact?",
    options: ["Veel rundvlees", "Plantaardige maaltijd", "Elke dag fastfood", "Extra voedsel weggooien"],
    correctIndex: 1,
    explanation: "Plantaardige maaltijden hebben vaak minder land, water en uitstoot nodig.",
  },
  {
    question: "Wat is een goede manier om voedselverspilling te verminderen?",
    options: ["Restjes bewaren", "Meer kopen dan nodig", "Alles meteen weggooien", "Koelkast open laten"],
    correctIndex: 0,
    explanation: "Restjes bewaren voorkomt onnodige productie en afval.",
  },
  {
    question: "Wat is meestal duurzamer voor een korte rit in de stad?",
    options: ["Alleen met de auto", "Fiets of OV", "Motor stationair laten draaien", "Extra omrijden"],
    correctIndex: 1,
    explanation: "Fiets en OV verlagen de uitstoot per rit.",
  },
  {
    question: "Welke lamp gebruikt meestal minder stroom?",
    options: ["Gloeilamp", "LED-lamp", "Halogeenlamp", "Kapotte lamp"],
    correctIndex: 1,
    explanation: "LED-lampen gebruiken minder energie en gaan langer mee.",
  },
  {
    question: "Wat helpt tegen sluipverbruik?",
    options: ["Stekkers uitzetten", "Apparaten standby laten", "Meer opladers laten zitten", "Scherm altijd aan laten"],
    correctIndex: 0,
    explanation: "Stekkers of stekkerdozen uitzetten voorkomt onnodig stroomverbruik.",
  },
  {
    question: "Wat is beter voor spullen die nog te maken zijn?",
    options: ["Meteen vervangen", "Repareren", "Weggooien", "Dubbel nieuw kopen"],
    correctIndex: 1,
    explanation: "Repareren spaart grondstoffen en voorkomt extra productie.",
  },
]

const BAD_ACTIONS = [
  {
    id: "flight",
    title: "Vliegtuig pakken",
    description: "Een vliegreis zorgt voor een grote CO2-piek.",
    emissionKg: 180,
  },
  {
    id: "car-long",
    title: "Lange autorit",
    description: "Veel kilometers met de auto maken je bos droger.",
    emissionKg: 28,
  },
  {
    id: "meat-week",
    title: "Veel vlees eten",
    description: "Een week veel vlees eten verhoogt je voetafdruk.",
    emissionKg: 18,
  },
]

const SCENARIOS = [
  {
    id: "own",
    label: "Eigen data",
    weeklyEmission: null,
    damage: 0,
  },
  {
    id: "low",
    label: "Lage uitstoot",
    weeklyEmission: 55,
    damage: 0,
    status: "healthy",
    demoTrees: 8,
  },
  {
    id: "average",
    label: "Gemiddeld",
    weeklyEmission: 145,
    damage: 1,
    status: "recovering",
    demoTrees: 4,
  },
  {
    id: "high",
    label: "Hoge uitstoot",
    weeklyEmission: 210,
    damage: 2,
    status: "bad",
    demoTrees: 2,
  },
  {
    id: "extreme",
    label: "Extreem",
    weeklyEmission: 420,
    damage: 3,
    status: "critical",
    demoTrees: 0,
  },
]

const TREE_POSITIONS = [
  { left: 18, bottom: 18, size: 58 },
  { left: 37, bottom: 23, size: 72 },
  { left: 61, bottom: 20, size: 64 },
  { left: 78, bottom: 27, size: 78 },
  { left: 26, bottom: 34, size: 50 },
  { left: 50, bottom: 35, size: 84 },
  { left: 70, bottom: 38, size: 54 },
  { left: 12, bottom: 39, size: 46 },
  { left: 88, bottom: 16, size: 48 },
]

const CONFETTI = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  left: 12 + ((index * 17) % 78),
  delay: (index % 6) * 0.05,
  color: ["#1f8d3d", "#8bd64f", "#f8cf54", "#5ec7e8", "#f59ab0"][index % 5],
}))

function getSafeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

function roundKg(value) {
  return Number(getSafeNumber(value).toFixed(1))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function readJsonStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // De pagina blijft bruikbaar als localStorage niet beschikbaar is.
  }
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getPreviousDateKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() - 1)
  return getTodayKey(date)
}

function getBattleRewardKey(dateKey = getTodayKey()) {
  return `forestBattleCompleted_${dateKey}`
}

function hasBattleRewardToday() {
  try {
    return localStorage.getItem(getBattleRewardKey()) === "true"
  } catch {
    return false
  }
}

function markBattleRewardToday() {
  try {
    localStorage.setItem(getBattleRewardKey(), "true")
  } catch {
    // Battle blijft speelbaar als localStorage niet beschikbaar is.
  }
}

function getRecoveryBonus() {
  try {
    return getSafeNumber(localStorage.getItem("forestRecoveryBonus"), 0)
  } catch {
    return 0
  }
}

function increaseRecoveryBonus(amount) {
  try {
    localStorage.setItem("forestRecoveryBonus", String(getRecoveryBonus() + amount))
  } catch {
    // Alleen de visuele bonus valt dan weg; de battle blijft werken.
  }
}

function getWeeklyGoal() {
  try {
    return getSafeNumber(localStorage.getItem("weekly-goal"), DEFAULT_WEEKLY_GOAL) || DEFAULT_WEEKLY_GOAL
  } catch {
    return DEFAULT_WEEKLY_GOAL
  }
}

function getLocalImpactData() {
  const profileAnswers = readJsonStorage("profile-questionnaire", {})
  const weeklyHistory = readJsonStorage("weekly-questionnaire-history", [])
  const weeklyAnswers = Array.isArray(weeklyHistory) ? weeklyHistory[0]?.answers || {} : {}
  const legacyAnswers = readJsonStorage("answers", {})
  const impactHistory = readJsonStorage("impact-history", [])
  const fallbackProfile = Object.keys(profileAnswers).length > 0 ? profileAnswers : legacyAnswers

  try {
    const snapshot = buildImpactSnapshot(fallbackProfile, weeklyAnswers)
    const latestHistory = Array.isArray(impactHistory) ? impactHistory[0] || {} : {}

    return {
      weeklyEmission: getSafeNumber(latestHistory.weeklyEmission || latestHistory.totalImpact || snapshot.weeklyEmission),
      dailyEmission: getSafeNumber(latestHistory.dailyEmission),
    }
  } catch {
    return {
      weeklyEmission: 0,
      dailyEmission: 0,
    }
  }
}

function getForestOwnerName(user = auth.currentUser) {
  const localName = getProfileUsername()
  const firebaseName = user?.displayName || ""
  const emailName = user?.email?.split("@")[0] || ""
  const resolvedName = String(localName || firebaseName || emailName || "").trim()

  return resolvedName || "jou"
}

function getForestScore(weeklyEmission, weeklyGoal, completedCount) {
  const goal = Math.max(1, weeklyGoal)
  const dataScore = Math.round(((goal - weeklyEmission) / goal) * 100 + 70)
  const actionBonus = completedCount * 3

  return clamp(dataScore + actionBonus, 0, 100)
}

function getForestStatus(score, completedCount, damageCount) {
  if (damageCount >= 3 || score < 20) {
    return {
      id: "critical",
      label: "Kritiek bos",
      title: "Kritiek bos",
      message: "Je bos is zwaar beschadigd door hoge uitstoot.",
    }
  }

  if (damageCount >= 2 || score < 45) {
    return {
      id: "bad",
      label: "Slecht bos",
      title: "Slecht bos",
      message: "Je uitstoot is hoog. Het bos wordt grauw en beschadigd.",
    }
  }

  if (completedCount === 0) {
    return {
      id: "empty",
      label: "Start je bos",
      title: "Het bos is nog leeg",
      message: "Voltooi een CO2-actie om je eerste boom te planten.",
    }
  }

  if (score >= 80) {
    return {
      id: "healthy",
      label: "Gezond bos",
      title: "Gezond bos",
      message: "Je bos leeft goed. Je zit onder je weekdoel.",
    }
  }

  if (score >= 55) {
    return {
      id: "recovering",
      label: "Herstellend bos",
      title: "Herstellend bos",
      message: "Je bos groeit rustig verder door je duurzame acties.",
    }
  }

  return {
    id: "vulnerable",
    label: "Kwetsbaar bos",
    title: "Kwetsbaar bos",
    message: "Voltooi acties om je bos weer groener te maken.",
  }
}

function getScenarioStatus(statusId) {
  if (statusId === "healthy") {
    return {
      id: "healthy",
      label: "Gezond bos",
      title: "Gezond bos",
      message: "Lage uitstoot zorgt voor meer groen, bloemen en bomen.",
    }
  }

  if (statusId === "recovering") {
    return {
      id: "recovering",
      label: "Herstellend bos",
      title: "Herstellend bos",
      message: "Gemiddelde uitstoot: het bos leeft, maar heeft aandacht nodig.",
    }
  }

  if (statusId === "bad") {
    return {
      id: "bad",
      label: "Slecht bos",
      title: "Slecht bos",
      message: "Hoge uitstoot maakt het bos droog, grijs en beschadigd.",
    }
  }

  if (statusId === "critical") {
    return {
      id: "critical",
      label: "Kritiek bos",
      title: "Kritiek bos",
      message: "Extreme uitstoot veroorzaakt vuur, rook en bijna geen leven.",
    }
  }

  return null
}

function getDisplayTreeCount({ scenario, completedCount, statusId }) {
  if (typeof scenario.demoTrees === "number") {
    return scenario.demoTrees
  }

  if (statusId === "critical") return Math.min(completedCount, 1)
  if (statusId === "bad") return Math.min(completedCount, 3)
  return completedCount
}

function getStoredGame() {
  const stored = readJsonStorage(STORAGE_KEY, {})
  const completedIds = Array.isArray(stored.completedIds) ? stored.completedIds : []
  const badIds = Array.isArray(stored.badIds) ? stored.badIds : []
  const purchasedCosmetics = Array.isArray(stored.purchasedCosmetics) ? stored.purchasedCosmetics : []
  const unlockedAchievements = Array.isArray(stored.unlockedAchievements) ? stored.unlockedAchievements : []
  const tokens = getSafeNumber(stored.tokens, 0)
  const xp = getSafeNumber(stored.xp, 0)
  const seeds = getSafeNumber(stored.seeds, 0)
  const streak = getSafeNumber(stored.streak, 0)
  const prestige = getSafeNumber(stored.prestige, 0)
  const battlePoints = getSafeNumber(stored.battlePoints, 0)
  const dailyCompletedCount = getSafeNumber(stored.dailyCompletedCount, 0)
  const season = SEASONS.some((item) => item.id === stored.season) ? stored.season : "spring"

  return {
    completedIds,
    badIds,
    purchasedCosmetics,
    unlockedAchievements,
    tokens,
    xp,
    seeds,
    streak,
    prestige,
    battlePoints,
    dailyCompletedCount,
    dailyCompletedDate: stored.dailyCompletedDate || "",
    lastLoginDate: stored.lastLoginDate || "",
    season,
  }
}

function getLevelFromXp(xp) {
  return Math.max(1, Math.floor(getSafeNumber(xp, 0) / 100) + 1)
}

function getXpProgress(xp) {
  return Math.round(getSafeNumber(xp, 0) % 100)
}

function getPrestigeMultiplier(prestige) {
  return Number((1 + getSafeNumber(prestige, 0) * 0.1).toFixed(1))
}

function getUnlockedAchievements({ completedActions, savedKg, game, purchasedCount, level }) {
  const earnedContext = {
    completedCount: completedActions.length,
    savedKg,
    purchasedCount,
    level,
    streak: game.streak,
    prestige: game.prestige,
  }
  const earnedIds = ACHIEVEMENTS.filter((achievement) => achievement.check(earnedContext)).map(
    (achievement) => achievement.id
  )

  return Array.from(new Set([...(game.unlockedAchievements || []), ...earnedIds]))
}

function ForestVisualization() {
  const [game, setGame] = useState(getStoredGame)
  const [activeTab, setActiveTab] = useState("active")
  const [scenarioId, setScenarioId] = useState("own")
  const [toast, setToast] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showRecoveryPulse, setShowRecoveryPulse] = useState(false)
  const [isBattleOpen, setIsBattleOpen] = useState(false)
  const [battle, setBattle] = useState({
    enemyHp: 100,
    questionIndex: 0,
    elapsedSeconds: 0,
    feedback: "",
    explanation: "",
    won: false,
    rewardGranted: false,
  })
  const [ownerName, setOwnerName] = useState(() => getForestOwnerName())

  const forestTitle = `Bos van ${ownerName}`
  const impactData = useMemo(() => getLocalImpactData(), [])
  const weeklyGoal = useMemo(() => getWeeklyGoal(), [])
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[0]
  const completedActions = useMemo(
    () => ACTIONS.filter((action) => game.completedIds.includes(action.id)),
    [game.completedIds]
  )
  const completedBadActions = useMemo(
    () => BAD_ACTIONS.filter((action) => game.badIds.includes(action.id)),
    [game.badIds]
  )
  const activeBadActions = useMemo(
    () => BAD_ACTIONS.filter((action) => !game.badIds.includes(action.id)),
    [game.badIds]
  )
  const activeActions = useMemo(
    () => ACTIONS.filter((action) => !game.completedIds.includes(action.id)),
    [game.completedIds]
  )
  const purchasedShopItems = useMemo(
    () => SHOP_ITEMS.filter((item) => game.purchasedCosmetics.includes(item.id)),
    [game.purchasedCosmetics]
  )
  const visibleActions = activeTab === "active" ? activeActions : completedActions
  const savedKg = roundKg(completedActions.reduce((total, action) => total + action.savedKg, 0))
  const badKg = roundKg(completedBadActions.reduce((total, action) => total + action.emissionKg, 0))
  const level = getLevelFromXp(game.xp)
  const xpProgress = getXpProgress(game.xp)
  const prestigeMultiplier = getPrestigeMultiplier(game.prestige)
  const unlockedAchievementIds = getUnlockedAchievements({
    completedActions,
    savedKg,
    game,
    purchasedCount: purchasedShopItems.length,
    level,
  })
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) =>
    unlockedAchievementIds.includes(achievement.id)
  )
  const visibleWildlife = WILDLIFE.filter((animal) => completedActions.length >= animal.threshold)
  const todayCompletedCount =
    game.dailyCompletedDate === getTodayKey() ? getSafeNumber(game.dailyCompletedCount, 0) : 0
  const dailyQuests = [
    {
      id: "daily-action",
      title: "Voltooi 1 duurzame actie",
      progress: Math.min(todayCompletedCount, 1),
      total: 1,
    },
    {
      id: "daily-tokens",
      title: "Verdien 25 tokens",
      progress: Math.min(game.tokens, 25),
      total: 25,
    },
    {
      id: "weekly-green",
      title: "Plant 3 bomen deze ronde",
      progress: Math.min(completedActions.length, 3),
      total: 3,
    },
  ]
  const dataWeeklyEmission = roundKg(impactData.weeklyEmission || weeklyGoal * 0.68)
  const weeklyEmission = roundKg((scenario.weeklyEmission ?? dataWeeklyEmission) + (scenarioId === "own" ? badKg : 0))
  const damageCount = Math.max(completedBadActions.length, scenario.damage)
  const recoveryBonus = getRecoveryBonus()
  const score = clamp(
    getForestScore(weeklyEmission, weeklyGoal, completedActions.length) - damageCount * 12 + recoveryBonus,
    0,
    100
  )
  const progress = Math.round((completedActions.length / ACTIONS.length) * 100)
  const scenarioStatus = scenarioId === "own" ? null : getScenarioStatus(scenario.status)
  const status = scenarioStatus || getForestStatus(score, completedActions.length, damageCount)
  const canStartBattle = ["vulnerable", "bad", "critical"].includes(status.id) || score < 65
  const battleRewardDoneToday = hasBattleRewardToday()
  const remainingProgress = Math.max(0, 100 - progress)
  const displayTreeCount = getDisplayTreeCount({
    scenario,
    completedCount: completedActions.length,
    statusId: status.id,
  })
  const visibleTrees = Array.from({ length: displayTreeCount }, (_, index) => {
    return completedActions[index] || {
      id: `demo-tree-${scenarioId}-${index}`,
      title: scenarioId === "low" ? "Extra groene boom" : "Voorbeeldboom",
      savedKg: 0,
      isDemo: true,
    }
  })

  useEffect(() => {
    writeJsonStorage(STORAGE_KEY, game)
  }, [game])

  useEffect(() => {
    const today = getTodayKey()
    const rewardTimerId = window.setTimeout(() => {
      setGame((current) => {
        if (current.lastLoginDate === today) return current

        const yesterday = getPreviousDateKey(today)
        const nextStreak = current.lastLoginDate === yesterday ? getSafeNumber(current.streak, 0) + 1 : 1

        setToast({
          emoji: "🎁",
          title: "Dagelijkse beloning!",
          message: `Je streak is nu ${nextStreak} dag${nextStreak === 1 ? "" : "en"}. Je krijgt 5 tokens en 1 zaadje.`,
          detail: "Terugkomen helpt om duurzame keuzes vol te houden.",
        })
        window.setTimeout(() => setToast(null), 4200)

        return {
          ...current,
          tokens: getSafeNumber(current.tokens, 0) + 5,
          seeds: getSafeNumber(current.seeds, 0) + 1,
          streak: nextStreak,
          lastLoginDate: today,
        }
      })
    }, 0)

    return () => window.clearTimeout(rewardTimerId)
  }, [])

  useEffect(() => {
    return watchAuthState((user) => {
      setOwnerName(getForestOwnerName(user))
    })
  }, [])

  useEffect(() => {
    if (!isBattleOpen || battle.won) return undefined

    const timerId = window.setInterval(() => {
      setBattle((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [battle.won, isBattleOpen])

  function completeAction(action) {
    if (game.completedIds.includes(action.id)) return

    const nextTreeCount = game.completedIds.length + 1
    const treeLabel = nextTreeCount === 1 ? "boom" : "bomen"
    const tokenReward = Math.round(action.tokens * prestigeMultiplier)
    const xpReward = Math.round((action.tokens + action.savedKg * 10) * prestigeMultiplier)
    const today = getTodayKey()

    setGame((current) => ({
      ...current,
      completedIds: [...current.completedIds, action.id],
      tokens: getSafeNumber(current.tokens, 0) + tokenReward,
      xp: getSafeNumber(current.xp, 0) + xpReward,
      seeds: getSafeNumber(current.seeds, 0) + (nextTreeCount % 3 === 0 ? 1 : 0),
      dailyCompletedCount:
        current.dailyCompletedDate === today ? getSafeNumber(current.dailyCompletedCount, 0) + 1 : 1,
      dailyCompletedDate: today,
    }))
    const bonus =
      nextTreeCount === 3
        ? " Bonus: je bos krijgt extra bloemen."
        : nextTreeCount === 6
          ? " Bonus: je bos is volledig groen."
          : ""

    setToast({
      emoji: "😊",
      title: "Nieuwe boom geplant!",
      message: `${action.compliment} Je hebt ${nextTreeCount} ${treeLabel} geplant, ${roundKg(action.savedKg)} kg CO2 bespaard, ${tokenReward} tokens en ${xpReward} XP verdiend.${bonus}`,
      detail: action.impact,
    })
    setShowConfetti(true)

    window.setTimeout(() => setShowConfetti(false), 1300)
    window.setTimeout(() => setToast(null), 3600)
  }

  function resetGame() {
    setGame((current) => ({
      ...current,
      completedIds: [],
      badIds: [],
      purchasedCosmetics: [],
      unlockedAchievements: unlockedAchievementIds,
      tokens: 0,
      xp: 0,
      seeds: 0,
      dailyCompletedCount: 0,
      dailyCompletedDate: "",
    }))
    setActiveTab("active")
    setScenarioId("own")
    setToast({
      emoji: "🌱",
      title: "Spel gereset",
      message: "Je bos is klaar voor een nieuwe ronde.",
    })
    setShowConfetti(false)
    window.setTimeout(() => setToast(null), 3000)
  }

  function completeBadAction(action) {
    if (game.badIds.includes(action.id)) return

    setGame((current) => ({
      ...current,
      badIds: [...current.badIds, action.id],
    }))
    setToast({
      emoji: "⚠️",
      title: "Bos beschadigd",
      message: `${action.title} voegt ${action.emissionKg} kg CO2 toe in dit voorbeeld.`,
      detail: "Dit laat zien dat grote uitstootpieken je bosstatus snel kunnen verslechteren.",
    })
    window.setTimeout(() => setToast(null), 3600)
  }

  function buyShopItem(item) {
    if (game.purchasedCosmetics.includes(item.id) || game.tokens < item.cost) return

    setGame((current) => ({
      ...current,
      tokens: getSafeNumber(current.tokens, 0) - item.cost,
      purchasedCosmetics: [...(current.purchasedCosmetics || []), item.id],
    }))
    setToast({
      emoji: "🎉",
      title: `${item.title} gekocht!`,
      message: "Je hebt je verdiende tokens gebruikt voor een cosmetische beloning.",
      detail: "Deze beloning verandert je echte uitstoot niet, maar maakt je bos persoonlijker.",
    })
    setShowConfetti(true)
    window.setTimeout(() => setShowConfetti(false), 1300)
    window.setTimeout(() => setToast(null), 4200)
  }

  function changeSeason(seasonId) {
    setGame((current) => ({
      ...current,
      season: seasonId,
    }))
  }

  function prestigeReset() {
    if (level < 5) {
      setToast({
        emoji: "⭐",
        title: "Prestige nog gesloten",
        message: "Bereik level 5 om prestige te starten.",
        detail: "Prestige reset je bomen en level, maar behoudt achievements en geeft een permanente 1.1x bonus.",
      })
      window.setTimeout(() => setToast(null), 4200)
      return
    }

    setGame((current) => ({
      ...current,
      completedIds: [],
      badIds: [],
      purchasedCosmetics: [],
      tokens: 0,
      xp: 0,
      prestige: getSafeNumber(current.prestige, 0) + 1,
      unlockedAchievements: unlockedAchievementIds,
    }))
    setToast({
      emoji: "⭐",
      title: `Prestige ${game.prestige + 1} gestart!`,
      message: "Je bos begint opnieuw, maar je achievements blijven bewaard.",
      detail: `Je permanente CO2-gamebonus wordt nu ${getPrestigeMultiplier(game.prestige + 1)}x.`,
    })
    setShowConfetti(true)
    window.setTimeout(() => setShowConfetti(false), 1300)
    window.setTimeout(() => setToast(null), 4600)
  }

  function startBattle() {
    setBattle({
      enemyHp: 100,
      questionIndex: 0,
      elapsedSeconds: 0,
      feedback: battleRewardDoneToday
        ? "Vandaag al voltooid. Je kunt oefenen, maar krijgt geen extra beloning."
        : "",
      explanation: "",
      won: false,
      rewardGranted: false,
    })
    setIsBattleOpen(true)
  }

  function closeBattle() {
    setIsBattleOpen(false)
  }

  function answerBattle(optionIndex) {
    if (battle.won) return

    const question = BATTLE_QUESTIONS[battle.questionIndex % BATTLE_QUESTIONS.length]
    const isCorrect = optionIndex === question.correctIndex
    let damage = 0

    if (isCorrect && battle.elapsedSeconds <= 5) {
      damage = 25
    } else if (isCorrect && battle.elapsedSeconds <= 10) {
      damage = 15
    } else if (isCorrect) {
      damage = 10
    }

    const nextHp = clamp(battle.enemyHp - damage, 0, 100)
    const won = nextHp === 0
    const rewardAllowed = won && !hasBattleRewardToday()

    if (rewardAllowed) {
      markBattleRewardToday()
      increaseRecoveryBonus(5)
      setGame((current) => ({
        ...current,
        battlePoints: getSafeNumber(current.battlePoints, 0) + 20,
        tokens: getSafeNumber(current.tokens, 0) + 20,
        xp: getSafeNumber(current.xp, 0) + 30,
      }))
      setShowRecoveryPulse(true)
      setShowConfetti(true)
      window.setTimeout(() => setShowRecoveryPulse(false), 1800)
      window.setTimeout(() => setShowConfetti(false), 1300)
    }

    setBattle((current) => ({
      ...current,
      enemyHp: nextHp,
      feedback: isCorrect
        ? damage === 25
          ? "Goed! 25 damage"
          : damage === 15
            ? "Goed! 15 damage"
            : "Te laat, maar goed! 10 damage"
        : "Helaas, geen damage",
      explanation: question.explanation,
      won,
      rewardGranted: rewardAllowed,
      questionIndex: won ? current.questionIndex : current.questionIndex + 1,
      elapsedSeconds: 0,
    }))
  }

  return (
    <div className="forest-clean-page">
      <section className="forest-progress-card" aria-label="Bos voortgang">
        <div>
          <span className="forest-kicker">{forestTitle}</span>
          <h1>{status.title}</h1>
          <p>{status.message}</p>
        </div>
        <div className="forest-score-pill" aria-label={`Bos score ${score} van 100`}>
          {score}/100
        </div>
        <div className="forest-token-pill" aria-label={`${game.tokens} bostokens`}>
          🪙 {game.tokens}
        </div>
        <div className="forest-progress-track" aria-label="Bos voortgang">
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>Nog {remainingProgress}% te gaan</small>
      </section>

      <section className="forest-game-stats-card" aria-label="Game voortgang">
        <div className="forest-stat-grid">
          <div>
            <span>Level</span>
            <strong>{level}</strong>
            <small>{xpProgress}/100 XP</small>
          </div>
          <div>
            <span>Streak</span>
            <strong>{game.streak}</strong>
            <small>dagen actief</small>
          </div>
          <div>
            <span>Zaadjes</span>
            <strong>{game.seeds}</strong>
            <small>collectibles</small>
          </div>
          <div>
            <span>Prestige</span>
            <strong>★{game.prestige}</strong>
            <small>{prestigeMultiplier}x bonus</small>
          </div>
          <div>
            <span>Bospunten</span>
            <strong>{game.battlePoints}</strong>
            <small>battle reward</small>
          </div>
        </div>
        <div className="forest-xp-track" aria-label="XP voortgang">
          <span style={{ width: `${xpProgress}%` }} />
        </div>
        <button type="button" className="forest-prestige-button" onClick={prestigeReset}>
          Prestige reset
        </button>
      </section>

      <section className="forest-scenarios-card" aria-label="Voorbeeldscenario's">
        <div>
          <span className="forest-kicker">Voorbeelden</span>
          <h2>Uitstoot preview</h2>
        </div>
        <div className="forest-scenario-buttons">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={scenarioId === item.id ? "is-active" : ""}
              onClick={() => setScenarioId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="forest-card" aria-label={`${forestTitle} visualisatie`}>
        <div className="forest-card-header">
          <div>
            <span className="forest-kicker">Visualisatie</span>
            <h2>{forestTitle}</h2>
          </div>
          <button type="button" className="forest-reset-button" onClick={resetGame}>
            Reset Spel
          </button>
        </div>

        <div className={`simple-forest-scene scene--${status.id} season--${game.season}`}>
          {status.id !== "bad" && status.id !== "critical" && <span className="simple-sun" />}
          <span className="simple-cloud cloud-left" />
          <span className="simple-cloud cloud-right" />
          <span className="simple-cloud cloud-small" />
          {showRecoveryPulse && (
            <>
              <span className="battle-recovery-glow" />
              <span className="battle-rain-drop rain-one" />
              <span className="battle-rain-drop rain-two" />
              <span className="battle-rain-drop rain-three" />
            </>
          )}
          {purchasedShopItems.map((item) => (
            <span
              key={item.id}
              className={`forest-cosmetic ${item.className}`}
              aria-hidden="true"
            />
          ))}
          {visibleWildlife.map((animal, index) => (
            <span
              key={animal.id}
              className={`forest-wildlife ${animal.className}`}
              style={{ animationDelay: `${index * 0.18}s` }}
              aria-label={animal.label}
            />
          ))}
          {(status.id === "bad" || status.id === "critical") && (
            <>
              <span className="dead-tree dead-left" />
              <span className="dead-tree dead-right" />
              <span className="fire-patch fire-main" />
              <span className="fire-patch fire-small" />
              <span className="smoke-puff smoke-one" />
              <span className="smoke-puff smoke-two" />
              <span className="bone bone-one" />
              <span className="bone bone-two" />
            </>
          )}
          <div className="simple-forest-message">
            {status.id === "bad" || status.id === "critical" ? (
              <>
                <strong>{status.title}</strong>
                <span>{badKg > 0 ? `${badKg} kg extra uitstoot` : "Voorbeeld van hoge uitstoot"}</span>
              </>
            ) : completedActions.length === 0 ? (
              <>
                <strong>Het bos van {ownerName} is nog leeg</strong>
                <span>Voltooi acties om bomen te planten.</span>
              </>
            ) : (
              <>
                <strong>
                  {displayTreeCount} {displayTreeCount === 1 ? "boom" : "bomen"} zichtbaar
                </strong>
                <span>
                  {scenarioId === "own"
                    ? `${savedKg} kg CO2 bespaard`
                    : `${status.label} voorbeeld`}
                </span>
              </>
            )}
          </div>
          <div className="simple-grass" />
          <div className="simple-tree-layer" aria-label="Geplante bomen">
            {visibleTrees.map((action, index) => {
              const tree = TREE_POSITIONS[index % TREE_POSITIONS.length]

              return (
                <button
                  key={action.id}
                  type="button"
                  className="simple-tree"
                  style={{
                    left: `${tree.left}%`,
                    bottom: `${tree.bottom}%`,
                    width: `${tree.size}px`,
                    height: `${tree.size}px`,
                    animationDelay: `${index * 0.08}s`,
                  }}
                  aria-label={`${action.title}: ${action.savedKg} kg CO2 bespaard`}
                  onClick={() =>
                    setToast({
                      title: action.title,
                      message: action.isDemo
                        ? "Deze boom hoort bij het gekozen previewscenario."
                        : `Deze boom staat voor ${action.savedKg} kg CO2 besparing.`,
                    })
                  }
                >
                  <span />
                </button>
              )
            })}
          </div>

          {showConfetti && (
            <div className="simple-confetti" aria-hidden="true">
              {CONFETTI.map((piece) => (
                <span
                  key={piece.id}
                  style={{
                    left: `${piece.left}%`,
                    animationDelay: `${piece.delay}s`,
                    background: piece.color,
                  }}
                />
              ))}
            </div>
          )}
          {(status.id === "healthy" || scenarioId === "low") && (
            <div className="happy-nature" aria-hidden="true">
              <span className="flower-dot flower-a" />
              <span className="flower-dot flower-b" />
              <span className="flower-dot flower-c" />
              <span className="butterfly-dot butterfly-a" />
              <span className="butterfly-dot butterfly-b" />
            </div>
          )}
        </div>
      </section>

      {canStartBattle && (
        <section className="forest-actions-card forest-battle-card" aria-label="Herstelbattle">
          <div className="forest-actions-heading">
            <div>
              <span className="forest-kicker">Minigame</span>
              <h2>Herstelbattle</h2>
              <p className="forest-action-explainer">
                Versla de Afvalbaas met snelle duurzame quizantwoorden.
              </p>
            </div>
            <strong>{battleRewardDoneToday ? "Oefenen" : "+20"}</strong>
          </div>
          <button type="button" className="forest-battle-start" onClick={startBattle}>
            Start herstelbattle
          </button>
          {battleRewardDoneToday ? (
            <p className="forest-battle-note">Vandaag al voltooid. Oefenen kan nog, maar zonder extra punten.</p>
          ) : null}
        </section>
      )}

      <section className="forest-actions-card forest-quests-card" aria-label="Dagelijkse quests">
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Quests</span>
            <h2>Dagelijkse missies</h2>
            <p className="forest-action-explainer">Voltooi quests voor extra motivatie, streaks en collectibles.</p>
          </div>
          <strong>{dailyQuests.filter((quest) => quest.progress >= quest.total).length}/3</strong>
        </div>
        <div className="forest-quest-list">
          {dailyQuests.map((quest) => {
            const done = quest.progress >= quest.total

            return (
              <article key={quest.id} className={`forest-quest-card${done ? " is-done" : ""}`}>
                <span>{quest.title}</span>
                <strong>{done ? "Klaar" : `${quest.progress}/${quest.total}`}</strong>
              </article>
            )
          })}
        </div>
      </section>

      <section className="forest-actions-card forest-achievements-card" aria-label="Achievements en seizoenen">
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Badges</span>
            <h2>Achievements</h2>
            <p className="forest-action-explainer">Badges blijven bewaard, ook na prestige.</p>
          </div>
          <strong>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</strong>
        </div>
        <div className="forest-achievement-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedAchievementIds.includes(achievement.id)

            return (
              <article key={achievement.id} className={`forest-achievement-card${unlocked ? " is-unlocked" : ""}`}>
                <strong>{unlocked ? "🏅" : "🔒"} {achievement.title}</strong>
                <span>{achievement.description}</span>
              </article>
            )
          })}
        </div>
        <div className="forest-season-panel">
          <span className="forest-kicker">Seizoen</span>
          <div className="forest-season-buttons">
            {SEASONS.map((season) => (
              <button
                key={season.id}
                type="button"
                className={game.season === season.id ? "is-active" : ""}
                onClick={() => changeSeason(season.id)}
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="forest-actions-card" aria-label="CO2 Besparende Acties">
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Acties</span>
            <h2>CO2 Besparende Acties</h2>
            <p className="forest-action-explainer">Elke voltooide actie plant zichtbaar een boom in je bos.</p>
          </div>
          <strong>{savedKg} kg</strong>
        </div>

        <div className="forest-tabs" role="tablist" aria-label="Actief of voltooid">
          <button
            type="button"
            className={activeTab === "active" ? "is-active" : ""}
            onClick={() => setActiveTab("active")}
          >
            Actief ({activeActions.length})
          </button>
          <button
            type="button"
            className={activeTab === "completed" ? "is-active" : ""}
            onClick={() => setActiveTab("completed")}
          >
            Voltooid ({completedActions.length})
          </button>
        </div>

        <div className="forest-action-list">
          {visibleActions.length === 0 ? (
            <p className="forest-empty-actions">
              {activeTab === "active"
                ? "Alle acties zijn voltooid. Reset het spel om opnieuw te oefenen."
                : "Je hebt nog geen acties voltooid."}
            </p>
          ) : (
            visibleActions.map((action) => {
              const completed = game.completedIds.includes(action.id)

              return (
                <article key={action.id} className={`forest-action-card${completed ? " is-done" : ""}`}>
                  <div>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                    <span>{action.savedKg} kg CO2 besparing</span>
                    <small>+{action.tokens} tokens</small>
                  </div>
                  <button
                    type="button"
                    disabled={completed}
                    onClick={() => completeAction(action)}
                  >
                    {completed ? "Voltooid" : "Voltooien"}
                  </button>
                </article>
              )
            })
          )}
        </div>
      </section>

      <section className="forest-actions-card forest-shop-card" aria-label="Bostoken shop">
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Shop</span>
            <h2>Bostoken Shop</h2>
            <p className="forest-action-explainer">Verdien tokens met goede acties en koop cosmetische upgrades voor je bos.</p>
          </div>
          <strong>🪙 {game.tokens}</strong>
        </div>

        <div className="forest-shop-grid">
          {SHOP_ITEMS.map((item) => {
            const purchased = game.purchasedCosmetics.includes(item.id)
            const affordable = game.tokens >= item.cost

            return (
              <article key={item.id} className={`forest-shop-item${purchased ? " is-owned" : ""}`}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>{purchased ? "Gekocht" : `${item.cost} tokens`}</span>
                </div>
                <button
                  type="button"
                  disabled={purchased || !affordable}
                  onClick={() => buyShopItem(item)}
                >
                  {purchased ? "In bezit" : affordable ? "Koop" : "Spaar"}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="forest-actions-card danger-actions-card" aria-label="Slechte voorbeeldacties">
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Slechte acties</span>
            <h2>Wat maakt je bos kapot?</h2>
            <p className="forest-action-explainer">Deze voorbeelden maken de scene donkerder en beschadigen je bos.</p>
          </div>
          <strong>+{badKg} kg</strong>
        </div>

        <div className="forest-action-list">
          {activeBadActions.length === 0 ? (
            <p className="forest-empty-actions">Alle slechte voorbeeldacties zijn toegepast. Reset het spel om opnieuw te testen.</p>
          ) : (
            activeBadActions.map((action) => (
              <article key={action.id} className="forest-action-card bad-action-card">
                <div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <span>+{action.emissionKg} kg CO2 uitstoot</span>
                </div>
                <button type="button" onClick={() => completeBadAction(action)}>
                  Test schade
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {toast && (
        <div className="forest-toast" role="status">
          <strong>
            {toast.emoji ? <span className="forest-toast-emoji">{toast.emoji}</span> : null}
            {toast.title}
          </strong>
          <span>{toast.message}</span>
          {toast.detail ? <small>{toast.detail}</small> : null}
        </div>
      )}

      {isBattleOpen && (
        <div className="battle-modal-backdrop" role="dialog" aria-modal="true" aria-label="Herstelbattle">
          <section className="battle-modal">
            <div className="battle-modal-header">
              <div>
                <span className="forest-kicker">Quiz battle</span>
                <h2>Herstelbattle</h2>
              </div>
              <button type="button" onClick={closeBattle} aria-label="Sluit herstelbattle">
                ×
              </button>
            </div>

            <div className="battle-enemy">
              <div className="battle-enemy-sprite" aria-hidden="true">
                <span />
              </div>
              <div>
                <strong>Afvalbaas</strong>
                <div className="battle-hp-track" aria-label={`Afvalbaas HP ${battle.enemyHp}`}>
                  <span style={{ width: `${battle.enemyHp}%` }} />
                </div>
                <small>{battle.enemyHp}/100 HP</small>
              </div>
            </div>

            {battle.won ? (
              <div className="battle-win-panel">
                <strong>Je hebt de Afvalbaas verslagen!</strong>
                <p>
                  {battle.rewardGranted
                    ? "Je bos krijgt +20 bospunten, +20 tokens en een herstelboost."
                    : "Vandaag had je de beloning al gekregen, maar je hebt goed geoefend."}
                </p>
                <button type="button" onClick={closeBattle}>
                  Terug naar het bos
                </button>
              </div>
            ) : (
              <>
                <div className="battle-timer">
                  <span style={{ width: `${clamp((battle.elapsedSeconds / 15) * 100, 0, 100)}%` }} />
                </div>
                <p className="battle-timer-label">{battle.elapsedSeconds}s</p>
                <h3>{BATTLE_QUESTIONS[battle.questionIndex % BATTLE_QUESTIONS.length].question}</h3>
                <div className="battle-options">
                  {BATTLE_QUESTIONS[battle.questionIndex % BATTLE_QUESTIONS.length].options.map(
                    (option, index) => (
                      <button key={option} type="button" onClick={() => answerBattle(index)}>
                        {option}
                      </button>
                    )
                  )}
                </div>
                {battle.feedback ? (
                  <div className="battle-feedback">
                    <strong>{battle.feedback}</strong>
                    <span>{battle.explanation}</span>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default ForestVisualization
