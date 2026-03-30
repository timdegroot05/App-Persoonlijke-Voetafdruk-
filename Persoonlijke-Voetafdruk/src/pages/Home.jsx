import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiMap } from "react-icons/fi"
import { HiOutlineCalculator } from "react-icons/hi"
import { LuLeaf, LuSprout, LuTrees, LuUtensilsCrossed } from "react-icons/lu"
import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import {
  buildImpactSnapshot,
  getFocusLabel,
  getImpactHistory,
  getPersonalInsight,
} from "../utils/impactInsights"
import "../App.css"

function Home() {
  const navigate = useNavigate()
  const dashboardRailRef = useRef(null)
  const insightRailRef = useRef(null)
  const [activeDashboardIndex, setActiveDashboardIndex] = useState(0)
  const [activeInsightIndex, setActiveInsightIndex] = useState(0)
  const savedAnswers = JSON.parse(localStorage.getItem("answers")) || []

  const currentSnapshot = useMemo(() => {
    if (savedAnswers.length === 0) {
      return null
    }

    return buildImpactSnapshot(savedAnswers)
  }, [savedAnswers])

  const emissionData = useMemo(() => {
    if (!currentSnapshot) {
      return {
        dailyEmission: 12.4,
        weeklyEmission: 86.8,
        score: 52,
        dominantCategory: "energie",
      }
    }

    return {
      dailyEmission: currentSnapshot.dailyEmission,
      weeklyEmission: currentSnapshot.weeklyEmission,
      score: currentSnapshot.totalScore,
      dominantCategory: currentSnapshot.dominantCategory,
    }
  }, [currentSnapshot])

  const history = useMemo(() => getImpactHistory(), [])
  const historyForChart = useMemo(() => {
    const baseHistory = history.length > 0 ? [...history].reverse() : []

    if (baseHistory.length === 0) {
      return [58, 64, 60, 68]
    }

    return baseHistory.slice(-4).map((entry) => entry.weeklyEmission)
  }, [history])

  const sustainabilityTips = [
    "Eén dag per week vegetarisch eten kan je uitstoot al merkbaar verlagen.",
    "De fiets pakken voor korte ritten is vaak de duurzaamste keuze.",
    "Lokale en seizoensproducten hebben meestal een lagere impact.",
    "Korter douchen bespaart zowel water als energie.",
    "Apparaten volledig uitzetten helpt sluipverbruik te verminderen.",
  ]

  const tipOfTheDay =
    sustainabilityTips[new Date().getDate() % sustainabilityTips.length]

  const facts = [
    "Plantaardiger eten verlaagt vaak sneller je uitstoot dan je denkt.",
    "Minder korte autoritten maakt vaak direct het grootste verschil.",
    "Sluipverbruik thuis zorgt ongemerkt voor extra uitstoot.",
  ]

  const factOfTheDay = facts[new Date().getDay() % facts.length]
  const personalInsight = getPersonalInsight(currentSnapshot)
  const focusLabel = getFocusLabel(emissionData.dominantCategory)

  const weeklyGoal = 150
  const savedKg = Math.max(
    0,
    Number((weeklyGoal - emissionData.weeklyEmission).toFixed(1))
  )
  const goalProgress = Math.min(
    100,
    Math.max(
      8,
      Math.round((savedKg / weeklyGoal) * 100)
    )
  )

  const dailyTrendBars = historyForChart.map((value, index) =>
    Math.max(24, Math.round(value * (index % 2 === 0 ? 1.1 : 1.25)))
  )

  const weeklyTargetLeft = Math.max(
    0,
    Number((weeklyGoal - emissionData.weeklyEmission).toFixed(1))
  )

  const dashboardCardsCount = 5
  const insightCardsCount = 3

  const updateActiveIndex = (element, setter) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".home-widget-rail-card")
    if (!firstCard) {
      return
    }

    const cardWidth = firstCard.getBoundingClientRect().width + 14
    const index = Math.round(element.scrollLeft / cardWidth)
    setter(index)
  }

  return (
  <div className="home-page">
    <AppHeader title="Impact" icon={<LuLeaf />} />

    <section
      className="home-feature-card action-card"
      onClick={() => navigate("/bos")}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          navigate("/bos")
        }
      }}
    >
      <div className="home-feature-header">
        <p className="section-label dark">Bos gamma</p>
        <div className="home-feature-icon">
          <LuTrees />
        </div>
      </div>

      <div className="home-feature-visual" aria-hidden="true">
        <span>🌿</span>
        <span>🌳</span>
        <span>🌱</span>
      </div>

      <p className="home-feature-copy">
        Zie jouw impact terug in een visueel bos dat meegroeit met je keuzes.
      </p>
    </section>

    <section className="emission-hero home-week-card">
      <p className="section-label dark">Wekelijkse uitstoot</p>
      <div className="home-week-panel">
        <h2 className="hero-number">{emissionData.weeklyEmission} kg CO₂e</h2>
      </div>
    </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Jouw dashboard</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div
          ref={dashboardRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare widgets"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveDashboardIndex)
          }
        >
          <div className="info-card compact daily-widget-card home-widget-rail-card">
          <div className="daily-widget-top">
            <div>
              <p className="section-label dark">Dagelijkse uitstoot</p>
              <p className="compact-number">{emissionData.dailyEmission} kg CO₂e</p>
            </div>

            <button
              type="button"
              className="daily-widget-icon daily-widget-link"
              onClick={() => navigate("/calculator")}
              aria-label="Ga naar calculator"
            >
              <HiOutlineCalculator />
            </button>
          </div>

          <div className="daily-widget-bottom">
            <div className="daily-widget-chart" aria-hidden="true">
              {dailyTrendBars.map((barHeight, index) => (
                <span
                  key={index}
                  className="daily-widget-bar"
                  style={{ height: `${barHeight}px` }}
                />
              ))}
            </div>

            <p className="daily-widget-note">
              Snelle inschatting van je gemiddelde dagelijkse impact.
            </p>
          </div>
          </div>

          <button
            className="info-card action-card home-action-card activity-quick-card home-widget-rail-card"
            onClick={() => navigate("/activiteiten")}
          >
            <p className="section-label dark">Activiteit</p>
            <p className="action-title">Kies je actie</p>
            <div className="activity-quick-button">
              <LuSprout />
            </div>
          </button>

          <section className="impact-widget home-progress-card home-widget-rail-card">
            <div className="impact-widget-top">
              <div>
                <p className="section-label dark">Voortgang</p>
                <h2 className="impact-widget-title">{emissionData.score}/100</h2>
              </div>
              <div className="impact-badge">Groene week</div>
            </div>

            <p className="impact-widget-text">
              Bespaard ten opzichte van je weekdoel: <strong>{savedKg} kg</strong>
            </p>

            <div className="goal-progress">
              <div
                className="goal-progress-fill"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </section>

          <section className="info-card co2-widget-card home-widget-rail-card">
            <p className="section-label dark">Doel van deze week</p>
            <h3 className="co2-widget-value">{weeklyTargetLeft} kg over</h3>
            <p className="co2-widget-copy">
              Nog deze hoeveelheid ruimte tot je persoonlijke weekdoel.
            </p>
          </section>

          <button
            className="info-card co2-widget-card co2-widget-link home-widget-rail-card"
            onClick={() => navigate("/overzicht")}
          >
            <div>
              <p className="section-label dark">Grootste categorie</p>
              <h3 className="co2-widget-value">{focusLabel}</h3>
              <p className="co2-widget-copy">
                Dit is nu de categorie waar je de meeste winst kunt pakken.
              </p>
            </div>
            <FiArrowRight className="co2-widget-arrow" />
          </button>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: dashboardCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeDashboardIndex ? " active" : ""}`}
            />
          ))}
        </div>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Snelle inzichten</p>
          <span className="home-rail-hint">Meer</span>
        </div>

        <div
          ref={insightRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare inzichten"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveInsightIndex)
          }
        >
          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <FiMap />
            </div>
            <p className="section-label dark">Vervoer focus</p>
            <h3 className="co2-widget-value">{focusLabel}</h3>
            <p className="co2-widget-copy">
              {personalInsight.body}
            </p>
          </section>

          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <LuUtensilsCrossed />
            </div>
            <p className="section-label dark">Persoonlijke tip</p>
            <h3 className="co2-widget-value">{personalInsight.title}</h3>
            <p className="co2-widget-copy">
              {tipOfTheDay}
            </p>
          </section>

          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <HiOutlineCalculator />
            </div>
            <p className="section-label dark">Historie</p>
            <h3 className="co2-widget-value">{history.length} metingen</h3>
            <p className="co2-widget-copy">
              {history.length > 1
                ? "Je voortgang wordt nu lokaal opgeslagen en gebruikt voor trends."
                : "Vul vaker de vragenlijst in om meer vergelijking over tijd te zien."}
            </p>
          </section>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: insightCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeInsightIndex ? " active" : ""}`}
            />
          ))}
        </div>
      </section>

      <section className="tip-card home-tip-card">
        <p className="section-label dark">Tips</p>
        <div className="home-tip-visual">Foto</div>
        <p className="tip-text">{tipOfTheDay}</p>
      </section>

      <section className="home-fact-card">
        <p className="section-label dark">Feitje</p>
        <p className="home-fact-text">{factOfTheDay}</p>
      </section>

      <BottomNav />
    </div>
  )
}

export default Home
