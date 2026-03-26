import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiAward, FiRefreshCcw } from "react-icons/fi"
import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"
import AppHeader from "../components/AppHeader"

function Result() {
  const navigate = useNavigate()

  const answers = useMemo(() => {
    return JSON.parse(localStorage.getItem("answers")) || []
  }, [])

  const result = calculateImpact(answers, questions)
  const totalScore = Math.max(0, Math.round(100 - result.total))

  return (
    <div className="result">
      <AppHeader title="Resultaat" icon={<FiAward />} />

      <div className="page-section result-content">
      <p className="section-label dark">Jouw persoonlijke uitslag</p>
      <h1 className="result-title">Jouw Impact</h1>

      <div className="result-hero-card">
        <div>
          <span className="result-hero-label">Duurzaamheidsscore</span>
          <div className="score">{totalScore}/100</div>
        </div>
        <p className="result-hero-text">
          Hoe hoger je score, hoe dichter je al bij een duurzamere leefstijl zit.
        </p>
      </div>

      <div className="category-scores">
        {Object.entries(result.categories).map(([key, value]) => (
          <div key={key} className="category-score">
            <strong>{key}</strong>
            <span>{value} punten</span>
          </div>
        ))}
      </div>

      <p className="result-text">
        Dit overzicht laat zien waar jouw grootste kansen liggen om nog duurzamer te leven.
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
          onClick={() => navigate("/questionnaire")}
        >
          <FiRefreshCcw />
          Opnieuw invullen
        </button>
      </div>
      </div>
    </div>
  )
}

export default Result
