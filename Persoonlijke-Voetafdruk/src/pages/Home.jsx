import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"
import "../App.css"

function Home() {
  const navigate = useNavigate()
  const savedAnswers = JSON.parse(localStorage.getItem("answers")) || []

  const emissionData = useMemo(() => {
    if (savedAnswers.length === 0) {
      return {
        dailyEmission: 12.4,
        weeklyEmission: 86.8,
        score: 52,
      }
    }

    const result = calculateImpact(savedAnswers, questions)
    const dailyEmission = Number((4 + result.total * 0.45).toFixed(1))
    const weeklyEmission = Number((dailyEmission * 7).toFixed(1))
    const score = Math.max(12, Math.round(100 - result.total))

    return {
      dailyEmission,
      weeklyEmission,
      score,
    }
  }, [savedAnswers])

  const sustainabilityTips = [
    "Eén dag per week vegetarisch eten kan je uitstoot al merkbaar verlagen.",
    "De fiets pakken voor korte ritten is vaak de duurzaamste keuze.",
    "Lokale en seizoensproducten hebben meestal een lagere impact.",
    "Korter douchen bespaart zowel water als energie.",
    "Apparaten volledig uitzetten helpt sluipverbruik te verminderen.",
  ]

  const tipOfTheDay =
    sustainabilityTips[new Date().getDate() % sustainabilityTips.length]

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

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="brand-mark">🌍</div>
        <div>
          <p className="brand-label">Duurzaam leven app</p>
          <h1 className="brand-title">Impact</h1>
        </div>
      </header>

      <section className="emission-hero">
        <p className="section-label">Wekelijkse uitstoot</p>
        <h2 className="hero-number">{emissionData.weeklyEmission} kg CO₂e</h2>
        <p className="hero-subtext">
          Geschatte uitstoot op basis van jouw ingevulde vragenlijst
        </p>
      </section>

      <section className="home-grid single">
        <div className="info-card compact full-width">
          <p className="section-label dark">Dagelijkse uitstoot</p>
          <p className="compact-number">{emissionData.dailyEmission} kg CO₂e</p>
        </div>
      </section>

      <section className="home-grid">
        <button
          className="info-card action-card home-action-card"
          onClick={() => navigate("/overzicht")}
        >
          <p className="section-label dark">Inzichten</p>
          <p className="action-title">Bekijk overzicht</p>
          <span className="action-arrow">→</span>
        </button>

        <button
          className="info-card action-card home-action-card"
          onClick={() => navigate("/activiteiten")}
        >
          <p className="section-label dark">Aan de slag</p>
          <p className="action-title">Open activiteiten</p>
          <span className="action-arrow">→</span>
        </button>
      </section>

      <section className="impact-widget">
        <div className="impact-widget-top">
          <div>
            <p className="section-label">Persoonlijke voortgang</p>
            <h2 className="impact-widget-title">{emissionData.score}/100</h2>
          </div>
          <div className="impact-badge">Groene week</div>
        </div>

        <p className="impact-widget-text">
          Je zit op koers. Met kleine keuzes in vervoer en voeding maak je deze
          week al zichtbaar verschil.
        </p>

        <div className="goal-progress">
          <div
            className="goal-progress-fill"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        <div className="impact-stats">
          <div className="impact-stat-card">
            <span>Bespaard t.o.v. doel</span>
            <strong>{savedKg} kg</strong>
          </div>
          <div className="impact-stat-card">
            <span>Focus vandaag</span>
            <strong>Vervoer</strong>
          </div>
        </div>
      </section>

      <section className="tip-card">
        <p className="section-label dark">Tip van vandaag</p>
        <p className="tip-text">{tipOfTheDay}</p>
      </section>
    </div>
  )
}

export default Home
