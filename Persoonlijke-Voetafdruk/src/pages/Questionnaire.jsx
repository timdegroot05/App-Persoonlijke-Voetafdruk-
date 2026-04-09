import { useState } from "react"
import { FiHelpCircle } from "react-icons/fi"
import { questions } from "../data/questions"
import QuestionCard from "../components/QuestionCard"
import ProgressBar from "../components/ProgressBar"
import CategoryNav from "../components/CategoryNav"
import { useNavigate } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import "../App.css"

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
      navigate("/result")
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="app-container">
      <AppHeader title="Vragenlijst" icon={<FiHelpCircle />} />

      <div className="page-section questionnaire-intro">
        <p className="section-label dark">Stap {currentQuestion + 1} van {questions.length}</p>
        <h1 className="questionnaire-title">Vertel iets over jouw dagelijkse keuzes</h1>
      </div>

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
