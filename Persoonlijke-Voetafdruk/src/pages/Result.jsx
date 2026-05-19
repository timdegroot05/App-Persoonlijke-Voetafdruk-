import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiAward, FiRefreshCcw } from "react-icons/fi";

import { calculateImpact } from "../utils/calculateImpact";
import { questions } from "../data/questions";
import AppHeader from "../components/AppHeader";

import { buildImpactSnapshot, saveImpactSnapshot } from "../utils/impactInsights";
import { saveQuestionnaire } from "../userService";
import { getCurrentUser } from "../auth";

function Result() {
  const navigate = useNavigate();

  const answers = useMemo(() => {
    return JSON.parse(localStorage.getItem("answers")) || [];
  }, []);

  const result = calculateImpact(answers, questions);
  const totalScore = Math.max(0, Math.round(100 - result.total));

  useEffect(() => {
    if (answers.length === 0) return;

    const snapshot = buildImpactSnapshot(answers);
    saveImpactSnapshot(snapshot);
  }, [answers]);

  // 🔥 NIEUW: opslaan + doorgaan
  async function handleContinueWithoutAccount() {
    const user = getCurrentUser();

    if (!user) {
      console.error("Geen gebruiker gevonden");
      return;
    }

    const footprint = {
      dailyCo2: result.total / 7,
      weeklyCo2: result.total,
      totalScore: totalScore,
    };

    try {
      await saveQuestionnaire(user.uid, answers, footprint);
      navigate("/home");
    } catch (error) {
      console.error("Fout bij opslaan:", error);
    }
  }

  return (
    <div className="result">
      <AppHeader title="Resultaat" icon={<FiAward />} />

      <div className="page-section result-content">
        <p className="section-label dark">Jouw persoonlijke uitslag</p>
        <h1 className="result-title">Jouw Impact</h1>

        {/* SCORE */}
        <div className="result-hero-card">
          <div>
            <span className="result-hero-label">Duurzaamheidsscore</span>
            <div className="score">{totalScore}/100</div>
          </div>
          <p className="result-hero-text">
            Hoe hoger je score, hoe dichter je al bij een duurzamere leefstijl zit.
          </p>
        </div>

        {/* CATEGORIEËN */}
        <div className="category-scores">
          {Object.entries(result.categories).map(([key, value]) => (
            <div key={key} className="category-score">
              <strong>{key}</strong>
              <span>{value} punten</span>
            </div>
          ))}
        </div>

        <p className="result-text">
          Dit overzicht laat zien waar jouw grootste kansen liggen om nog duurzamer te leven.
        </p>

        {/* ACTIES */}
        <div className="result-actions">
          <button
            className="primary-button result-button"
            onClick={() => navigate("/home")}
          >
            Naar Home
            <FiArrowRight />
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/questionnaire")}
          >
            <FiRefreshCcw />
            Opnieuw invullen
          </button>
        </div>

        {/* 🔥 AUTH BLOK */}
        <div className="auth-block">
          <h3>Wil je je resultaat opslaan?</h3>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            Maak een account of log in om je voortgang te bewaren.
          </p>

          <div className="auth-buttons">
            <button
              className="primary-button"
              onClick={() => navigate("/register")}
            >
              Account maken
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/login")}
            >
              Ik heb al een account
            </button>

            <button
              className="text-button"
              onClick={handleContinueWithoutAccount}
            >
              Doorgaan zonder account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;