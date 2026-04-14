// src/pages/Register.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registreerNaVragenlijst } from "../auth"
import { saveQuestionnaire } from "../userService"
import { getCurrentUser } from "../auth"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleRegister() {
    try {
      const user = await registreerNaVragenlijst(email, password)

      const answers = JSON.parse(localStorage.getItem("answers")) || []

      const footprint = {
        dailyCo2: 0,
        weeklyCo2: 0,
        totalScore: 0,
      }

      await saveQuestionnaire(user.uid, answers, footprint)

      navigate("/home")
    } catch (err) {
      alert("Registratie mislukt")
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Account maken</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>
        Account maken
      </button>
    </div>
  )
}

export default Register