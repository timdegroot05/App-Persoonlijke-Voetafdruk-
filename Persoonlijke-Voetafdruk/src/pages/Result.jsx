import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiAward, FiRefreshCcw } from "react-icons/fi"
import { calculateImpact } from "../utils/calculateImpact"
import { getVisibleQuestions } from "../data/questionnaires"
import { weeklyQuestions } from "../data/questions"
import AppHeader from "../components/AppHeader"
import { buildImpactSnapshot, saveImpactSnapshot } from "../utils/impactInsights"
import { getLatestWeeklyAnswers, getProfileAnswers } from "../utils/questionnaireStorage"

function Result() {
  const navigate = useNavigate()

  const weeklyAnswers = useMemo(() => {
    return getLatestWeeklyAnswers()
  }, [])
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const visibleWeeklyQuestions = useMemo(
    () => getVisibleQuestions(weeklyQuestions, weeklyAnswers),
    [weeklyAnswers]
  )

  const result = calculateImpact(weeklyAnswers, visibleWeeklyQuestions)
  const snapshot = useMemo(
    () => buildImpactSnapshot(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )
  const totalScore = snapshot.totalScore

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
      <h1 className="result-title">Jouw Impact</h1>

      <div className="result-hero-card">
        <div>
          <span className="result-hero-label">Duurzaamheidsscore</span>
          <div className="score">{totalScore}/186</div>
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
