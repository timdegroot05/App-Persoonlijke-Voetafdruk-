import "./activiteiten.css"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FiActivity } from "react-icons/fi"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { buildImpactSnapshot } from "../utils/impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "../utils/questionnaireStorage"

function Activiteiten() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(savedGoal) && savedGoal >= 0 ? savedGoal : 0
  })
  const [goalDraft, setGoalDraft] = useState(() => String(weeklyGoal))
  const profileAnswers = getProfileAnswers()
  const weeklyAnswers = getLatestWeeklyAnswers()

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
  const dailyGoal = Number((weeklyGoal / 7).toFixed(1))
  const stretchGoal = Math.max(40, weeklyGoal - 20)
  const focusCategory = location.state?.focusCategory ?? null
  const focusCopy = {
    transport: {
      title: "Begin bij transport",
      body: "Kies een kleine actie rond reizen of verplaatsing voor de meeste directe winst.",
    },
    voeding: {
      title: "Begin bij voeding",
      body: "Kies een kleine actie rond eten om snel verschil te maken in je voetafdruk.",
    },
    wonen: {
      title: "Begin bij wonen",
      body: "Kies een kleine actie thuis om deze week direct op energie en verbruik te besparen.",
    },
    energie: {
      title: "Begin bij energie",
      body: "Kies een kleine energiebesparing die je meteen thuis kunt toepassen.",
    },
    consumptie: {
      title: "Begin bij consumptie",
      body: "Kies een kleine actie rond kopen of gebruiken om je impact te verlagen.",
    },
  }
  const activeFocus = focusCopy[focusCategory] ?? {
    title: "Kies 1 kleine actie met direct effect",
    body:
      "Begin bij transport of voeding. Dat zijn meestal de snelste plekken om winst te pakken in je persoonlijke voetafdruk.",
  }

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

  return (
    <div className="activiteiten-page">
      <AppHeader title="Acties" icon={<FiActivity />} />

      <div className="activiteiten-content">
        <header className="activiteiten-header">
          <h1>Kies je impact vandaag</h1>
          <p>Kleine acties, groot verschil</p>
        </header>

        <section className="progress-box">
          <p>2 acties voltooid vandaag</p>

          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-text">40/100</span>
          </div>
        </section>

        <section className="actie-focus-card">
          <p className="section-label dark">Deze weekfocus</p>
          <h2>{activeFocus.title}</h2>
          <p>{activeFocus.body}</p>
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

          {hasWeeklyGoal ? (
            <div className="goal-metrics-grid">
              <div className="goal-metric-card">
                <span>Dagdoel</span>
                <strong>{dailyGoal} kg</strong>
              </div>
              <div className="goal-metric-card">
                <span>Stretch</span>
                <strong>{stretchGoal} kg</strong>
              </div>
            </div>
          ) : null}

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

        <section className="cards">
          <div className="actie-card food">
            <h2>Voedsel</h2>
            <p>Plantaardig lekkers</p>
            <button onClick={() => navigate("/foodTasks")}>
              Ontdek taken →
            </button>
          </div>

          <div className="actie-card transport">
            <h2>Transport</h2>
            <p>Groenere reizen</p>
            <button onClick={() => navigate("/transportTasks")}>
              Ontdek taken →
            </button>
          </div>

          <div className="actie-card energy">
            <h2>Energie</h2>
            <p>Slim verbruik</p>
            <button onClick={() => navigate("/energyTasks")}>
              Ontdek taken →
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Activiteiten
