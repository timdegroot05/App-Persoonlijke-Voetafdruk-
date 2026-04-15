import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FiCheckCircle, FiEdit3 } from "react-icons/fi"
import AppHeader from "../components/AppHeader"
import {
  getVisibleQuestions,
  initialProfileQuestions,
} from "../data/questionnaires"
import { weeklyQuestions } from "../data/questions"
import {
  getProfileAnswers,
  getWeekKey,
  getWeeklyEntry,
  saveProfileAnswers,
  saveWeeklyAnswers,
} from "../utils/questionnaireStorage"
import "../App.css"

function QuestionnaireEditor({ mode = "profile" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const questions = mode === "weekly" ? weeklyQuestions : initialProfileQuestions
  const [answers, setAnswers] = useState(() => {
    if (mode === "weekly") {
      return getWeeklyEntry(location.state?.weekKey || getWeekKey())?.answers || {}
    }

    return getProfileAnswers()
  })

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(questions, answers),
    [answers, questions]
  )

  const selectAnswer = (question, answer) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: {
        text: answer.text,
        impact: answer.impact,
      },
    }))
  }

  const saveAnswers = () => {
    const cleanedAnswers = visibleQuestions.reduce((result, question) => {
      if (answers[question.id]) {
        result[question.id] = answers[question.id]
      }

      return result
    }, {})

    if (mode === "weekly") {
      saveWeeklyAnswers(cleanedAnswers, location.state?.weekKey || getWeekKey())
    } else {
      saveProfileAnswers(cleanedAnswers)
    }

    navigate(location.state?.returnTo || "/profile")
  }

  return (
    <div className="calculator-page questionnaire-editor-page">
      <AppHeader
        title={mode === "weekly" ? "Wekelijkse vragen" : "Profiel bewerken"}
        icon={<FiEdit3 />}
      />

      <div className="tips-content questionnaire-editor-content">
        <section className="calculator-card">
          <p className="section-label dark">Bewerken</p>
          <h1 className="calculator-title">
            {mode === "weekly" ? "Pas je week aan" : "Pas je profiel aan"}
          </h1>
          <p className="calculator-text">
            Je kunt hieronder losse antwoorden aanpassen zonder de hele vragenlijst opnieuw stap voor stap te doorlopen.
          </p>
        </section>

        <section className="question-editor-list">
          {visibleQuestions.map((question) => (
            <article key={question.id} className="question-editor-card">
              <div className="question-header">
                <div className="category-title">{question.title}</div>
                <div className="question-text question-editor-text">{question.question}</div>
              </div>

              <div className="answers">
                {question.answers.map((answer) => {
                  const isSelected = answers[question.id]?.text === answer.text

                  return (
                    <button
                      key={answer.text}
                      type="button"
                      className={isSelected ? "answer selected" : "answer"}
                      onClick={() => selectAnswer(question, answer)}
                    >
                      <span>{answer.text}</span>
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </section>

        <section className="calculator-card questionnaire-editor-actions">
          <div className="home-questionnaire-status done">
            <FiCheckCircle />
            Klaar om op te slaan
          </div>

          <button
            type="button"
            className="goal-save-button"
            onClick={saveAnswers}
          >
            Opslaan
          </button>
        </section>
      </div>
    </div>
  )
}

export default QuestionnaireEditor
