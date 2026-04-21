import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiAward, FiRefreshCcw } from "react-icons/fi"
import { calculateImpact } from "../utils/calculateImpact"
import AppHeader from "../components/AppHeader"
import { buildImpactSnapshot, saveImpactSnapshot } from "../utils/impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "../utils/questionnaireStorage"

function Result() {
  const navigate = useNavigate()

  const weeklyAnswers = useMemo(() => {
    return getLatestWeeklyAnswers()
  }, [])
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const result = useMemo(
    () => calculateImpact(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )
  const snapshot = useMemo(
    () => buildImpactSnapshot(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )

  useEffect(() => {
    if (Object.keys(weeklyAnswers).length === 0) {
      return
    }

    saveImpactSnapshot(snapshot)
  }, [snapshot, weeklyAnswers])

  return (
    <div className="result">
      <AppHeader title="Resultaat" icon={<FiAward />} />

      <div className="page-section result-content">
      <p className="section-label dark">Jouw persoonlijke uitslag</p>
      <h1 className="result-title">Jouw weekuitstoot</h1>

      <div className="result-hero-card">
        <div>
          <span className="result-hero-label">Totale weekuitstoot</span>
          <div className="score">{snapshot.weeklyEmission} kg</div>
        </div>
        <p className="result-hero-text">
          Geschatte uitstoot in kg CO2e per week, berekend uit je basisprofiel en je antwoorden van deze week.
        </p>
      </div>

      <div className="category-scores">
        <div className="category-score">
          <strong>Wonen</strong>
          <span>{result.aangepaste_woninguitstoot} kg CO2e</span>
        </div>
        <div className="category-score">
          <strong>Auto</strong>
          <span>{result.auto_uitstoot} kg CO2e</span>
        </div>
        <div className="category-score">
          <strong>OV</strong>
          <span>{result.ov_uitstoot} kg CO2e</span>
        </div>
        <div className="category-score">
          <strong>Voeding</strong>
          <span>{result.voeding_uitstoot} kg CO2e</span>
        </div>
        <div className="category-score">
          <strong>Consumptie</strong>
          <span>{result.consumptie_uitstoot} kg CO2e</span>
        </div>
      </div>

      <p className="result-text">
        Indicatieve score: {snapshot.totalScore}/100. Dit overzicht laat zien welke onderdelen deze week het meest bijdragen aan je uitstoot.
      </p>

      <div className="result-actions">
        <button
          className="primary-button result-button"
          onClick={() => navigate("/home")}
        >
          Naar Home
          <FiArrowRight />
        </button>

        <button
          className="secondary-button"
          onClick={() => navigate("/weekly-questionnaire")}
        >
          <FiRefreshCcw />
          Wekelijkse vragenlijst opnieuw invullen
        </button>
      </div>
      </div>
    </div>
  )
}

export default Result
