import { useMemo, useState } from "react"
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
import { calculateImpact } from "../utils/calculateImpact"
import {
  getProfileAnswers,
  getWeeklyEntry,
  saveProfileAnswers,
  saveWeeklyAnswers,
} from "../utils/questionnaireStorage"
import {
  getWeekInfoFromKey,
  getWeeklyCheckinWeekInfo,
  saveWeeklyResult,
} from "../utils/weeklyResults"
import "../App.css"

function Questionnaire({ mode = "profile" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const questionnaireSource = mode === "weekly" ? weeklyQuestions : initialProfileQuestions
  const categoryOrder = useMemo(
    () =>
      mode === "weekly"
        ? ["voeding", "transport", "consumptie", "energie"]
        : ["wonen", "energie", "transport"],
    [mode]
  )
  const activeWeekInfo =
    mode === "weekly"
      ? location.state?.weekKey
        ? getWeekInfoFromKey(location.state.weekKey)
        : getWeeklyCheckinWeekInfo()
      : null
  const initialAnswers = useMemo(() => {
    if (mode === "weekly") {
      return getWeeklyEntry(activeWeekInfo?.weekStart)?.answers || {}
    }

    return getProfileAnswers()
  }, [activeWeekInfo?.weekStart, mode])
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
  const currentQuestionIndex = Math.min(
    currentQuestion,
    Math.max(0, visibleQuestions.length - 1)
  )

  const currentCategory = visibleQuestions[currentQuestionIndex]?.category || "energie"

  const selectAnswer = (answer) => {
    const current = visibleQuestions[currentQuestionIndex]

    if (!current) {
      return
    }

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

    if (currentQuestionIndex < nextVisibleQuestions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1)
    } else {
      if (mode === "weekly") {
        saveWeeklyAnswers(newAnswers, activeWeekInfo.weekStart)
        saveWeeklyResult(
          calculateImpact(getProfileAnswers(), newAnswers),
          activeWeekInfo
        )
        navigate(location.state?.returnTo || "/result", {
          state: { weekKey: activeWeekInfo.weekStart },
        })
        return
      }

      saveProfileAnswers(newAnswers)

      if (location.state?.returnTo) {
        navigate(location.state.returnTo)
        return
      }

      navigate("/result", {
        state: { profileResult: true },
      })
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1)
    }
  }

  return (
    <div className="app-container">
      <AppHeader
        title={mode === "weekly" ? "Wekelijkse vragenlijst" : "Startvragenlijst"}
        icon={<FiHelpCircle />}
        rightContent={mode === "profile" ? null : undefined}
      />

      <div className="page-section questionnaire-intro">
        <p className="section-label dark">
          Stap {currentQuestionIndex + 1} van {visibleQuestions.length}
        </p>
        <h1 className="questionnaire-title">
          {mode === "weekly"
            ? "Hoe zag jouw week eruit?"
            : "Vertel iets over jouw huishouden en woonsituatie"}
        </h1>
      </div>

      <CategoryNav category={currentCategory} categories={visibleCategories} />

      <ProgressBar
        current={currentQuestionIndex + 1}
        total={visibleQuestions.length}
      />

      <QuestionCard
        key={currentQuestionIndex}
        question={visibleQuestions[currentQuestionIndex]}
        selectAnswer={selectAnswer}
        selectedAnswerText={answers[visibleQuestions[currentQuestionIndex]?.id]?.text}
      />

      {currentQuestionIndex > 0 && (
        <button className="back-btn" onClick={previousQuestion}>
          Terug
        </button>
      )}
    </div>
  )
}

export default Questionnaire
