import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";
import AppHeader from "../components/AppHeader";
import { registreerNaVragenlijst } from "../auth";
import { saveQuestionnaire } from "../userService";
import { calculateImpact } from "../utils/calculateImpact";
import { questions } from "../data/questions";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Vul alle velden in.");
      return;
    }

    if (password.length < 6) {
      setError("Je wachtwoord moet minimaal 6 tekens hebben.");
      return;
    }

    if (password !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);

    try {
      const user = await registreerNaVragenlijst(email, password);

      const answers = JSON.parse(localStorage.getItem("answers")) || [];
      const result = calculateImpact(answers, questions);
      const totalScore = Math.max(0, Math.round(100 - result.total));

      const footprint = {
        dailyCo2: result.total / 7,
        weeklyCo2: result.total,
        totalScore,
      };

      await saveQuestionnaire(user.uid, answers, footprint);
      navigate("/home");
    } catch (err) {
      setError("Registratie mislukt. Probeer een ander e-mailadres.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="result">
      <AppHeader title="Registreren" icon={<FiUserPlus />} />

      <div className="page-section result-content">
        <p className="section-label dark">Bewaar je resultaat</p>
        <h1 className="result-title">Maak een account aan</h1>

        <div className="result-hero-card">
          <p className="result-hero-text">
            Maak een account om je persoonlijke voetafdruk en voortgang op te slaan.
          </p>
        </div>

        <form className="auth-form-exact" onSubmit={handleRegister}>
          <div className="auth-field-exact">
            <label htmlFor="email">E-mailadres</label>
            <input
              id="email"
              type="email"
              placeholder="Vul je e-mailadres in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field-exact">
            <label htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              placeholder="Kies een wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field-exact">
            <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Herhaal je wachtwoord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="auth-error-exact">{error}</div>}

          <div className="result-actions">
            <button className="primary-button result-button" type="submit" disabled={loading}>
              {loading ? "Bezig..." : "Account maken"}
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate("/login")}
            >
              Ik heb al een account
            </button>
          </div>
        </form>

        <div className="auth-block">
          <button
            className="text-button auth-back-exact"
            onClick={() => navigate("/result")}
          >
            <FiArrowLeft />
            Terug naar resultaat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;