import { useMemo } from "react"
import { useNavigate } from "react-router"
import { calculateImpact } from "../utils/calculateImpact"
import { questions } from "../data/questions"

function Result() {
  const navigate = useNavigate()

  const answers = useMemo(() => {
    return JSON.parse(localStorage.getItem("answers")) || []
  }, [])

  const result = calculateImpact(answers, questions)

  return (
    <div className="result">
      <h1>Jouw Impact</h1>

      <div className="score">{result.total}</div>

      <div className="category-scores">
        {Object.entries(result.categories).map(([key, value]) => (
          <div key={key} className="category-score">
            <strong>{key}</strong>: {value}
          </div>
        ))}
      </div>

      <p className="result-text">
        Hoe lager je score, hoe duurzamer je leeft.
      </p>

      <button
        className="primary-button result-button"
        onClick={() => navigate("/home")}
      >
        Naar homepagina
      </button>
    </div>
  )
}

export default Result