import "./activiteiten.css"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiMap,
  FiShoppingBag,
  FiTarget,
  FiZap,
} from "react-icons/fi"
import { LuLeaf, LuTrees } from "react-icons/lu"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { buildImpactSnapshot } from "../utils/impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "../utils/questionnaireStorage"

const ACTIVITY_PROGRESS_KEY = "activity-progress"

const ACTION_CARDS = [
  {
    id: "food",
    category: "voeding",
    title: "Plantaardige maaltijd",
    body: "Vervang vandaag 1 maaltijd door een plantaardige keuze.",
    route: "/foodTasks",
    estimateKg: 2.4,
    icon: LuLeaf,
  },
  {
    id: "transport",
    category: "transport",
    title: "Groene rit",
    body: "Pak fiets, lopen of OV voor 1 korte rit.",
    route: "/transportTasks",
    estimateKg: 3.1,
    icon: FiMap,
  },
  {
    id: "energy",
    category: "energie",
    title: "Energie reset",
    body: "Zet apparaten uit stand-by en douche korter.",
    route: "/energyTasks",
    estimateKg: 1.7,
    icon: FiZap,
  },
  {
    id: "consumption",
    category: "consumptie",
    title: "Koop-pauze",
    body: "Stel 1 niet-noodzakelijke aankoop uit.",
    route: "/tips",
    estimateKg: 4.5,
    icon: FiShoppingBag,
  },
]

const FOCUS_COPY = {
  transport: {
    title: "Begin bij transport",
    body: "Hier pak je deze week waarschijnlijk de snelste winst.",
  },
  voeding: {
    title: "Begin bij voeding",
    body: "Een kleine eetkeuze kan meteen verschil maken.",
  },
  wonen: {
    title: "Begin thuis",
    body: "Kies een actie rond verwarming, douchen of stroom.",
  },
  energie: {
    title: "Begin bij energie",
    body: "Een korte energiebesparing is vandaag haalbaar.",
  },
  consumptie: {
    title: "Begin bij kopen",
    body: "Minder nieuw kopen geeft snel rust in je voetafdruk.",
  },
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
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
  const todayKey = getTodayKey()
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
  const [activityProgress, setActivityProgress] = useState(getStoredActivityProgress)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(savedGoal) && savedGoal >= 0 ? savedGoal : 150
  })
  const [goalDraft, setGoalDraft] = useState(() => String(weeklyGoal))
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const weeklyAnswers = useMemo(() => getLatestWeeklyAnswers(), [])
  const completedToday = Array.isArray(activityProgress[todayKey])
    ? activityProgress[todayKey]
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
  const activeFocus = FOCUS_COPY[focusCategory] ?? {
    title: "Kies 1 kleine actie met direct effect",
    body: "Begin klein en houd je voortgang vandaag simpel bij.",
  }
  const sortedActions = useMemo(() => {
    return [...ACTION_CARDS].sort((a, b) => {
      if (a.category === focusCategory) return -1
      if (b.category === focusCategory) return 1
      return b.estimateKg - a.estimateKg
    })
  }, [focusCategory])
  const completedCount = completedToday.length
  const completedImpact = ACTION_CARDS
    .filter((action) => completedToday.includes(action.id))
    .reduce((total, action) => total + action.estimateKg, 0)
  const actionProgress = Math.round((completedCount / ACTION_CARDS.length) * 100)
  const nextAction = sortedActions.find((action) => !completedToday.includes(action.id)) || sortedActions[0]

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
      const todaysActions = current[todayKey] || []
      const nextToday = todaysActions.includes(actionId)
        ? todaysActions.filter((id) => id !== actionId)
        : [...todaysActions, actionId]
      const nextProgress = {
        ...current,
        [todayKey]: nextToday,
      }

      saveActivityProgress(nextProgress)
      return nextProgress
    })
  }

  return (
    <div className="activiteiten-page">
      <AppHeader title="Acties" icon={<FiActivity />} />

      <div className="activiteiten-content">
        <header className="activiteiten-header">
          <p className="section-label dark">Actiehub</p>
          <h1>Vandaag verlagen</h1>
          <p>Kies kleine acties die passen bij je week.</p>
        </header>

        <section className="progress-box">
          <div className="progress-box-top">
            <div>
              <span>Vandaag</span>
              <strong>{completedCount}/{ACTION_CARDS.length} acties</strong>
            </div>
            <div className="progress-impact-badge">
              -{completedImpact.toFixed(1)} kg
            </div>
          </div>

          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${actionProgress}%` }} />
            </div>
            <span className="progress-text">{actionProgress}%</span>
          </div>
        </section>

        <section className="actie-focus-card">
          <div className="actie-focus-heading">
            <FiTarget />
            <span>Deze weekfocus</span>
          </div>
          <h2>{activeFocus.title}</h2>
          <p>{activeFocus.body}</p>
          {nextAction ? (
            <button
              type="button"
              className="actie-focus-button"
              onClick={() => toggleAction(nextAction.id)}
            >
              Doe: {nextAction.title}
            </button>
          ) : null}
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

        <section className="activity-action-list" aria-label="Acties voor vandaag">
          {sortedActions.map((action) => {
            const Icon = action.icon
            const completed = completedToday.includes(action.id)

            return (
              <article
                key={action.id}
                className={`activity-action-card${completed ? " completed" : ""}`}
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
                  <span>{action.category}</span>
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
      </div>

      <BottomNav />
    </div>
  )
}

export default Activiteiten
