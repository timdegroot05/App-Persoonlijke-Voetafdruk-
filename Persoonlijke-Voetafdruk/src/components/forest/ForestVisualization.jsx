import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { LuLeaf } from "react-icons/lu"
import { buildImpactSnapshot } from "../../utils/impactInsights"
import { getProfileUsername } from "../../utils/questionnaireStorage"
import { auth } from "../../firebase"
import { watchAuthState } from "../../authState"
import { getForestOverview } from "../../utils/forestState"
import {
  formatWeekRangeLabel,
  getStoredWeeklyResults,
  getWeeklyCheckinWeekInfo,
  hasWeeklyResultForWeek,
} from "../../utils/weeklyResults"
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
    id: "forest-lanterns",
    title: "Boslampjes",
    description: "Warme lichtjes voor avond en nacht.",
    cost: 30,
    className: "cosmetic-forest-lanterns",
    battleEffect: "Battle start met +10 HP.",
    battleBonus: { maxHp: 10 },
  },
  {
    id: "birdhouse",
    title: "Vogelhuisje",
    description: "Een gezellige plek voor vogels.",
    cost: 40,
    className: "cosmetic-birdhouse",
  },
  {
    id: "water-fountain",
    title: "Waterbron",
    description: "Een frisse waterplek die herstel laat zien.",
    cost: 45,
    className: "cosmetic-water-fountain",
    battleEffect: "Vervuiling doet 2 minder schade.",
    battleBonus: { defense: 2 },
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
  {
    id: "windmill",
    title: "Mini windmolen",
    description: "Laat duurzame energie in je bos zien.",
    cost: 50,
    className: "cosmetic-windmill",
    battleEffect: "Goede antwoorden doen +3 damage.",
    battleBonus: { damage: 3 },
  },
  {
    id: "bee-hotel",
    title: "Bijenhotel",
    description: "Meer leven rond bloemen en planten.",
    cost: 32,
    className: "cosmetic-bee-hotel",
  },
  {
    id: "battle-banner",
    title: "Herstelvaandel",
    description: "Een vaandel voor je herstelbattle.",
    cost: 60,
    className: "cosmetic-battle-banner",
    battleEffect: "Battle start met +5 HP en +2 damage.",
    battleBonus: { maxHp: 5, damage: 2 },
  },
  {
    id: "moon-stone",
    title: "Maansteen",
    description: "Geeft je nachtelijke bos extra sfeer.",
    cost: 48,
    className: "cosmetic-moon-stone",
    battleEffect: "Vervuiling doet 1 minder schade.",
    battleBonus: { defense: 1 },
  },
]

const GACHA_ITEMS = [
  {
    id: "golden-seed",
    title: "Gouden zaadje",
    rarity: "Zeldzaam",
    emoji: "🌟",
  },
  {
    id: "tiny-frog",
    title: "Poelkikker",
    rarity: "Gewoon",
    emoji: "🐸",
  },
  {
    id: "blue-butterfly",
    title: "Blauwe vlinder",
    rarity: "Ongewoon",
    emoji: "🦋",
  },
  {
    id: "forest-owl",
    title: "Bosuil",
    rarity: "Zeldzaam",
    emoji: "🦉",
  },
  {
    id: "moss-stone",
    title: "Mossteen",
    rarity: "Gewoon",
    emoji: "🪨",
  },
]

const BATTLE_BOSSES = [
  {
    id: "trash-boss",
    name: "Afvalbaas",
    hp: 100,
    attack: 8,
    rewardTokens: 22,
    rewardPoints: 20,
    rewardXp: 30,
    className: "boss-trash",
  },
  {
    id: "smoke-giant",
    name: "Rookreus",
    hp: 120,
    attack: 10,
    rewardTokens: 28,
    rewardPoints: 25,
    rewardXp: 38,
    className: "boss-smoke",
  },
  {
    id: "plastic-ghost",
    name: "Plasticspook",
    hp: 90,
    attack: 6,
    rewardTokens: 18,
    rewardPoints: 16,
    rewardXp: 26,
    className: "boss-plastic",
  },
]

const RPG_LEVELS = [
  {
    level: 1,
    title: "Boswachter start",
    boss: "Afvalbaas",
    requirement: 0,
    reward: "Basis tokens en herstelpunten",
  },
  {
    level: 2,
    title: "Rookjager",
    boss: "Rookreus",
    requirement: 25,
    reward: "Meer XP en kans op zaadjes",
  },
  {
    level: 3,
    title: "Plasticbreker",
    boss: "Plasticspook",
    requirement: 55,
    reward: "Extra tokens en collectables",
  },
  {
    level: 4,
    title: "Klimaatheld",
    boss: "Wilde Vervuiling",
    requirement: 95,
    reward: "Sterkere herstelbonus",
  },
  {
    level: 5,
    title: "Boslegende",
    boss: "Eindbaas Uitstoot",
    requirement: 145,
    reward: "Topbeloningen en prestige-ready",
  },
]

const DICE_REWARDS = [
  { roll: 1, label: "Zaadje", emoji: "🌱", tokens: 4, xp: 8, seeds: 1 },
  { roll: 2, label: "Tokenbosje", emoji: "🍃", tokens: 12, xp: 10, seeds: 0 },
  { roll: 3, label: "XP boost", emoji: "✨", tokens: 8, xp: 24, seeds: 0 },
  { roll: 4, label: "Collectable kans", emoji: "🎁", tokens: 10, xp: 16, seeds: 1, collectible: true },
  { roll: 5, label: "Battle kracht", emoji: "⚔️", tokens: 16, xp: 22, battlePoints: 6 },
  { roll: 6, label: "Jackpot natuur", emoji: "🌈", tokens: 30, xp: 35, seeds: 2, collectible: true, battlePoints: 10 },
]

const MISSION_TABS = [
  ["actions", "Acties", "Vink duurzame of slechte keuzes aan en zie direct effect."],
  ["quests", "Missies", "Kleine dagdoelen voor tokens, streaks en voortgang."],
  ["rpg", "RPG", "Speel herstelbattles als je bos hulp nodig heeft."],
  ["shop", "Winkel", "Koop cosmetische beloningen voor je bos."],
  ["gacha", "Dobbelsteen", "Gebruik tokens voor random rewards en collectibles."],
  ["badges", "Beloningen", "Bekijk achievements, level en prestige."],
  ["previews", "Scenario's", "Laat lage, gemiddelde en hoge uitstoot zien."],
  ["settings", "Rust", "Zet meldingen zachter of pas de balkkleur aan."],
]

const SEASONS = [
  { id: "spring", label: "Lente", weather: "regen" },
  { id: "summer", label: "Zomer", weather: "zon" },
  { id: "autumn", label: "Herfst", weather: "wind" },
  { id: "winter", label: "Winter", weather: "sneeuw" },
]

const NAV_THEMES = [
  { id: "forest", label: "Bosgroen" },
  { id: "light", label: "Licht" },
  { id: "blue", label: "Blauw" },
  { id: "dark", label: "Donker" },
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
  {
    id: "battle-winner",
    title: "Afvalbaas verslagen",
    description: "Win een herstelbattle.",
    check: ({ battlePoints }) => battlePoints >= 20,
  },
  {
    id: "seed-collector",
    title: "Zaadjesverzamelaar",
    description: "Verzamel 3 zaadjes.",
    check: ({ seeds }) => seeds >= 3,
  },
  {
    id: "level-3",
    title: "Groei-expert",
    description: "Bereik level 3.",
    check: ({ level }) => level >= 3,
  },
  {
    id: "collector",
    title: "Collectables",
    description: "Verzamel 2 gacha-beloningen.",
    check: ({ collectibleCount }) => collectibleCount >= 2,
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
  {
    question: "Welke keuze verlaagt meestal afval?",
    options: ["Wegwerptas gebruiken", "Herbruikbare tas meenemen", "Plastic dubbel verpakken", "Alles apart kopen"],
    correctIndex: 1,
    explanation: "Een herbruikbare tas voorkomt steeds nieuw verpakkingsmateriaal.",
  },
  {
    question: "Wat helpt om je schermtijd bewuster te maken?",
    options: ["Alle meldingen aan laten", "Een korte check-in doen", "Eindeloos scrollen", "Elke app open laten"],
    correctIndex: 1,
    explanation: "Een korte check-in houdt de app nuttig zonder onnodig scrollen.",
  },
  {
    question: "Welke gewoonte bespaart vaak water en energie?",
    options: ["Korter douchen", "Warmer en langer douchen", "Kraan laten lopen", "Elke dag badderen"],
    correctIndex: 0,
    explanation: "Korter douchen bespaart warm water en dus energie.",
  },
  {
    question: "Wat is meestal beter voor kleding?",
    options: ["Na een keer dragen weggooien", "Tweedehands kopen", "Altijd nieuw kopen", "Onnodig wassen"],
    correctIndex: 1,
    explanation: "Tweedehands kleding verlengt de levensduur van producten.",
  },
  {
    question: "Welke reis veroorzaakt vaak de hoogste uitstoot?",
    options: ["Lopen", "Fietsen", "Vliegen", "Trein"],
    correctIndex: 2,
    explanation: "Vliegen veroorzaakt vaak een grote uitstootpiek per reis.",
  },
  {
    question: "Wat helpt bij boodschappen doen?",
    options: ["Met lijstje kopen", "Extra veel kopen", "Eten laten bederven", "Alles impulsief kopen"],
    correctIndex: 0,
    explanation: "Een lijstje voorkomt overbodige aankopen en voedselverspilling.",
  },
  {
    question: "Welke actie helpt direct tegen sluipverbruik?",
    options: ["Stekkerdoos uit", "Tv op standby", "Opladers laten zitten", "Computer altijd aan"],
    correctIndex: 0,
    explanation: "Een stekkerdoos uitzetten stopt onnodig stroomverbruik.",
  },
  {
    question: "Wat past het best bij een herstelbos?",
    options: ["Nieuwe duurzame missie kiezen", "Meer uitstoot testen", "Niks doen", "Bos resetten zonder actie"],
    correctIndex: 0,
    explanation: "Een duurzame missie geeft het bos weer zichtbare groei.",
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

const WEATHER_PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 4 + ((index * 13) % 92),
  delay: (index % 8) * 0.18,
  duration: 2.4 + (index % 5) * 0.22,
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

function playForestSound(type = "success") {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const frequency =
      type === "hit" ? 170 : type === "gacha" ? 520 : type === "attack" ? 360 : 440

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(frequency, context.currentTime)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.2)
  } catch {
    // Audiofeedback is extra. De game blijft volledig werken als de browser audio blokkeert.
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
  const actionBonus = completedCount * 2

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
  const collectibles = Array.isArray(stored.collectibles) ? stored.collectibles : []

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
    collectibles,
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

function getBattleBonuses(purchasedIds = []) {
  return SHOP_ITEMS.reduce(
    (bonus, item) => {
      if (!purchasedIds.includes(item.id) || !item.battleBonus) {
        return bonus
      }

      return {
        maxHp: bonus.maxHp + getSafeNumber(item.battleBonus.maxHp, 0),
        damage: bonus.damage + getSafeNumber(item.battleBonus.damage, 0),
        defense: bonus.defense + getSafeNumber(item.battleBonus.defense, 0),
      }
    },
    { maxHp: 0, damage: 0, defense: 0 }
  )
}

function formatLiveTime(date) {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getTimeState(date) {
  const hour = date.getHours()
  if (hour >= 22 || hour < 6) return "night"
  if (hour >= 18) return "evening"
  if (hour < 9) return "morning"
  return "day"
}

function getUnlockedAchievements({ completedActions, savedKg, game, purchasedCount, level }) {
  const earnedContext = {
    completedCount: completedActions.length,
    savedKg,
    purchasedCount,
    level,
    streak: game.streak,
    prestige: game.prestige,
    battlePoints: game.battlePoints,
    seeds: game.seeds,
    collectibleCount: game.collectibles?.length || 0,
  }
  const earnedIds = ACHIEVEMENTS.filter((achievement) => achievement.check(earnedContext)).map(
    (achievement) => achievement.id
  )

  return Array.from(new Set([...(game.unlockedAchievements || []), ...earnedIds]))
}

function ForestVisualization({ mode = "overview" }) {
  const [game, setGame] = useState(getStoredGame)
  const [activeTab, setActiveTab] = useState("active")
  const isGameMode = mode === "game"
  const [activePanel, setActivePanel] = useState(() => (isGameMode ? "actions" : ""))
  const [scenarioId, setScenarioId] = useState("own")
  const [toast, setToast] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showRecoveryPulse, setShowRecoveryPulse] = useState(false)
  const [showForestClick, setShowForestClick] = useState(false)
  const [diceResult, setDiceResult] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [showTaskToasts, setShowTaskToasts] = useState(
    () => readJsonStorage("forest-task-toast-enabled", true) !== false
  )
  const [navTheme, setNavTheme] = useState(() => {
    try {
      return localStorage.getItem("forest-nav-theme") || "forest"
    } catch {
      return "forest"
    }
  })
  const [isBattleOpen, setIsBattleOpen] = useState(false)
  const [battle, setBattle] = useState({
    bossId: BATTLE_BOSSES[0].id,
    enemyHp: 100,
    playerHp: 100,
    combo: 0,
    questionIndex: 0,
    elapsedSeconds: 0,
    feedback: "",
    explanation: "",
    won: false,
    lost: false,
    rewardGranted: false,
    effect: "",
  })
  const [ownerName, setOwnerName] = useState(() => getForestOwnerName())
  const [authMode, setAuthMode] = useState(() => {
    const currentUser = auth.currentUser
    if (!currentUser) return "loading"
    return currentUser.isAnonymous ? "anonymous" : "account"
  })

  const forestTitle = `Bos van ${ownerName}`
  const sharedForest = useMemo(() => getForestOverview(), [])
  const impactData = useMemo(() => getLocalImpactData(), [])
  const activeCheckinWeek = useMemo(() => getWeeklyCheckinWeekInfo(), [])
  const weeklyResults = useMemo(() => getStoredWeeklyResults(), [])
  const weeklyQuestionnaireDone = useMemo(
    () => hasWeeklyResultForWeek(weeklyResults, activeCheckinWeek),
    [activeCheckinWeek, weeklyResults]
  )
  const weeklyGoal = sharedForest.weeklyGoal
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
  const battleBonuses = useMemo(
    () => getBattleBonuses(game.purchasedCosmetics),
    [game.purchasedCosmetics]
  )
  const battleCosmetics = useMemo(
    () => purchasedShopItems.filter((item) => item.battleEffect),
    [purchasedShopItems]
  )
  const collectibleItems = useMemo(
    () => game.collectibles.map((id) => GACHA_ITEMS.find((item) => item.id === id)).filter(Boolean),
    [game.collectibles]
  )
  const visibleActions = activeTab === "active" ? activeActions : completedActions
  const savedKg = roundKg(completedActions.reduce((total, action) => total + action.savedKg, 0))
  const badKg = roundKg(completedBadActions.reduce((total, action) => total + action.emissionKg, 0))
  const level = getLevelFromXp(game.xp)
  const xpProgress = getXpProgress(game.xp)
  const rpgLevel =
    [...RPG_LEVELS].reverse().find((stage) => game.battlePoints >= stage.requirement) || RPG_LEVELS[0]
  const nextRpgLevel = RPG_LEVELS.find((stage) => stage.requirement > game.battlePoints) || null
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
  const dataWeeklyEmission = roundKg(sharedForest.weeklyEmission || impactData.weeklyEmission || weeklyGoal * 0.68)
  const actionEmissionOffset =
    scenarioId === "own" ? Math.min(savedKg * 1.2, weeklyGoal * 0.22) : 0
  const weeklyEmission = roundKg(
    Math.max(0, (scenario.weeklyEmission ?? dataWeeklyEmission) + (scenarioId === "own" ? badKg : 0) - actionEmissionOffset)
  )
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
  const currentBoss =
    BATTLE_BOSSES.find((boss) => boss.id === battle.bossId) || BATTLE_BOSSES[0]
  const liveTimeLabel = formatLiveTime(currentTime)
  const timeState = getTimeState(currentTime)
  const activeSeason = SEASONS.find((item) => item.id === game.season) || SEASONS[0]
  const authStatusText =
    authMode === "account"
      ? "Je speelt met je account. Je bosnaam en voortgang worden aan je profiel gekoppeld."
      : authMode === "anonymous"
        ? "Je speelt nu anoniem. Je voortgang staat lokaal op dit apparaat."
        : "Accountstatus wordt geladen."

  useEffect(() => {
    writeJsonStorage(STORAGE_KEY, game)
  }, [game])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    writeJsonStorage("forest-task-toast-enabled", showTaskToasts)
  }, [showTaskToasts])

  useEffect(() => {
    document.documentElement.dataset.navTheme = navTheme
    try {
      localStorage.setItem("forest-nav-theme", navTheme)
    } catch {
      // De gekozen kleur is een voorkeur; bij opslagproblemen blijft de app bruikbaar.
    }
  }, [navTheme])

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
      setAuthMode(!user ? "loading" : user.isAnonymous ? "anonymous" : "account")
    })
  }, [])

  useEffect(() => {
    if (authMode === "loading") return

    const key = `forest-auth-popup-${authMode}`
    try {
      if (sessionStorage.getItem(key) === "true") return
      sessionStorage.setItem(key, "true")
    } catch {
      // Zonder sessionStorage tonen we de melding gewoon een keer per rendercyclus.
    }

    const popupTimerId = window.setTimeout(() => {
      setToast({
        emoji: authMode === "account" ? "✅" : "👤",
        title: authMode === "account" ? "Account gekoppeld" : "Anonieme voortgang",
        message:
          authMode === "account"
            ? "Je bos gebruikt je accountnaam en bewaart je voortgang bij je profiel."
            : "Je speelt nu lokaal. Maak of open een account om je bos persoonlijker te maken.",
      })
      window.setTimeout(() => setToast(null), 3600)
    }, 0)

    return () => window.clearTimeout(popupTimerId)
  }, [authMode])

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

    if (showTaskToasts) {
      setToast({
        emoji: "😊",
        title: "Nieuwe boom geplant!",
        message: `${action.compliment} Je hebt ${nextTreeCount} ${treeLabel} geplant, ${roundKg(action.savedKg)} kg CO2 bespaard, ${tokenReward} tokens en ${xpReward} XP verdiend.${bonus}`,
        detail: action.impact,
      })
      window.setTimeout(() => setToast(null), 3600)
    }
    setShowConfetti(true)
    playForestSound("success")

    window.setTimeout(() => setShowConfetti(false), 1300)
  }

  function undoAction(action) {
    if (!game.completedIds.includes(action.id)) return

    const tokenReward = Math.round(action.tokens * prestigeMultiplier)
    const xpReward = Math.round((action.tokens + action.savedKg * 10) * prestigeMultiplier)

    setGame((current) => ({
      ...current,
      completedIds: current.completedIds.filter((id) => id !== action.id),
      tokens: Math.max(0, getSafeNumber(current.tokens, 0) - tokenReward),
      xp: Math.max(0, getSafeNumber(current.xp, 0) - xpReward),
      dailyCompletedCount: Math.max(0, getSafeNumber(current.dailyCompletedCount, 0) - 1),
    }))
    setToast({
      emoji: "↩️",
      title: "Actie geannuleerd",
      message: `${action.title} is teruggezet. Je bos en tokens zijn bijgewerkt.`,
    })
    window.setTimeout(() => setToast(null), 3000)
  }

  function triggerForestClick() {
    setShowForestClick(true)
    window.setTimeout(() => setShowForestClick(false), 720)
  }

  function resetGame() {
    setGame((current) => ({
      ...current,
      completedIds: [],
      badIds: [],
      purchasedCosmetics: [],
      collectibles: [],
      unlockedAchievements: unlockedAchievementIds,
      tokens: 0,
      xp: 0,
      seeds: 0,
      battlePoints: 0,
      dailyCompletedCount: 0,
      dailyCompletedDate: "",
    }))
    setActiveTab("active")
    setScenarioId("own")
    setDiceResult(null)
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

  function undoBadAction(action) {
    if (!game.badIds.includes(action.id)) return

    setGame((current) => ({
      ...current,
      badIds: current.badIds.filter((id) => id !== action.id),
    }))
    setToast({
      emoji: "🌧️",
      title: "Schade teruggedraaid",
      message: `${action.title} telt niet meer mee in je bosvoorbeeld.`,
      detail: "Zo kun je rustig testen hoe hoge uitstoot je bos verandert.",
    })
    setShowRecoveryPulse(true)
    window.setTimeout(() => setShowRecoveryPulse(false), 1200)
    window.setTimeout(() => setToast(null), 3200)
  }

  function openGacha() {
    const cost = 20
    if (game.tokens < cost) {
      setToast({
        emoji: "🎲",
        title: "Nog niet genoeg tokens",
        message: `Je hebt ${cost} tokens nodig om de dobbelsteen te gooien.`,
        detail: "Voltooi missies of win battles om meer tokens te krijgen.",
      })
      window.setTimeout(() => setToast(null), 3600)
      return
    }

    const reward = DICE_REWARDS[Math.floor(Math.random() * DICE_REWARDS.length)]
    const item = reward.collectible
      ? GACHA_ITEMS[(game.collectibles.length + reward.roll) % GACHA_ITEMS.length]
      : null

    setGame((current) => {
      const nextTokens = Math.max(0, getSafeNumber(current.tokens, 0) - cost) + reward.tokens

      return {
        ...current,
        tokens: nextTokens,
        xp: getSafeNumber(current.xp, 0) + reward.xp,
        seeds: getSafeNumber(current.seeds, 0) + getSafeNumber(reward.seeds, 0),
        battlePoints: getSafeNumber(current.battlePoints, 0) + getSafeNumber(reward.battlePoints, 0),
        collectibles: item ? [...(current.collectibles || []), item.id] : current.collectibles || [],
      }
    })
    setDiceResult({
      ...reward,
      collectibleTitle: item?.title || "",
      collectibleEmoji: item?.emoji || "",
    })
    setToast({
      emoji: reward.emoji,
      title: `Je gooide ${reward.roll}: ${reward.label}`,
      message: `+${reward.tokens} tokens, +${reward.xp} XP${reward.seeds ? `, +${reward.seeds} zaadjes` : ""}${item ? ` en ${item.title}` : ""}.`,
      detail: "Dobbelsteenbeloningen zijn gamification en veranderen je echte uitstoot niet.",
    })
    setShowConfetti(true)
    playForestSound("gacha")
    window.setTimeout(() => setShowConfetti(false), 1300)
    window.setTimeout(() => setToast(null), 4200)
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

  function startBattle({ force = false, bossId = "" } = {}) {
    if (!force && !canStartBattle) return

    const bossPool = BATTLE_BOSSES.slice(0, clamp(rpgLevel.level, 1, BATTLE_BOSSES.length))
    const selectedBoss = bossPool.find((item) => item.id === bossId)
    const boss = selectedBoss || bossPool[Math.floor(Math.random() * bossPool.length)] || BATTLE_BOSSES[0]
    const playerMaxHp = 100 + battleBonuses.maxHp
    setBattle({
      bossId: boss.id,
      enemyHp: boss.hp,
      playerHp: playerMaxHp,
      combo: 0,
      questionIndex: Math.floor(Math.random() * BATTLE_QUESTIONS.length),
      elapsedSeconds: 0,
      feedback: battleRewardDoneToday
        ? "Vandaag al voltooid. Je kunt oefenen, maar krijgt geen extra beloning."
        : "",
      explanation: "",
      won: false,
      lost: false,
      rewardGranted: false,
      effect: "",
    })
    setIsBattleOpen(true)
  }

  function closeBattle() {
    setIsBattleOpen(false)
  }

  function answerBattle(optionIndex) {
    if (battle.won || battle.lost) return

    const question = BATTLE_QUESTIONS[battle.questionIndex % BATTLE_QUESTIONS.length]
    const isCorrect = optionIndex === question.correctIndex
    const nextCombo = isCorrect ? clamp(getSafeNumber(battle.combo, 0) + 1, 0, 5) : 0
    const comboBonus = isCorrect ? Math.min(nextCombo * 2, 10) : 0
    let damage = 0
    let bossDamage = 0

    if (isCorrect && battle.elapsedSeconds <= 5) {
      damage = 25 + battleBonuses.damage + comboBonus
    } else if (isCorrect && battle.elapsedSeconds <= 10) {
      damage = 15 + battleBonuses.damage + comboBonus
    } else if (isCorrect) {
      damage = 10 + battleBonuses.damage + comboBonus
    }

    if (!isCorrect) {
      bossDamage = Math.max(0, currentBoss.attack - battleBonuses.defense)
    } else if (battle.elapsedSeconds > 10) {
      bossDamage = Math.max(0, Math.round(currentBoss.attack / 2) - battleBonuses.defense)
    }
    playForestSound(damage > 0 ? "attack" : "hit")

    const nextHp = clamp(battle.enemyHp - damage, 0, currentBoss.hp)
    const nextPlayerHp = clamp(battle.playerHp - bossDamage, 0, 100 + battleBonuses.maxHp)
    const won = nextHp === 0
    const lost = !won && nextPlayerHp === 0
    const rewardAllowed = won && !hasBattleRewardToday()

    if (rewardAllowed) {
      markBattleRewardToday()
      increaseRecoveryBonus(5)
      setGame((current) => ({
        ...current,
        battlePoints: getSafeNumber(current.battlePoints, 0) + currentBoss.rewardPoints,
        tokens: getSafeNumber(current.tokens, 0) + currentBoss.rewardTokens,
        xp: getSafeNumber(current.xp, 0) + currentBoss.rewardXp,
      }))
      setShowRecoveryPulse(true)
      setShowConfetti(true)
      window.setTimeout(() => setShowRecoveryPulse(false), 1800)
      window.setTimeout(() => setShowConfetti(false), 1300)
    }

    setBattle((current) => ({
      ...current,
      enemyHp: nextHp,
      playerHp: nextPlayerHp,
      feedback: isCorrect
        ? battle.elapsedSeconds <= 5
          ? `Goed! ${damage} damage`
          : battle.elapsedSeconds <= 10
            ? `Goed! ${damage} damage`
            : `Te laat, maar goed! ${damage} damage. ${currentBoss.name} doet ${bossDamage} schade terug.`
        : `Helaas, geen damage. ${currentBoss.name} doet ${bossDamage} schade.`,
      explanation: lost ? "Je HP is op. Probeer opnieuw met snellere antwoorden." : question.explanation,
      won,
      lost,
      rewardGranted: rewardAllowed,
      combo: won || lost ? nextCombo : nextCombo,
      effect: damage > 0 ? "player-attack" : "boss-hit",
      questionIndex: won || lost ? current.questionIndex : current.questionIndex + 1,
      elapsedSeconds: 0,
    }))

    window.setTimeout(() => {
      setBattle((current) => ({
        ...current,
        effect: "",
      }))
    }, 520)
  }

  return (
    <div className={`forest-clean-page forest-clean-page--${isGameMode ? "game" : "overview"}`}>
      {!isGameMode ? (
        <section className="forest-weekly-card" aria-label="Wekelijkse vragenlijst">
          <div>
            <span className="forest-kicker">Wekelijkse vragenlijst</span>
            <h2>{weeklyQuestionnaireDone ? "Week ingevuld" : "Vul je week in"}</h2>
            <p>
              {formatWeekRangeLabel(activeCheckinWeek.weekStart, activeCheckinWeek.weekEnd)} ·{" "}
              {weeklyQuestionnaireDone
                ? "je bos gebruikt deze weekdata."
                : "duurt ongeveer 2 minuten."}
            </p>
          </div>
          <Link
            to="/weekly-questionnaire"
            state={{ weekKey: activeCheckinWeek.weekStart, returnTo: "/bos" }}
          >
            {weeklyQuestionnaireDone ? "Bijwerken" : "Start"}
          </Link>
        </section>
      ) : null}

      {!isGameMode ? (
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
          <span className="app-logo-token" aria-hidden="true">
            <LuLeaf />
          </span>
          {game.tokens}
        </div>
        <div className="forest-progress-track" aria-label="Bos voortgang">
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>Nog {remainingProgress}% te gaan</small>
      </section>
      ) : (
        <section className="forest-mission-hero" aria-label="Missies introductie">
          <div>
            <span className="forest-kicker">Missies</span>
            <h1>Van actie naar beloning</h1>
            <p>Begin met acties. Daarna kun je missies, battles en beloningen gebruiken om je bos verder uit te bouwen.</p>
          </div>
          <span className="forest-mission-chip">Bos: {status.label} · {game.tokens} tokens</span>
        </section>
      )}

      {isGameMode ? (
        <section className="forest-hub-card forest-hub-card--top" aria-label="Bosmissies menu">
          <div>
            <span className="forest-kicker">Route</span>
            <h2>Wat wil je doen?</h2>
          </div>
          <div className="forest-mission-guide">
            {MISSION_TABS.slice(0, 4).map(([id, label, summary]) => (
              <button
                key={`guide-${id}`}
                type="button"
                className={activePanel === id ? "is-active" : ""}
                onClick={() => setActivePanel(id)}
              >
                <strong>{label}</strong>
                <span>{summary}</span>
              </button>
            ))}
          </div>
          <div className="forest-hub-buttons">
            {MISSION_TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={activePanel === id ? "is-active" : ""}
                onClick={() => setActivePanel(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isGameMode ? (
      <section className={`forest-auth-card is-${authMode}`} aria-label="Accountstatus bos">
        <div>
          <span className="forest-kicker">{authMode === "account" ? "Account" : "Lokaal"}</span>
          <strong>{authMode === "account" ? "Ingelogd" : "Niet ingelogd"}</strong>
          <p>{authStatusText}</p>
        </div>
        <Link to={authMode === "account" ? "/account-gegevens" : "/login"}>
          {authMode === "account" ? "Instellingen" : "Inloggen"}
        </Link>
      </section>
      ) : null}

      {isGameMode && (
        <section
          className={`forest-game-stats-card forest-panel-section${activePanel === "badges" ? "" : " is-hidden"}`}
          aria-label="Game voortgang"
        >
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
      )}

      {isGameMode && (
        <section
          className={`forest-scenarios-card forest-panel-section${activePanel === "previews" ? "" : " is-hidden"}`}
          aria-label="Voorbeeldscenario's"
        >
          <div>
            <span className="forest-kicker">Scenario's</span>
            <h2>Uitstootvoorbeelden</h2>
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
          <div className="forest-season-panel">
            <div>
              <span className="forest-kicker">Seizoen</span>
              <strong>{activeSeason.label} · {activeSeason.weather}</strong>
            </div>
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
      )}

      {!isGameMode ? (
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

        <div
          className={`simple-forest-scene scene--${status.id} season--${game.season} time--${timeState}`}
          onClick={triggerForestClick}
          role="button"
          tabIndex={0}
          aria-label="Klik op het bos voor een korte animatie"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              triggerForestClick()
            }
          }}
        >
          {status.id !== "bad" && status.id !== "critical" && <span className="simple-sun" />}
          <span className="forest-time-badge" aria-label={`Live tijd ${liveTimeLabel}`}>
            {liveTimeLabel}
          </span>
          <span className="simple-cloud cloud-left" />
          <span className="simple-cloud cloud-right" />
          <span className="simple-cloud cloud-small" />
          <div className={`season-weather weather--${game.season}`} aria-hidden="true">
            {WEATHER_PARTICLES.map((particle) => (
              <span
                key={particle.id}
                style={{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ))}
          </div>
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
          {collectibleItems.slice(0, 5).map((item, index) => (
            <span
              key={`${item.id}-scene-${index}`}
              className={`forest-collectible-deco deco-${index + 1}`}
              aria-label={item.title}
            >
              {item.emoji}
            </span>
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
                    {
                      setToast({
                        title: action.title,
                        message: action.isDemo
                          ? "Deze boom hoort bij het gekozen previewscenario."
                          : `Deze boom staat voor ${action.savedKg} kg CO2 besparing.`,
                      })
                      window.setTimeout(() => setToast(null), 2800)
                    }
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
          {showForestClick && <span className="forest-click-burst" aria-hidden="true" />}
        </div>
      </section>
      ) : null}

      {!isGameMode && (
        <section className="forest-overview-actions-card" aria-label="Volgende stap in het bos">
          <div>
            <span className="forest-kicker">Volgende stap</span>
            <h2>Maak je bos sterker</h2>
          </div>
          <div className="forest-tutorial-list">
            <div>
              <strong>1. Bekijk je bos</strong>
              <span>Deze pagina laat vooral je huidige bosstatus zien.</span>
            </div>
            <div>
              <strong>2. Kies acties</strong>
              <span>Op Acties vink je goede en slechte keuzes aan. Die werken door in je bos.</span>
            </div>
            <div>
              <strong>3. Speel missies</strong>
              <span>Missies zijn extra: tokens, battles, winkel en beloningen.</span>
            </div>
          </div>
          <div className="forest-overview-action-list">
            <Link to="/activiteiten">Open acties</Link>
            <Link to="/missies">Open missies</Link>
            <Link to="/overzicht">Bekijk inzicht</Link>
          </div>
        </section>
      )}

      {isGameMode && (
        <>
      <section
        className={`forest-actions-card forest-rpg-card forest-panel-section${activePanel === "rpg" ? "" : " is-hidden"}`}
        aria-label="RPG voortgang"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">RPG-modus</span>
            <h2>Level {rpgLevel.level}: {rpgLevel.title}</h2>
            <p className="forest-action-explainer">
              Versla vervuiling, verdien bospunten en speel sterkere levels vrij.
            </p>
          </div>
          <strong>{game.battlePoints} BP</strong>
        </div>
        <div className="forest-rpg-boss-card">
          <span>Boss</span>
          <strong>{rpgLevel.boss}</strong>
          <p>{rpgLevel.reward}</p>
          {nextRpgLevel ? (
            <small>Nog {nextRpgLevel.requirement - game.battlePoints} BP tot level {nextRpgLevel.level}</small>
          ) : (
            <small>Max level bereikt</small>
          )}
        </div>
        <div className="forest-rpg-levels">
          {RPG_LEVELS.map((stage) => {
            const unlocked = game.battlePoints >= stage.requirement
            const stageBoss = BATTLE_BOSSES[(stage.level - 1) % BATTLE_BOSSES.length]

            return (
            <article key={stage.level} className={unlocked ? "is-unlocked" : ""}>
              <span>Level {stage.level}</span>
              <strong>{stage.title}</strong>
              <small>{stage.requirement} BP</small>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => startBattle({ force: true, bossId: stageBoss.id })}
              >
                {unlocked ? `Vecht tegen ${stage.boss}` : "Gesloten"}
              </button>
            </article>
            )
          })}
        </div>
        <button type="button" className="forest-battle-start" onClick={() => startBattle({ force: true })}>
          Start snelle RPG battle
        </button>
      </section>

      <section className={`forest-actions-card forest-battle-card${canStartBattle ? "" : " is-locked"}`} aria-label="Herstelbattle">
          <div className="forest-actions-heading">
            <div>
              <span className="forest-kicker">Minigame</span>
              <h2>Herstelbattle</h2>
              <p className="forest-action-explainer">
                {canStartBattle
                  ? "Versla de Afvalbaas met snelle duurzame quizantwoorden."
                  : "Wordt actief wanneer je bos kwetsbaar, droog of beschadigd is."}
              </p>
            </div>
            <strong>{canStartBattle ? (battleRewardDoneToday ? "Oefenen" : "+tokens") : "Gesloten"}</strong>
          </div>
          <button type="button" className="forest-battle-start" onClick={startBattle} disabled={!canStartBattle}>
            {canStartBattle ? "Start herstelbattle" : "Nog niet nodig"}
          </button>
          {battleRewardDoneToday ? (
            <p className="forest-battle-note">Vandaag al voltooid. Oefenen kan nog, maar zonder extra punten.</p>
          ) : null}
          {!canStartBattle ? (
            <p className="forest-battle-note">Tip: test een hoog-uitstoot scenario of voeg een slechte actie toe om de battle te tonen.</p>
          ) : null}
        </section>

      <section
        className={`forest-actions-card forest-quests-card forest-panel-section${activePanel === "quests" ? "" : " is-hidden"}`}
        aria-label="Dagelijkse quests"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Missies</span>
            <h2>Dagelijkse missies</h2>
            <p className="forest-action-explainer">Voltooi missies voor motivatie, streaks en collectibles.</p>
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

      <section
        className={`forest-actions-card forest-achievements-card forest-panel-section${activePanel === "badges" ? "" : " is-hidden"}`}
        aria-label="Achievements en seizoenen"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Beloningen</span>
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
      </section>

      <section
        className={`forest-actions-card forest-panel-section${activePanel === "actions" ? "" : " is-hidden"}`}
        aria-label="Duurzame acties"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Acties</span>
            <h2>Duurzame acties</h2>
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
                    onClick={() => (completed ? undoAction(action) : completeAction(action))}
                  >
                    {completed ? "Annuleer" : "Voltooien"}
                  </button>
                </article>
              )
            })
          )}
        </div>
        <Link className="forest-page-link" to="/activiteiten">
          Bekijk uitgebreide acties
        </Link>
      </section>

      <section
        className={`forest-actions-card forest-shop-card forest-panel-section${activePanel === "shop" ? "" : " is-hidden"}`}
        aria-label="Beloningenwinkel"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Winkel</span>
            <h2>Beloningenwinkel</h2>
            <p className="forest-action-explainer">Verdien tokens met goede acties en koop cosmetische upgrades voor je bos.</p>
          </div>
          <strong>
            <span className="app-logo-token" aria-hidden="true">
              <LuLeaf />
            </span>
            {game.tokens}
          </strong>
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
                  {item.battleEffect ? <small>{item.battleEffect}</small> : null}
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

      <section
        className={`forest-actions-card danger-actions-card forest-panel-section${activePanel === "actions" ? "" : " is-hidden"}`}
        aria-label="Slechte voorbeeldacties"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Hoge uitstoot</span>
            <h2>Schadevoorbeelden</h2>
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
          {completedBadActions.map((action) => (
            <article key={`done-${action.id}`} className="forest-action-card bad-action-card is-done">
              <div>
                <h3>{action.title}</h3>
                <p>Deze schade telt nu mee in je bosvoorbeeld.</p>
                <span>+{action.emissionKg} kg CO2 actief</span>
              </div>
              <button type="button" onClick={() => undoBadAction(action)}>
                Annuleer schade
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`forest-actions-card forest-gacha-card forest-panel-section${activePanel === "gacha" ? "" : " is-hidden"}`}
        aria-label="Dobbelsteen gacha"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Gacha</span>
            <h2>Dobbelsteenbos</h2>
            <p className="forest-action-explainer">Gooi een dobbelsteen en krijg tokens, XP, zaadjes of collectables.</p>
          </div>
          <strong>
            <span className="app-logo-token" aria-hidden="true">
              <LuLeaf />
            </span>
            {game.tokens}
          </strong>
        </div>
        <div className="forest-dice-panel">
          <div className={`forest-dice${diceResult ? " has-result" : ""}`} aria-label={diceResult ? `Dobbelsteen ${diceResult.roll}` : "Dobbelsteen"}>
            {diceResult?.roll || "?"}
          </div>
          <div>
            <strong>{diceResult ? `${diceResult.emoji} ${diceResult.label}` : "Gooi voor een reward"}</strong>
            <p>
              {diceResult
                ? `+${diceResult.tokens} tokens, +${diceResult.xp} XP${diceResult.collectibleTitle ? ` en ${diceResult.collectibleEmoji} ${diceResult.collectibleTitle}` : ""}`
                : "Worp 1 t/m 6 bepaalt je beloning. Worp 6 is jackpot."}
            </p>
          </div>
        </div>
        <button type="button" className="forest-gacha-button" onClick={openGacha}>
          Gooi dobbelsteen · 20 tokens
        </button>
        <div className="forest-dice-rewards">
          {DICE_REWARDS.map((reward) => (
            <span key={reward.roll}>{reward.roll}: {reward.emoji} {reward.label}</span>
          ))}
        </div>
        <div className="forest-collectible-grid">
          {collectibleItems.length === 0 ? (
            <p className="forest-empty-actions">Nog geen collectables. Verdien tokens en open je eerste capsule.</p>
          ) : (
            collectibleItems.map((item, index) => (
              <article key={`${item.id}-${index}`} className="forest-collectible-card">
                <strong>{item.emoji}</strong>
                <span>{item.title}</span>
                <small>{item.rarity}</small>
              </article>
            ))
          )}
        </div>
      </section>

      <section
        className={`forest-actions-card forest-settings-card forest-panel-section${activePanel === "settings" ? "" : " is-hidden"}`}
        aria-label="Bos instellingen"
      >
        <div className="forest-actions-heading">
          <div>
            <span className="forest-kicker">Instellingen</span>
            <h2>Rustige app</h2>
            <p className="forest-action-explainer">Zet meldingen zachter en pas de takenbalkkleur aan.</p>
          </div>
        </div>
        <label className="forest-toggle-row">
          <span>
            <strong>Taakmeldingen</strong>
            <small>Bevestiging na duurzame acties tonen</small>
          </span>
          <input
            type="checkbox"
            checked={showTaskToasts}
            onChange={(event) => setShowTaskToasts(event.target.checked)}
          />
        </label>
        <div className="forest-theme-panel">
          <span className="forest-kicker">Takenbalk kleur</span>
          <div className="forest-theme-buttons">
            {NAV_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={navTheme === theme.id ? "is-active" : ""}
                onClick={() => setNavTheme(theme.id)}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

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

            <div className={`battle-enemy ${battle.effect === "player-attack" ? "is-hit" : ""}`}>
              <div className={`battle-enemy-sprite ${currentBoss.className}`} aria-hidden="true">
                <span />
              </div>
              <div>
                <strong>{currentBoss.name}</strong>
                <div className="battle-hp-track" aria-label={`${currentBoss.name} HP ${battle.enemyHp}`}>
                  <span style={{ width: `${(battle.enemyHp / currentBoss.hp) * 100}%` }} />
                </div>
                <small>{battle.enemyHp}/{currentBoss.hp} HP · aanval {currentBoss.attack}</small>
              </div>
            </div>

            <div className={`battle-player${battle.effect === "boss-hit" ? " is-hit" : ""}`}>
              <span>Jouw boskracht</span>
              <div className="battle-player-hp" aria-label={`Jouw HP ${battle.playerHp}`}>
                <span style={{ width: `${(battle.playerHp / (100 + battleBonuses.maxHp)) * 100}%` }} />
              </div>
              <strong>{battle.playerHp}/{100 + battleBonuses.maxHp} HP</strong>
            </div>

            <div className="battle-combo-row" aria-label={`Combo ${battle.combo}`}>
              <span>Combo</span>
              <strong>x{battle.combo}</strong>
              <small>Goede antwoorden geven tot +10 extra damage.</small>
            </div>

            {battleCosmetics.length > 0 ? (
              <div className="battle-bonus-row" aria-label="Actieve battle beloningen">
                {battleCosmetics.map((item) => (
                  <span key={item.id}>{item.title}</span>
                ))}
              </div>
            ) : null}

            {battle.won ? (
              <div className="battle-win-panel">
                <strong>Je hebt {currentBoss.name} verslagen!</strong>
                <p>
                  {battle.rewardGranted
                    ? `Je bos krijgt +${currentBoss.rewardPoints} bospunten, +${currentBoss.rewardTokens} tokens en een herstelboost.`
                    : "Vandaag had je de beloning al gekregen, maar je hebt goed geoefend."}
                </p>
                <button type="button" onClick={closeBattle}>
                  Terug naar het bos
                </button>
              </div>
            ) : battle.lost ? (
              <div className="battle-win-panel battle-lose-panel">
                <strong>{currentBoss.name} heeft gewonnen</strong>
                <p>Je krijgt geen straf. Probeer opnieuw en antwoord sneller om je bos te herstellen.</p>
                <button type="button" onClick={startBattle}>
                  Opnieuw proberen
                </button>
              </div>
            ) : (
              <>
                <div className="battle-timer">
                  <span style={{ width: `${clamp((battle.elapsedSeconds / 15) * 100, 0, 100)}%` }} />
                </div>
                <p className="battle-timer-label">
                  Vraag {(battle.questionIndex % BATTLE_QUESTIONS.length) + 1}/{BATTLE_QUESTIONS.length} · {battle.elapsedSeconds}s
                </p>
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
