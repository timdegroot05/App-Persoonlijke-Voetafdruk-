import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiAward, FiRefreshCcw } from "react-icons/fi";

import { calculateImpact } from "../utils/calculateImpact";
import AppHeader from "../components/AppHeader";
import { buildImpactSnapshot, saveImpactSnapshot } from "../utils/impactInsights";
import { saveQuestionnaire } from "../userService";
import { getCurrentUser } from "../auth";
import { watchAuthState } from "../authState";
import {
  getLatestWeeklyAnswers,
  getProfileAnswers,
  getWeeklyEntry,
} from "../utils/questionnaireStorage";
import {
  formatWeekRangeLabel,
  getWeekInfoFromKey,
} from "../utils/weeklyResults";

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [accountSaveState, setAccountSaveState] = useState("idle");
  const weekKey = location.state?.weekKey ?? null;
  const isProfileResult = Boolean(location.state?.profileResult);

  const activeWeekInfo = useMemo(() => {
    if (!weekKey) return null;
    return getWeekInfoFromKey(weekKey);
  }, [weekKey]);
  const isWeeklyResult = Boolean(activeWeekInfo);
  const activeWeekStart = activeWeekInfo?.weekStart ?? null;

  const weeklyAnswers = useMemo(() => {
    if (activeWeekStart) {
      return getWeeklyEntry(activeWeekStart)?.answers || {};
    }

    if (isProfileResult) {
      return {};
    }

    return getLatestWeeklyAnswers() || {};
  }, [activeWeekStart, isProfileResult]);

  const profileAnswers = useMemo(() => {
    return getProfileAnswers() || {};
  }, []);

  const result = useMemo(() => {
    return calculateImpact(profileAnswers, weeklyAnswers);
  }, [profileAnswers, weeklyAnswers]);

  const snapshot = useMemo(() => {
    return buildImpactSnapshot(profileAnswers, weeklyAnswers);
  }, [profileAnswers, weeklyAnswers]);

  useEffect(() => {
    if (
      Object.keys(profileAnswers).length === 0 &&
      Object.keys(weeklyAnswers).length === 0
    ) return;
    saveImpactSnapshot(snapshot);
  }, [profileAnswers, snapshot, weeklyAnswers]);

  useEffect(() => {
    return watchAuthState((user) => {
      setCurrentUser(user);
    });
  }, []);

  const hasLinkedAccount = Boolean(currentUser && !currentUser.isAnonymous);
  const footprint = useMemo(
    () => ({
      dailyCo2: Number((result.total / 7).toFixed(2)),
      weeklyCo2: Number(result.total.toFixed(2)),
      totalScore: snapshot.totalScore,
    }),
    [result.total, snapshot.totalScore]
  );

  useEffect(() => {
    async function saveToLinkedAccount() {
      if (!hasLinkedAccount || !currentUser?.uid) {
        return;
      }

      if (
        Object.keys(profileAnswers).length === 0 &&
        Object.keys(weeklyAnswers).length === 0
      ) {
        return;
      }

      if (accountSaveState === "saving" || accountSaveState === "saved") {
        return;
      }

      setAccountSaveState("saving");

      try {
        await saveQuestionnaire(
          currentUser.uid,
          weeklyAnswers,
          footprint,
          profileAnswers
        );
        setAccountSaveState("saved");
      } catch (error) {
        console.error("Fout bij automatisch opslaan:", error);
        setAccountSaveState("error");
      }
    }

    saveToLinkedAccount();
  }, [
    accountSaveState,
    currentUser?.uid,
    footprint,
    hasLinkedAccount,
    profileAnswers,
    weeklyAnswers,
  ]);

  async function handleContinueWithoutAccount() {
    const user = getCurrentUser();

    if (!user) {
      navigate("/home");
      return;
    }

    try {
      await saveQuestionnaire(user.uid, weeklyAnswers, footprint, profileAnswers);
      navigate("/home");
    } catch (error) {
      console.error("Fout bij opslaan:", error);
      navigate("/home");
    }
  }

  return (
    <div className="result">
      <AppHeader title="Resultaat" icon={<FiAward />} />

      <div className="page-section result-content">
        <p className="section-label dark">Jouw persoonlijke uitslag</p>
        <h1 className="result-title">
          {isProfileResult ? "Jouw basisuitstoot" : "Jouw weekuitstoot"}
        </h1>

        {activeWeekInfo ? (
          <p className="result-text">
            Week van{" "}
            {formatWeekRangeLabel(
              activeWeekInfo.weekStart,
              activeWeekInfo.weekEnd
            )}
          </p>
        ) : null}

        <div className="result-hero-card">
          <div>
            <span className="result-hero-label">Totale weekuitstoot</span>
            <div className="score">{snapshot.weeklyEmission} kg</div>
          </div>

          <p className="result-hero-text">
            {isProfileResult
              ? "Geschatte uitstoot op basis van je eerste test."
              : "Geschatte uitstoot in kg CO2e per week, berekend uit je profiel en weekantwoorden."}
          </p>
        </div>

        <div className="category-scores">
          <div className="category-score">
            <strong>Wonen</strong>
            <span>{result.aangepaste_woninguitstoot} kg CO2e</span>
          </div>

          <div className="category-score">
            <strong>Auto</strong>
            <span>{result.auto_uitstoot} kg CO2e</span>
          </div>

          <div className="category-score">
            <strong>OV</strong>
            <span>{result.ov_uitstoot} kg CO2e</span>
          </div>

          <div className="category-score">
            <strong>Voeding</strong>
            <span>{result.voeding_uitstoot} kg CO2e</span>
          </div>

          <div className="category-score">
            <strong>Consumptie</strong>
            <span>{result.consumptie_uitstoot} kg CO2e</span>
          </div>
        </div>

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
            onClick={() =>
              isWeeklyResult
                ? navigate("/weekly-questionnaire", {
                    state: { weekKey: activeWeekInfo.weekStart },
                  })
                : navigate("/questionnaire")
            }
          >
            <FiRefreshCcw />
            Opnieuw invullen
          </button>
        </div>

        {hasLinkedAccount || isWeeklyResult ? null : (
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
        )}
      </div>
    </div>
  );
}

export default Result;
