import { useEffect, useMemo, useState } from "react"
import { FiHelpCircle } from "react-icons/fi"
import { useLocation, useNavigate } from "react-router-dom"
import {
  getVisibleQuestions,
  initialProfileQuestions,
} from "../data/questionnaires"
import { weeklyQuestions } from "../data/questions"
import QuestionCard from "../components/QuestionCard"
import ProgressBar from "../components/ProgressBar"
import CategoryNav from "../components/CategoryNav"
import AppHeader from "../components/AppHeader"
import {
  getProfileAnswers,
  getWeekKey,
  getWeeklyEntry,
  isWeeklyQuestionnaireDue,
  saveProfileAnswers,
  saveWeeklyAnswers,
} from "../utils/questionnaireStorage"
import "../App.css"

function Questionnaire({ mode = "profile" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const questionnaireSource = mode === "weekly" ? weeklyQuestions : initialProfileQuestions
  const categoryOrder =
    mode === "weekly"
      ? ["voeding", "transport", "consumptie", "energie"]
      : ["wonen", "energie", "transport"]
  const initialAnswers = useMemo(() => {
    if (mode === "weekly") {
      return getWeeklyEntry(location.state?.weekKey || getWeekKey())?.answers || {}
    }

    return getProfileAnswers()
  }, [location.state?.weekKey, mode])
  const [answers, setAnswers] = useState(initialAnswers)
  const visibleQuestions = useMemo(() => {
    const filteredQuestions = getVisibleQuestions(questionnaireSource, answers)

    return [...filteredQuestions].sort(
      (firstQuestion, secondQuestion) =>
        categoryOrder.indexOf(firstQuestion.category) -
        categoryOrder.indexOf(secondQuestion.category)
    )
  }, [answers, categoryOrder, questionnaireSource])
  const visibleCategories = useMemo(
    () => [...new Set(visibleQuestions.map((question) => question.category))],
    [visibleQuestions]
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const currentCategory = visibleQuestions[currentQuestion]?.category || "energie"

  useEffect(() => {
    if (currentQuestion > visibleQuestions.length - 1) {
      setCurrentQuestion(Math.max(0, visibleQuestions.length - 1))
    }
  }, [currentQuestion, visibleQuestions.length])

  const selectAnswer = (answer) => {
    const current = visibleQuestions[currentQuestion]
    const newAnswers = {
      ...answers,
      [current.id]: {
        text: answer.text,
        impact: answer.impact,
      },
    }
    const nextVisibleQuestions = [...getVisibleQuestions(questionnaireSource, newAnswers)].sort(
      (firstQuestion, secondQuestion) =>
        categoryOrder.indexOf(firstQuestion.category) -
        categoryOrder.indexOf(secondQuestion.category)
    )

    setAnswers(newAnswers)

    if (currentQuestion < nextVisibleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      if (mode === "weekly") {
        saveWeeklyAnswers(newAnswers, location.state?.weekKey || getWeekKey())
        navigate(location.state?.returnTo || "/result")
        return
      }

      saveProfileAnswers(newAnswers)

      if (location.state?.returnTo) {
        navigate(location.state.returnTo)
        return
      }

      if (isWeeklyQuestionnaireDue()) {
        navigate("/weekly-questionnaire")
        return
      }

      navigate("/home")
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="app-container">
      <AppHeader
        title={mode === "weekly" ? "Wekelijkse vragenlijst" : "Startvragenlijst"}
        icon={<FiHelpCircle />}
      />

      <div className="page-section questionnaire-intro">
        <p className="section-label dark">
          Stap {currentQuestion + 1} van {visibleQuestions.length}
        </p>
        <h1 className="questionnaire-title">
          {mode === "weekly"
            ? "Hoe zag jouw week eruit?"
            : "Vertel iets over jouw huishouden en woonsituatie"}
        </h1>
      </div>

      <CategoryNav category={currentCategory} categories={visibleCategories} />

      <ProgressBar
        current={currentQuestion + 1}
        total={visibleQuestions.length}
      />

      <QuestionCard
        key={currentQuestion}
        question={visibleQuestions[currentQuestion]}
        selectAnswer={selectAnswer}
        selectedAnswerText={answers[visibleQuestions[currentQuestion]?.id]?.text}
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
