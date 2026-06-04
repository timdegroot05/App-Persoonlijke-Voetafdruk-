import "./activiteiten.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiMap,
  FiShoppingBag,
  FiZap,
} from "react-icons/fi"
import { LuLeaf, LuTrees } from "react-icons/lu"
import MobilePageShell from "../components/MobilePageShell"
import { buildImpactSnapshot } from "../utils/impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "../utils/questionnaireStorage"

const ACTIVITY_PROGRESS_KEY = "activity-progress"

const CATEGORY_ORDER = ["voeding", "consumptie", "transport", "energie"]

const ACTION_GROUPS = [
  {
    category: "voeding",
    title: "Voeding",
    actions: [
      {
        id: "food-plant-based",
        title: "Plantaardige maaltijd",
        body: "Vervang vandaag 1 maaltijd door een plantaardige keuze.",
        route: "/tips",
        estimateKg: 2.4,
        icon: LuLeaf,
      },
      {
        id: "food-local",
        title: "Kies lokaal",
        body: "Koop vandaag groente of fruit van het seizoen.",
        route: "/tips",
        estimateKg: 1.6,
        icon: LuLeaf,
      },
      {
        id: "food-no-waste",
        title: "Restjesdag",
        body: "Gebruik wat je al in huis hebt en voorkom voedselverspilling.",
        route: "/tips",
        estimateKg: 1.9,
        icon: LuLeaf,
      },
    ],
  },
  {
    category: "consumptie",
    title: "Consumptie",
    actions: [
      {
        id: "consumption-pause",
        title: "Koop-pauze",
        body: "Stel 1 niet-noodzakelijke aankoop uit.",
        route: "/tips",
        estimateKg: 4.5,
        icon: FiShoppingBag,
      },
      {
        id: "consumption-second-hand",
        title: "Kies tweedehands",
        body: "Check eerst of je iets tweedehands kunt vinden.",
        route: "/tips",
        estimateKg: 3.2,
        icon: FiShoppingBag,
      },
      {
        id: "consumption-repair",
        title: "Repareer iets kleins",
        body: "Maak iets bruikbaars weer heel in plaats van iets nieuws te kopen.",
        route: "/tips",
        estimateKg: 2.7,
        icon: FiShoppingBag,
      },
    ],
  },
  {
    category: "transport",
    title: "Transport",
    actions: [
      {
        id: "transport-green-trip",
        title: "Groene rit",
        body: "Pak fiets, lopen of OV voor 1 korte rit.",
        route: "/tips",
        estimateKg: 3.1,
        icon: FiMap,
      },
      {
        id: "transport-carpool",
        title: "Rijd samen",
        body: "Deel vandaag een autorit met iemand anders.",
        route: "/tips",
        estimateKg: 2.2,
        icon: FiMap,
      },
      {
        id: "transport-combine",
        title: "Combineer ritten",
        body: "Voorkom een extra rit door je stops te bundelen.",
        route: "/tips",
        estimateKg: 1.8,
        icon: FiMap,
      },
    ],
  },
  {
    category: "energie",
    title: "Energie",
    actions: [
      {
        id: "energy-reset",
        title: "Energie reset",
        body: "Zet apparaten uit stand-by en douche korter.",
        route: "/tips",
        estimateKg: 1.7,
        icon: FiZap,
      },
      {
        id: "energy-lights",
        title: "Lichten uit",
        body: "Laat vandaag nergens onnodig lampen branden.",
        route: "/tips",
        estimateKg: 1.1,
        icon: FiZap,
      },
      {
        id: "energy-lower-heat",
        title: "Thermostaat lager",
        body: "Zet de verwarming vandaag een graadje lager.",
        route: "/tips",
        estimateKg: 2.0,
        icon: FiZap,
      },
    ],
  },
]

function getCurrentWeekKey(date = new Date()) {
  const currentDate = new Date(date)
  const day = currentDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  currentDate.setHours(0, 0, 0, 0)
  currentDate.setDate(currentDate.getDate() + diff)
  return currentDate.toISOString().slice(0, 10)
}

function getStartOfWeek(date = new Date()) {
  const currentDate = new Date(date)
  const day = currentDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  currentDate.setHours(0, 0, 0, 0)
  currentDate.setDate(currentDate.getDate() + diff)
  return currentDate
}

function getStoredActivityProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACTIVITY_PROGRESS_KEY))
    return saved && typeof saved === "object" ? saved : {}
  } catch {
    return {}
  }
}

function saveActivityProgress(progress) {
  try {
    localStorage.setItem(ACTIVITY_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // De pagina blijft bruikbaar zonder localStorage.
  }
}

function Activiteiten() {
  const navigate = useNavigate()
  const location = useLocation()
  const categoryRailRefs = useRef({})
  const statsRailRef = useRef(null)
  const currentWeekKey = getCurrentWeekKey()
  const [activeCategoryIndexes, setActiveCategoryIndexes] = useState({})
  const [activeStatsIndex, setActiveStatsIndex] = useState(0)
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
  const [activityProgress, setActivityProgress] = useState(getStoredActivityProgress)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(savedGoal) && savedGoal >= 0 ? savedGoal : 150
  })
  const [goalDraft, setGoalDraft] = useState(() => String(weeklyGoal))
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const weeklyAnswers = useMemo(() => getLatestWeeklyAnswers(), [])
  const completedThisWeek = Array.isArray(activityProgress[currentWeekKey])
    ? activityProgress[currentWeekKey]
    : []

  const currentSnapshot = useMemo(() => {
    if (Object.keys(profileAnswers).length === 0 && Object.keys(weeklyAnswers).length === 0) {
      return null
    }

    return buildImpactSnapshot(profileAnswers, weeklyAnswers)
  }, [profileAnswers, weeklyAnswers])

  const weeklyEmission = currentSnapshot?.weeklyEmission ?? 86.8
  const hasWeeklyGoal = weeklyGoal > 0
  const savedKg = Math.max(0, Number((weeklyGoal - weeklyEmission).toFixed(1)))
  const excessKg = Math.max(0, Number((weeklyEmission - weeklyGoal).toFixed(1)))
  const goalProgress = Math.min(
    100,
    Math.max(0, weeklyGoal > 0 ? Math.round((savedKg / weeklyGoal) * 100) : 0)
  )
  const weeklyTargetLeft = Math.max(0, Number((weeklyGoal - weeklyEmission).toFixed(1)))
  const goalStatus = !hasWeeklyGoal
    ? "Vrij kiezen"
    : weeklyEmission <= weeklyGoal
      ? "Op schema"
      : "Boven je doel"
  const focusCategory = location.state?.focusCategory ?? currentSnapshot?.dominantCategory ?? null
  const categoryGroups = useMemo(() => {
    const groups = [...ACTION_GROUPS]

    groups.sort((a, b) => {
      if (a.category === focusCategory) return -1
      if (b.category === focusCategory) return 1
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    })

    return groups
  }, [focusCategory])

  const activityStats = useMemo(() => {
    const weeklyCompleted = completedThisWeek.length
    const totalCompleted = Object.values(activityProgress).reduce(
      (count, actions) => count + (Array.isArray(actions) ? actions.length : 0),
      0
    )

    return {
      weeklyCompleted,
      totalCompleted,
    }
  }, [activityProgress, completedThisWeek.length])

  useEffect(() => {
    localStorage.setItem("weekly-goal", String(weeklyGoal))
  }, [weeklyGoal])

  useEffect(() => {
    setGoalDraft(String(weeklyGoal))
  }, [weeklyGoal])

  const applyGoal = (value) => {
    const nextGoal = Math.min(300, Math.max(0, Number(value)))
    if (!Number.isFinite(nextGoal)) {
      return
    }

    setWeeklyGoal(nextGoal)
    setIsGoalEditorOpen(false)
  }

  const toggleAction = (actionId) => {
    setActivityProgress((current) => {
      const weeklyActions = current[currentWeekKey] || []
      const nextWeek = weeklyActions.includes(actionId)
        ? weeklyActions.filter((id) => id !== actionId)
        : [...weeklyActions, actionId]
      const nextProgress = {
        ...current,
        [currentWeekKey]: nextWeek,
      }

      saveActivityProgress(nextProgress)
      return nextProgress
    })
  }

  const updateActiveCategoryIndex = (category, element) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".activity-category-card")
    if (!firstCard) {
      return
    }

    const railGap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0")
    const cardWidth = firstCard.getBoundingClientRect().width + railGap
    const index = Math.round(element.scrollLeft / cardWidth)
    setActiveCategoryIndexes((current) => ({
      ...current,
      [category]: index,
    }))
  }

  const updateActiveStatsIndex = (element) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".activity-stats-card")
    if (!firstCard) {
      return
    }

    const railGap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0")
    const cardWidth = firstCard.getBoundingClientRect().width + railGap
    const index = Math.round(element.scrollLeft / cardWidth)
    setActiveStatsIndex(index)
  }

  return (
    <MobilePageShell
      title="Acties"
      icon={<FiActivity />}
      className="activiteiten-page"
      contentClassName="activiteiten-content"
    >
        <section className="activity-category-rail-section">
          <div className="activity-category-header">
            <p className="section-label dark">Verbeteracties</p>
          </div>

          <div className="activity-category-sections">
            {categoryGroups.map((group) => (
              <section key={group.category} className="activity-category-section">
                <div className="activity-category-card-head">
                  <span>{group.category}</span>
                </div>

                <div className="activity-category-dots" aria-hidden="true">
                  {group.actions.map((action, index) => (
                    <span
                      key={action.id}
                      className={`activity-category-dot${
                        index === (activeCategoryIndexes[group.category] || 0) ? " active" : ""
                      }`}
                    />
                  ))}
                </div>

                <div
                  ref={(element) => {
                    categoryRailRefs.current[group.category] = element
                  }}
                  className="activity-category-rail"
                  aria-label={`Horizontaal scrollbare ${group.title.toLowerCase()} acties`}
                  onScroll={(event) =>
                    updateActiveCategoryIndex(group.category, event.currentTarget)
                  }
                >
                  {group.actions.map((action) => {
                    const Icon = action.icon
                    const completed = completedThisWeek.includes(action.id)

                    return (
                      <article
                        key={action.id}
                        className={`activity-action-card activity-category-card${
                          completed ? " completed" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="activity-check-button"
                          onClick={() => toggleAction(action.id)}
                          aria-label={`${action.title} ${completed ? "ongedaan maken" : "afvinken"}`}
                        >
                          <FiCheckCircle />
                        </button>
                        <div className="activity-action-icon">
                          <Icon />
                        </div>
                        <div className="activity-action-copy">
                          <span>{group.category}</span>
                          <strong>{action.title}</strong>
                          <p>{action.body}</p>
                          <small>-{action.estimateKg} kg CO2e geschat</small>
                        </div>
                        <button
                          type="button"
                          className="activity-open-button"
                          onClick={() => navigate(action.route)}
                          aria-label={`${action.title} openen`}
                        >
                          <FiArrowRight />
                        </button>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="activity-stats-section">
          <div className="activity-category-header">
            <p className="section-label dark">Voortgang</p>
          </div>

          <div className="activity-category-dots" aria-hidden="true">
            {[0, 1].map((index) => (
              <span
                key={index}
                className={`activity-category-dot${index === activeStatsIndex ? " active" : ""}`}
              />
            ))}
          </div>

          <div
            ref={statsRailRef}
            className="activity-stats-rail"
            aria-label="Horizontaal scrollbare actie statistieken"
            onScroll={(event) => updateActiveStatsIndex(event.currentTarget)}
          >
            <section className="activity-stats-card">
              <span>Deze week</span>
              <strong>{activityStats.weeklyCompleted}</strong>
              <p>acties uitgevoerd in de huidige week.</p>
            </section>

            <section className="activity-stats-card">
              <span>Totaal</span>
              <strong>{activityStats.totalCompleted}</strong>
              <p>acties uitgevoerd sinds je bent begonnen.</p>
            </section>
          </div>
        </section>

        <section className="actie-focus-card activiteit-goal-card">
          <p className="section-label dark">Doel van deze week</p>
          <h2>{hasWeeklyGoal ? `${weeklyGoal} kg doel` : "Geen doel ingesteld"}</h2>
          <p>
            {!hasWeeklyGoal
              ? "Je mag ook zonder weekdoel bezig zijn. Kies alleen een doel als dat jou helpt."
              : goalStatus === "Op schema"
                ? `${weeklyTargetLeft} kg ruimte over tot je persoonlijke weekdoel.`
                : `${excessKg} kg boven je doel. Tijd om bij te sturen.`}
          </p>

          <div className="goal-status-row">
            <span className={`goal-status-chip${goalStatus === "Op schema" ? " success" : ""}`}>
              {goalStatus}
            </span>
            <span className="goal-status-meta">
              {hasWeeklyGoal
                ? `${Math.round(goalProgress)}% richting weekbuffer`
                : "Doelen zijn optioneel"}
            </span>
          </div>

          <button
            type="button"
            className="goal-edit-button"
            onClick={() => setIsGoalEditorOpen((current) => !current)}
          >
            {isGoalEditorOpen ? "Sluit doelen" : "Stel doel in"}
          </button>

          {isGoalEditorOpen ? (
            <div className="goal-editor">
              <label className="goal-editor-label">
                <span>Nieuw weekdoel (kg CO2e)</span>
                <input
                  type="number"
                  min="40"
                  max="300"
                  step="5"
                  value={goalDraft}
                  onChange={(event) => setGoalDraft(event.target.value)}
                />
              </label>

              <div className="goal-preset-row">
                {[90, 120, 150].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="goal-preset-chip"
                    onClick={() => applyGoal(preset)}
                  >
                    {preset} kg
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="goal-save-button"
                onClick={() => applyGoal(goalDraft)}
              >
                Doel opslaan
              </button>

              <button
                type="button"
                className="goal-reset-button"
                onClick={() => applyGoal(0)}
              >
                Geen doel instellen
              </button>
            </div>
          ) : null}
        </section>

        <section className="activity-forest-link">
          <div>
            <span>Mijn bos</span>
            <strong>Bekijk je visuele impact</strong>
          </div>
          <button type="button" onClick={() => navigate("/bos")}>
            <LuTrees />
          </button>
        </section>
    </MobilePageShell>
  )
}

export default Activiteiten
