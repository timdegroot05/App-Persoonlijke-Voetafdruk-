import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogIn } from "react-icons/fi";
import AppHeader from "../components/AppHeader";
import { loginMetEmail } from "../auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginMetEmail(email, password);
      navigate("/home");
    } catch (err) {
      setError("Inloggen mislukt. Controleer je e-mail en wachtwoord.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="result">
      <AppHeader title="Inloggen" icon={<FiLogIn />} />

      <div className="page-section result-content">
        <p className="section-label dark">Welkom terug</p>
        <h1 className="result-title">Log in op je account</h1>

        <div className="result-hero-card">
          <p className="result-hero-text">
            Log in om je opgeslagen voetafdruk en voortgang terug te zien.
          </p>
        </div>

        <form className="auth-form-exact" onSubmit={handleLogin}>
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
              placeholder="Vul je wachtwoord in"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="auth-error-exact">{error}</div>}

          <div className="result-actions">
            <button className="primary-button result-button" type="submit" disabled={loading}>
              {loading ? "Bezig..." : "Inloggen"}
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              Nog geen account? Registreren
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

export default Login;