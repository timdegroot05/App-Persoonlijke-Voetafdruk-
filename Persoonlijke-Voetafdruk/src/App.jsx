import { useState } from "react"
import Welcome from "./pages/Welcome"
import Questionnaire from "./pages/Questionnaire"
import Result from "./pages/Result"
import "./App.css"

function App() {
  const [screen, setScreen] = useState("welcome")
  const [result, setResult] = useState(null)

  const startQuestionnaire = () => {
    setScreen("questions")
  }

  const handleResult = (answers) => {
    setResult(answers)
    setScreen("result")
  }

  return (
    <>
      {screen === "welcome" && (
        <Welcome onStart={startQuestionnaire} />
      )}

      {screen === "questions" && (
        <Questionnaire setResult={handleResult} />
      )}

      {screen === "result" && (
        <Result answers={result} />
      )}
    </>
  )
}

export default App