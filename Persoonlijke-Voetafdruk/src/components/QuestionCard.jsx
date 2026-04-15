import { useEffect, useState } from "react"

function QuestionCard({ question, selectAnswer, selectedAnswerText }) {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const selectedIndex = question.answers.findIndex(
      (answer) => answer.text === selectedAnswerText
    )
    setSelected(selectedIndex >= 0 ? selectedIndex : null)
  }, [question, selectedAnswerText])

  const choose = (answer, index) => {
    setSelected(index)

    setTimeout(() => {
      selectAnswer(answer)
    }, 200)
  }

  return (
    <div className="question-card fade">
      <div className="question-header">
        <div className="category-title">
          {question.title}
        </div>

        <div className="question-text">
          {question.question}
        </div>
      </div>

      <div className="answers">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={selected === index ? "answer selected" : "answer"}
            onClick={() => choose(answer, index)}
          >
            <span>{answer.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuestionCard
