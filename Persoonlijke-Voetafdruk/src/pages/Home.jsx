import { useMemo } from "react"
import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"
import "../App.css"

function Home() {
  const savedAnswers = JSON.parse(localStorage.getItem("answers")) || []

  const emissionData = useMemo(() => {
    if (savedAnswers.length === 0) {
      return {
        dailyEmission: 12.4,
        weeklyEmission: 86.8,
      }
    }

    const result = calculateImpact(savedAnswers, questions)
    const dailyEmission = Number((4 + result.total * 0.45).toFixed(1))
    const weeklyEmission = Number((dailyEmission * 7).toFixed(1))

    return {
      dailyEmission,
      weeklyEmission,
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

  return (
  <div className="home-page">
    <header className="home-header">
      <div className="header-left">🌍</div>

      <h1 className="header-title">Impact</h1>

      <div className="header-right"></div>
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

      <section className="tip-card">
        <p className="section-label dark">Tip van vandaag</p>
        <p className="tip-text">{tipOfTheDay}</p>
      </section>
    </div>
  )
}

export default Home