import { useState } from "react"
import { useNavigate } from "react-router"
import { questions } from "../data/questions"
import QuestionCard from "../components/QuestionCard"
import ProgressBar from "../components/ProgressBar"
import CategoryNav from "../components/CategoryNav"

function Questionnaire() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])

  const currentCategory = questions[currentQuestion].category

  const selectAnswer = (impact) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = impact
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      localStorage.setItem("answers", JSON.stringify(newAnswers))
      navigate("/resultaat")
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="app-container">
      <h1 className="app-title">Impact</h1>

      <CategoryNav category={currentCategory} />

      <ProgressBar
        current={currentQuestion + 1}
        total={questions.length}
      />

      <QuestionCard
        key={currentQuestion}
        question={questions[currentQuestion]}
        selectAnswer={selectAnswer}
      />

      {currentQuestion > 0 && (
        <button className="back-btn" onClick={previousQuestion}>
          Terug
        </button>
      )}
    </div>
  )
}

export default Questionnaire