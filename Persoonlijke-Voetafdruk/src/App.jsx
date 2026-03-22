import { Routes, Route, Navigate } from "react-router"
import Welcome from "./pages/Welcome"
import Questionnaire from "./pages/Questionnaire"
import Result from "./pages/Result"
import Home from "./pages/Home"
import "./App.css"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/vragen" element={<Questionnaire />} />
      <Route path="/resultaat" element={<Result />} />
      <Route path="/home" element={<Home />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App