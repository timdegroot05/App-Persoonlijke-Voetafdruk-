// src/pages/Login.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginMetEmail } from "../auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleLogin() {
    try {
      await loginMetEmail(email, password)
      navigate("/home")
    } catch (err) {
      alert("Login mislukt")
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inloggen</h1>

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

      <button onClick={handleLogin}>
        Inloggen
      </button>
    </div>
  )
}

export default Login