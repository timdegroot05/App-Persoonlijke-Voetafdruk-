import { useEffect, useMemo, useState } from "react"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { LuTrees } from "react-icons/lu"
import { watchAuthState } from "../authState"
import { getUserQuestionnaireData } from "../userService"
import { buildImpactSnapshot } from "../utils/impactInsights"

const DEFAULT_WEEKLY_GOAL = 150
const MAX_SCENE_TREES = 34
const MAX_SCENE_PLANTS = 46

const VISUAL_MODES = [
  { id: "animated", label: "Animatie" },
  { id: "calm", label: "Rustig" },
  { id: "game", label: "Game" },
  { id: "classic", label: "Klassiek" },
]

const TEST_SCENARIOS = [
  {
    id: "high",
    label: "Hoge uitstoot",
    emissionRatio: 1.85,
    forestScore: 18,
    dominantCategory: "transport",
    spikeKg: 42,
  },
  {
    id: "good",
    label: "Normaal",
    emissionRatio: 0.92,
    forestScore: 58,
    dominantCategory: "energie",
    spikeKg: 0,
  },
  {
    id: "great",
    label: "Lage uitstoot",
    emissionRatio: 0.55,
    forestScore: 92,
    dominantCategory: "voeding",
    spikeKg: 0,
  },
]

const DEFAULT_FOREST_PREVIEW_SCORE = 58

const UPGRADE_CATALOG = [
  {
    id: "mixed-grove",
    title: "Gemengd bos",
    description: "Ontgrendelt meer boomsoorten.",
    scoreRequired: 30,
    maxLevel: 3,
    treeBonus: 3,
    plantBonus: 1,
  },
  {
    id: "flower-meadow",
    title: "Bloemenveld",
    description: "Voegt bloemen, varens en kleur toe.",
    scoreRequired: 45,
    maxLevel: 3,
    treeBonus: 1,
    plantBonus: 7,
  },
  {
    id: "water-pond",
    title: "Waterpoel",
    description: "Maakt herstel sneller zichtbaar.",
    scoreRequired: 58,
    maxLevel: 2,
    treeBonus: 2,
    plantBonus: 4,
  },
  {
    id: "wildlife",
    title: "Dierenplek",
    description: "Trekt leven aan bij een gezond bos.",
    scoreRequired: 72,
    maxLevel: 2,
    treeBonus: 1,
    plantBonus: 3,
  },
]

const TREE_TYPES = [
  "oak",
  "pine",
  "birch",
  "round",
  "willow",
  "spruce",
  "sapling",
  "fruit",
]

const PLANT_TYPES = [
  "grass",
  "fern",
  "flower",
  "mushroom",
  "reed",
  "bush",
  "clover",
  "wildflower",
]

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
    // De pagina blijft bruikbaar als localStorage niet beschikbaar is.
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
      weekKey: weeklyEntry?.weekKey || "geen weekmeting",
      hasRealData: true,
    }
  }

  return {
    profileAnswers: hasLegacyData ? legacyAnswers : {},
    weeklyAnswers: {},
    weekKey: hasLegacyData ? "oude opslag" : "demo",
    hasRealData: hasLegacyData,
  }
}

function getObjectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {}
}

function getAccountDataForForest(userData) {
  const questionnaireAnswers = getObjectOrEmpty(userData?.questionnaireAnswers)
  const hasStructuredAnswers =
    "profile" in questionnaireAnswers || "weekly" in questionnaireAnswers
  const profileAnswers = getObjectOrEmpty(questionnaireAnswers.profile)
  const weeklyAnswers = hasStructuredAnswers
    ? getObjectOrEmpty(questionnaireAnswers.weekly)
    : getObjectOrEmpty(questionnaireAnswers)
  const latestFootprint = getObjectOrEmpty(userData?.latestFootprint)
  const hasProfileData = Object.keys(profileAnswers).length > 0
  const hasWeeklyData = Object.keys(weeklyAnswers).length > 0
  const hasFootprintData = getSafeNumber(latestFootprint.weeklyCo2) > 0

  return {
    profileAnswers,
    weeklyAnswers,
    latestFootprint,
    weekKey: "account",
    hasRealData: hasProfileData || hasWeeklyData || hasFootprintData,
    sourceLabel: "Accountdata",
  }
}

function getEmptyAccountForestData() {
  return {
    profileAnswers: {},
    weeklyAnswers: {},
    latestFootprint: {},
    weekKey: "account",
    hasRealData: false,
    sourceLabel: "Nieuw account",
  }
}

function getWeeklyGoal() {
  return getSafeNumber(readStorageItem("weekly-goal"), DEFAULT_WEEKLY_GOAL) || DEFAULT_WEEKLY_GOAL
}

function getStoredVisualMode() {
  const storedMode = readStorageItem("forest-visual-mode")
  return VISUAL_MODES.some((mode) => mode.id === storedMode) ? storedMode : "game"
}

function buildSafeImpactSnapshot(profileAnswers, weeklyAnswers) {
  try {
    return buildImpactSnapshot(profileAnswers, weeklyAnswers)
  } catch {
    return buildImpactSnapshot({}, {})
  }
}

function applyLatestFootprint(snapshot, latestFootprint) {
  const weeklyCo2 = getSafeNumber(latestFootprint?.weeklyCo2)

  if (weeklyCo2 <= 0) {
    return snapshot
  }

  const weeklyEmission = roundKg(weeklyCo2)

  return {
    ...snapshot,
    weeklyEmission,
    totalImpact: weeklyEmission,
    dailyEmission: roundKg(weeklyEmission / 7),
    totalScore: getSafeNumber(latestFootprint?.totalScore, snapshot.totalScore),
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
    breakdown: {
      ...baseSnapshot.breakdown,
      auto_uitstoot: scenario.spikeKg,
    },
  }
}

function calculateSavedKg({ weeklyEmission, weeklyGoal }) {
  return roundKg(Math.max(0, weeklyGoal - weeklyEmission))
}

function getUpgradeLevelTotal(upgrades) {
  return Object.values(upgrades).reduce((total, level) => total + getSafeNumber(level), 0)
}

function getUpgradeBonus(upgrades, key) {
  return UPGRADE_CATALOG.reduce((total, upgrade) => {
    const level = getSafeNumber(upgrades[upgrade.id])
    return total + getSafeNumber(upgrade[key]) * level
  }, 0)
}

function calculateForestScore({ previewScore }) {
  return Math.round(clamp(getSafeNumber(previewScore, DEFAULT_FOREST_PREVIEW_SCORE), 0, 100))
}

function getForestStatus(forestScore) {
  if (forestScore <= 25) {
    return {
      id: "damaged",
      label: "Beschadigd bos",
      badge: "Schade",
      text: "Je bos heeft herstel nodig.",
    }
  }

  if (forestScore <= 45) {
    return {
      id: "recovery",
      label: "Herstelmodus",
      badge: "Herstel",
      text: "Je bos herstelt langzaam.",
    }
  }

  if (forestScore <= 70) {
    return {
      id: "normal",
      label: "Normaal bos",
      badge: "Stabiel",
      text: "Je bos is stabiel.",
    }
  }

  if (forestScore <= 90) {
    return {
      id: "healthy",
      label: "Gezond bos",
      badge: "Gezond",
      text: "Je bos groeit goed.",
    }
  }

  return {
    id: "strong",
    label: "Sterk groeiend bos",
    badge: "Groei",
    text: "Je bos zit vol leven.",
  }
}

function getForestVisualState({ forestScore, upgrades }) {
  const upgradeLevels = getUpgradeLevelTotal(upgrades)
  const treeBonus = getUpgradeBonus(upgrades, "treeBonus")
  const plantBonus = getUpgradeBonus(upgrades, "plantBonus")
  const treeCount = Math.round(3 + forestScore * 0.31 + treeBonus)
  const plantCount = Math.round(5 + forestScore * 0.42 + plantBonus)
  const meadowLevel = getSafeNumber(upgrades["flower-meadow"])
  const waterLevel = getSafeNumber(upgrades["water-pond"])
  const wildlifeLevel = getSafeNumber(upgrades.wildlife)
  const damagedPatches =
    forestScore <= 25 ? 8 : forestScore <= 45 ? 5 : forestScore <= 70 ? 2 : 0

  return {
    treeCount: clamp(treeCount, 5, MAX_SCENE_TREES),
    plantCount: clamp(plantCount, 8, MAX_SCENE_PLANTS),
    treeSpecies: clamp(3 + Math.floor(forestScore / 18) + upgradeLevels, 3, TREE_TYPES.length),
    plantSpecies: clamp(3 + Math.floor(forestScore / 20) + meadowLevel, 3, PLANT_TYPES.length),
    flowerBoost: meadowLevel * 4,
    pondCount: waterLevel,
    animalCount: forestScore >= 70 ? clamp(1 + wildlifeLevel, 1, 5) : wildlifeLevel > 0 ? 1 : 0,
    lightBeams: forestScore >= 68 ? clamp(Math.floor(forestScore / 22), 2, 5) : 0,
    damagedPatches,
    statusId: getForestStatus(forestScore).id,
  }
}

function getRecoveryMessage({ forestScore, hasAccountData }) {
  if (forestScore >= 71) {
    return "Veel groen en groei."
  }

  if (forestScore <= 45) {
    return "Rustig herstellen."
  }

  return hasAccountData ? "Gebaseerd op accountdata." : "Voorbeeldweergave."
}

function createSceneItem(index, typePool, layer = "mid") {
  const x = 5 + ((index * 17 + layer.length * 11) % 90)
  const depth = index % 3
  const type = typePool[index % typePool.length]

  return {
    id: `${layer}-${type}-${index}`,
    type,
    layer,
    x,
    y: depth,
    scale: Number((0.76 + ((index * 7) % 9) / 20 + depth * 0.07).toFixed(2)),
    delay: `${(index % 12) * 55}ms`,
  }
}

function buildForestScene(visualState) {
  const treeTypes = TREE_TYPES.slice(0, visualState.treeSpecies)
  const plantTypes = PLANT_TYPES.slice(0, visualState.plantSpecies)
  const backTrees = Math.floor(visualState.treeCount * 0.34)
  const midTrees = Math.floor(visualState.treeCount * 0.36)
  const frontTrees = visualState.treeCount - backTrees - midTrees
  const classicTileCount = Math.round(
    clamp(10 + visualState.treeCount * 0.7 + visualState.plantCount * 0.35, 14, 48)
  )

  return {
    treesBack: Array.from({ length: backTrees }, (_, index) =>
      createSceneItem(index, treeTypes, "back")
    ),
    treesMid: Array.from({ length: midTrees }, (_, index) =>
      createSceneItem(index + backTrees, treeTypes, "mid")
    ),
    treesFront: Array.from({ length: frontTrees }, (_, index) =>
      createSceneItem(index + backTrees + midTrees, treeTypes, "front")
    ),
    plants: Array.from(
      { length: visualState.plantCount + visualState.flowerBoost },
      (_, index) => createSceneItem(index, plantTypes, "plant")
    ),
    patches: Array.from({ length: visualState.damagedPatches }, (_, index) => ({
      id: `patch-${index}`,
      x: 9 + ((index * 19) % 80),
      y: 74 + (index % 2) * 10,
    })),
    ponds: Array.from({ length: visualState.pondCount }, (_, index) => ({
      id: `pond-${index}`,
      x: index === 0 ? 70 : 22,
      y: index === 0 ? 77 : 84,
    })),
    animals: Array.from({ length: visualState.animalCount }, (_, index) => ({
      id: `animal-${index}`,
      x: 14 + ((index * 21) % 72),
      y: 73 + (index % 3) * 7,
      type: index % 2 === 0 ? "rabbit" : "bird",
    })),
    lightBeams: Array.from({ length: visualState.lightBeams }, (_, index) => ({
      id: `light-${index}`,
      x: 14 + index * 18,
    })),
    classicTiles: Array.from({ length: classicTileCount }, (_, index) => {
      const tileTypes = ["tree", "pine", "grass", "sapling", "flower", "mushroom", "bush", "water"]
      return {
        id: `retro-${index}`,
        type: tileTypes[index % Math.min(tileTypes.length, visualState.plantSpecies + 3)],
      }
    }),
  }
}

function calculateEmissionForestScore({ weeklyEmission, weeklyGoal, hasRealData }) {
  if (!hasRealData || weeklyEmission <= 0) {
    return DEFAULT_FOREST_PREVIEW_SCORE
  }

  const ratio = weeklyEmission / Math.max(1, weeklyGoal)

  if (ratio >= 1.5) return 18
  if (ratio >= 1.15) return 34
  if (ratio >= 0.9) return 58
  if (ratio >= 0.7) return 76
  return 92
}

function getPreviewForestScore({ activeScenario, weeklyEmission, weeklyGoal, hasRealData }) {
  if (activeScenario === "real") {
    return calculateEmissionForestScore({ weeklyEmission, weeklyGoal, hasRealData })
  }

  return TEST_SCENARIOS.find((scenario) => scenario.id === activeScenario)?.forestScore ??
    DEFAULT_FOREST_PREVIEW_SCORE
}

function getEcosystemMetrics({ forestScore, upgrades }) {
  const meadowLevel = getSafeNumber(upgrades["flower-meadow"])
  const waterLevel = getSafeNumber(upgrades["water-pond"])
  const wildlifeLevel = getSafeNumber(upgrades.wildlife)
  const mixedLevel = getSafeNumber(upgrades["mixed-grove"])

  return [
    {
      id: "biodiversity",
      label: "Biodiversiteit",
      value: Math.round(clamp(forestScore * 0.64 + meadowLevel * 10 + wildlifeLevel * 9 + mixedLevel * 6, 8, 100)),
    },
    {
      id: "water",
      label: "Water",
      value: Math.round(clamp(forestScore * 0.52 + waterLevel * 18, 10, 100)),
    },
    {
      id: "soil",
      label: "Bodem",
      value: Math.round(clamp(forestScore * 0.58, 8, 100)),
    },
    {
      id: "growth",
      label: "Groei",
      value: Math.round(clamp(forestScore * 0.7 + mixedLevel * 6 + meadowLevel * 5, 8, 100)),
    },
  ]
}

function BosVisualisatie() {
  const [activeScenario, setActiveScenario] = useState("real")
  const [visualMode, setVisualMode] = useState(getStoredVisualMode)
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false)
  const [isChillProgressOpen, setIsChillProgressOpen] = useState(false)
  const forestUpgrades = useMemo(() => ({}), [])
  const [accountForestData, setAccountForestData] = useState(null)
  const [accountDataStatus, setAccountDataStatus] = useState("local")
  const localForestData = useMemo(() => getDataForForest(), [])
  const weeklyGoal = useMemo(() => getWeeklyGoal(), [])
  const usesAccountScope = accountDataStatus === "account" || accountDataStatus === "empty"
  const forestData = usesAccountScope
    ? accountForestData || getEmptyAccountForestData()
    : localForestData
  const hasAccountData = accountDataStatus === "account"
  const dataLabel = hasAccountData ? "Account" : forestData.hasRealData ? "Lokaal" : "Voorbeeld"

  useEffect(() => {
    let isActive = true

    const unsubscribe = watchAuthState((user) => {
      if (!isActive) {
        return
      }

      if (!user || user.isAnonymous) {
        setAccountForestData(null)
        setAccountDataStatus("local")
        return
      }

      setAccountDataStatus("loading")

      getUserQuestionnaireData(user.uid)
        .then((userData) => {
          if (!isActive) {
            return
          }

          const nextForestData = getAccountDataForForest(userData)
          setAccountForestData(nextForestData)
          setAccountDataStatus(nextForestData.hasRealData ? "account" : "empty")
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.warn("Firebase bosdata laden mislukt:", error)
          setAccountForestData(null)
          setAccountDataStatus("error")
        })
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  const realSnapshot = useMemo(() => {
    return applyLatestFootprint(
      buildSafeImpactSnapshot(forestData.profileAnswers, forestData.weeklyAnswers),
      forestData.latestFootprint
    )
  }, [forestData.latestFootprint, forestData.profileAnswers, forestData.weeklyAnswers])

  const snapshot = useMemo(() => {
    return buildScenarioSnapshot(realSnapshot, weeklyGoal, activeScenario)
  }, [activeScenario, realSnapshot, weeklyGoal])

  const totalEmission = roundKg(snapshot?.weeklyEmission)
  const savedKg = calculateSavedKg({ weeklyEmission: totalEmission, weeklyGoal })
  const upgradeLevels = getUpgradeLevelTotal(forestUpgrades)
  const previewForestScore = getPreviewForestScore({
    activeScenario,
    weeklyEmission: totalEmission,
    weeklyGoal,
    hasRealData: forestData.hasRealData,
  })
  const forestScore = calculateForestScore({
    previewScore: previewForestScore,
  })
  const forestStatus = getForestStatus(forestScore)
  const visualState = getForestVisualState({ forestScore, upgrades: forestUpgrades })
  const scene = buildForestScene(visualState)
  const forestLevel = clamp(Math.floor(forestScore / 20) + 1 + upgradeLevels, 1, 20)
  const currentVisualMode = VISUAL_MODES.find((mode) => mode.id === visualMode) || VISUAL_MODES[0]
  const ecosystemMetrics = getEcosystemMetrics({
    forestScore,
    upgrades: forestUpgrades,
  })
  const recoveryMessage = getRecoveryMessage({
    forestScore,
    hasAccountData,
  })

  const changeVisualMode = (mode) => {
    setVisualMode(mode)
    setIsModeMenuOpen(false)
    writeStorageItem("forest-visual-mode", mode)
  }

  return (
    <div className="calculator-page forest-page">
      <AppHeader title="Bos" icon={<LuTrees />} />

      <div className="calculator-card forest-card">
        <p className="section-label dark">Bosvisualisatie</p>
        <h1 className="calculator-title">Mijn bos</h1>
        <p className="calculator-text">
          Eerste versie van je bos op basis van duurzame keuzes.
        </p>

        <div className="forest-view-dropdown">
          <button
            type="button"
            className="forest-mode-select"
            aria-expanded={isModeMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setIsModeMenuOpen((open) => !open)}
          >
            <span>Weergave</span>
            <strong>{currentVisualMode.label}</strong>
          </button>

          {isModeMenuOpen && (
            <div className="forest-mode-menu" role="listbox" aria-label="Kies bosweergave">
              {VISUAL_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`forest-mode-option${visualMode === mode.id ? " active" : ""}`}
                  onClick={() => changeVisualMode(mode.id)}
                  role="option"
                  aria-selected={visualMode === mode.id}
                >
                  <strong>{mode.label}</strong>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={`forest-visual forest-world ${visualMode} forest-state-${forestStatus.id}`}
          aria-label={`Bosvisualisatie met forestScore ${forestScore} van 100 en ${visualState.treeCount} bomen`}
        >
          {visualMode === "classic" ? (
            <div className="forest-retro-grid" aria-hidden="true">
              {scene.classicTiles.map((tile) => (
                <span key={tile.id} className={`forest-retro-tile ${tile.type}`} />
              ))}
            </div>
          ) : (
            <>
              <div className="forest-world-sky" aria-hidden="true">
                <span className="forest-world-sun" />
                {scene.lightBeams.map((beam) => (
                  <span
                    key={beam.id}
                    className="forest-light-beam"
                    style={{ left: `${beam.x}%` }}
                  />
                ))}
                <span className="forest-cloud cloud-1" />
                <span className="forest-cloud cloud-2" />
              </div>

              <div className="forest-world-layer back" aria-hidden="true">
                {scene.treesBack.map((tree) => (
                  <span
                    key={tree.id}
                    className={`forest-rich-tree ${tree.type}`}
                    style={{
                      left: `${tree.x}%`,
                      "--tree-scale": tree.scale,
                      "--tree-delay": tree.delay,
                    }}
                  />
                ))}
              </div>

              <div className="forest-world-layer mid" aria-hidden="true">
                {scene.treesMid.map((tree) => (
                  <span
                    key={tree.id}
                    className={`forest-rich-tree ${tree.type}`}
                    style={{
                      left: `${tree.x}%`,
                      "--tree-scale": tree.scale,
                      "--tree-delay": tree.delay,
                    }}
                  />
                ))}
              </div>

              <div className="forest-world-layer front" aria-hidden="true">
                {scene.treesFront.map((tree) => (
                  <span
                    key={tree.id}
                    className={`forest-rich-tree ${tree.type}`}
                    style={{
                      left: `${tree.x}%`,
                      "--tree-scale": tree.scale,
                      "--tree-delay": tree.delay,
                    }}
                  />
                ))}
              </div>

              <div className="forest-floor-details" aria-hidden="true">
                {scene.patches.map((patch) => (
                  <span
                    key={patch.id}
                    className="forest-soil-patch"
                    style={{ left: `${patch.x}%`, top: `${patch.y}%` }}
                  />
                ))}
                {scene.ponds.map((pond) => (
                  <span
                    key={pond.id}
                    className="forest-pond"
                    style={{ left: `${pond.x}%`, top: `${pond.y}%` }}
                  />
                ))}
                {scene.plants.map((plant) => (
                  <span
                    key={plant.id}
                    className={`forest-rich-plant ${plant.type}`}
                    style={{
                      left: `${plant.x}%`,
                      top: `${74 + (plant.y % 3) * 7}%`,
                      "--plant-scale": plant.scale,
                      "--plant-delay": plant.delay,
                    }}
                  />
                ))}
                {scene.animals.map((animal) => (
                  <span
                    key={animal.id}
                    className={`forest-critter ${animal.type}`}
                    style={{ left: `${animal.x}%`, top: `${animal.y}%` }}
                  />
                ))}
              </div>

            </>
          )}
        </div>

        <div className="forest-status-panel">
          <span>Bosstatus</span>
          <strong>{forestStatus.text}</strong>
          <p>{recoveryMessage}</p>
        </div>

        <div className="forest-main-result forest-impact-stats">
          <div>
            <span>Losse weekuitstoot</span>
            <strong>{totalEmission} kg</strong>
          </div>
          <div>
            <span>Doel</span>
            <strong>{roundKg(weeklyGoal)} kg</strong>
          </div>
          <div>
            <span>Bespaard</span>
            <strong>{savedKg} kg</strong>
          </div>
          <div>
            <span>Data</span>
            <strong>{dataLabel}</strong>
          </div>
        </div>

        <div className={`forest-chill-progress${isChillProgressOpen ? " open" : ""}`}>
          <button
            type="button"
            className="forest-chill-toggle"
            aria-expanded={isChillProgressOpen}
            onClick={() => setIsChillProgressOpen((open) => !open)}
          >
            <span>Mijn chill progress</span>
            <strong>Level {forestLevel} · {forestScore}/100</strong>
            <small>{isChillProgressOpen ? "Verberg details" : "Bekijk details"}</small>
          </button>

          {isChillProgressOpen && (
            <div className="forest-chill-content">
              <div className="forest-score-panel">
                <div className="forest-score-ring" style={{ "--forest-score": `${forestScore}%` }}>
                  <strong>{forestScore}</strong>
                  <span>/100</span>
                </div>
                <div>
                  <span>{forestStatus.label}</span>
                  <strong>{visualState.treeCount} bomen · {visualState.plantCount} plantjes</strong>
                  <p>
                    Databron: {dataLabel}.
                  </p>
                </div>
              </div>

              <div className="forest-ecosystem-grid" aria-label="Ecosysteemwaarden">
                {ecosystemMetrics.map((metric) => (
                  <div key={metric.id} className={`forest-ecosystem-card${metric.reverse ? " reverse" : ""}`}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <div className="forest-ecosystem-track">
                      <i style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      </div>

      <BottomNav />
    </div>
  )
}

export default BosVisualisatie
