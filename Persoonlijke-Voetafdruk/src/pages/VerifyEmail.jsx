import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import AppHeader from "../components/AppHeader";
import { getCurrentUser } from "../auth";

function VerifyEmail() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  async function checkVerification() {
    const user = getCurrentUser();

    if (!user) {
      navigate("/login");
      return;
    }

    await user.reload();

    if (user.emailVerified) {
      navigate("/home");
    } else {
      setMessage("Je e-mailadres is nog niet geverifieerd. Controleer je mailbox.");
    }
  }

  return (
    <div className="result">
      <AppHeader title="Email verificatie" icon={<FiMail />} />

      <div className="page-section result-content">
        <p className="section-label dark">Bijna klaar</p>
        <h1 className="result-title">Controleer je mailbox</h1>

        <div className="result-hero-card">
          <p className="result-hero-text">
            We hebben een verificatiemail gestuurd. Klik op de link in je mail om je account te activeren.
          </p>
        </div>

        {message && <div className="auth-error-exact">{message}</div>}

        <div className="result-actions">
          <button className="primary-button result-button" onClick={checkVerification}>
            Ik heb mijn email geverifieerd
          </button>

          <button className="secondary-button" onClick={() => navigate("/login")}>
            Terug naar inloggen
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;