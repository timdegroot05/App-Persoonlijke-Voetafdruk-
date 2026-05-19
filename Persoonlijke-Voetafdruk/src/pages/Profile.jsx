import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { LuLeaf } from "react-icons/lu"
import { logoutGebruiker } from "../auth"
import { watchAuthState } from "../authState"
import { getUserName } from "../userService"
import { buildImpactSnapshot, getFocusLabel, getImpactHistory } from "../utils/impactInsights"
import {
  getProfileAnswers,
  getProfileUsername,
  getWeeklyEntry,
  saveProfileUsername,
} from "../utils/questionnaireStorage"
import { initialProfileQuestions } from "../data/questionnaires"
import { getWeeklyCheckinWeekInfo } from "../utils/weeklyResults"

function getSafeWeeklyGoal() {
  const goal = Number(localStorage.getItem("weekly-goal"))
  return Number.isFinite(goal) && goal > 0 ? goal : 150
}

function getProgressStatus(savedKg, hasWeeklyAnswers) {
  if (!hasWeeklyAnswers) {
    return {
      title: "Nog geen weekmeting",
      text: "Vul deze week je vragen in.",
    }
  }

  if (savedKg > 0) {
    return {
      title: "Onder je weekdoel",
      text: `Je zit ${savedKg} kg CO₂e onder je doel.`,
    }
  }

  return {
    title: "Nieuwe kans deze week",
    text: "Kies één kleine actie om dichterbij je doel te komen.",
  }
}

function Profile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [username, setUsername] = useState(() => getProfileUsername())
  const profileAnswers = getProfileAnswers()
  const activeCheckinWeek = getWeeklyCheckinWeekInfo()
  const latestWeeklyAnswers = getWeeklyEntry(activeCheckinWeek.weekStart)?.answers || {}
  const weeklyGoal = getSafeWeeklyGoal()
  const history = useMemo(() => getImpactHistory(), [])
  const hasProfileAnswers = Object.keys(profileAnswers).length > 0
  const hasWeeklyAnswers = Object.keys(latestWeeklyAnswers).length > 0

  useEffect(() => {
    return watchAuthState((user) => {
      setCurrentUser(user)
    })
  }, [])

  useEffect(() => {
    async function loadStoredUserName() {
      if (!currentUser?.uid || currentUser.isAnonymous) {
        return
      }

      try {
        const storedName = await getUserName(currentUser.uid)

        if (storedName) {
          saveProfileUsername(storedName)
          setUsername(storedName)
        }
      } catch (error) {
        console.error("Fout bij ophalen gebruikersnaam:", error)
      }
    }

    loadStoredUserName()
  }, [currentUser])

  const snapshot = useMemo(() => {
    if (!hasProfileAnswers && !hasWeeklyAnswers) {
      return null
    }

    return buildImpactSnapshot(profileAnswers, latestWeeklyAnswers)
  }, [hasProfileAnswers, hasWeeklyAnswers, latestWeeklyAnswers, profileAnswers])

  const weeklyEmission = snapshot?.weeklyEmission ?? 86.8
  const focusLabel = getFocusLabel(snapshot?.dominantCategory ?? "energie")
  const savedKg = Math.max(0, Number((weeklyGoal - weeklyEmission).toFixed(1)))
  const progressStatus = getProgressStatus(savedKg, hasWeeklyAnswers)
  const hasLinkedAccount = Boolean(currentUser && !currentUser.isAnonymous)
  const displayName = username || currentUser?.displayName || "Gebruiker"
  const accountLabel = hasLinkedAccount
    ? currentUser.email || "Ingelogd account"
    : currentUser
      ? "Anonieme sessie"
      : "Niet ingelogd"
  const profileBadges = [
    {
      name: "Profiel klaar",
      description: "Je basisgegevens staan erin.",
      unlocked: hasProfileAnswers,
    },
    {
      name: "Week ingevuld",
      description: "Je weekvragen zijn ingevuld.",
      unlocked: hasWeeklyAnswers,
    },
    {
      name: "Onder doel",
      description: "Je uitstoot is lager dan je doel.",
      unlocked: savedKg > 0,
    },
    {
      name: "Bos gestart",
      description: "Je bos kan nu groeien.",
      unlocked: hasProfileAnswers || history.length > 0,
    },
  ]

  return (
    <div className="calculator-page profile-page">
      <AppHeader title="Profiel" icon={<LuLeaf />} />

      <div className="tips-content">
        <section className="calculator-card profile-hero-card">
          <p className="section-label dark">Profiel</p>
          <h1 className="calculator-title">{displayName}</h1>

          <div className={`profile-auth-banner${hasLinkedAccount ? " logged-in" : ""}`}>
            <span className="profile-auth-kicker">
              {hasLinkedAccount ? "Ingelogd" : "Accountstatus"}
            </span>
            <strong>{accountLabel}</strong>
          </div>

          <div className="profile-name-editor">
            <button
              type="button"
              className="goal-edit-button profile-account-button"
              onClick={() => navigate("/account-gegevens")}
            >
              Bewerk accountgegevens
            </button>
          </div>

          <div className="profile-summary-card">
            <span>{progressStatus.title}</span>
            <strong>{weeklyEmission} kg CO₂e</strong>
            <p>{progressStatus.text} Doel: {weeklyGoal} kg CO₂e</p>
          </div>

          <div className="profile-hero-grid">
            <div className="profile-hero-stat">
              <span>Marge</span>
              <strong>{savedKg > 0 ? `${savedKg} kg` : "0 kg"}</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Focus</span>
              <strong>{focusLabel}</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Week</span>
              <strong>{hasWeeklyAnswers ? "Ingevuld" : "Open"}</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Metingen</span>
              <strong>{history.length} metingen</strong>
            </div>
          </div>

          <div className="profile-action-row">
            <button type="button" onClick={() => navigate("/bos")}>
              Bekijk bos
            </button>
            <button type="button" onClick={() => navigate("/activiteiten")}>
              Kies actie
            </button>
          </div>
        </section>

        <section className="calculator-card">
          <p className="section-label dark">Opgeslagen profiel</p>
          <h2 className="calculator-title">Gegevens</h2>
          <p className="calculator-text">
            Dit zijn je vaste profielgegevens.
          </p>

          <div className="daily-widget-legend">
            {initialProfileQuestions.map((question) => {
              if (typeof question.showIf === "function" && !question.showIf(profileAnswers)) {
                return null
              }

              return (
                <div key={question.id} className="daily-widget-legend-item">
                  <span className="daily-widget-legend-label">
                    {question.summaryLabel || question.title}
                  </span>
                  <strong className="daily-widget-legend-value">
                    {profileAnswers[question.id]?.text || "Nog niet ingevuld"}
                  </strong>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="goal-edit-button"
            onClick={() => navigate("/profile-edit", { state: { returnTo: "/profile" } })}
          >
            Bewerk profielvragen
          </button>

          {hasLinkedAccount ? (
            <button
              type="button"
              className="secondary-button profile-register-button"
              onClick={async () => {
                await logoutGebruiker()
                navigate("/login")
              }}
            >
              Uitloggen
            </button>
          ) : (
            <button
              type="button"
              className="primary-button result-button profile-register-button"
              onClick={() => navigate("/register")}
            >
              Account aanmaken
            </button>
          )}
        </section>

        <section className="calculator-card">
          <p className="section-label dark">Wekelijkse check-in</p>
          <h2 className="calculator-title">Deze week</h2>
          <p className="calculator-text">
            {Object.keys(latestWeeklyAnswers).length > 0
              ? "Je weekvragen zijn opgeslagen."
              : "Je hebt deze week nog niets ingevuld."}
          </p>

          <button
            type="button"
            className="goal-edit-button"
            onClick={() =>
              navigate("/weekly-edit", {
                state: { returnTo: "/profile", weekKey: activeCheckinWeek.weekStart },
              })
            }
          >
            Bewerk wekelijkse vragen
          </button>
        </section>

        <section className="tips-list profile-badges-list">
          {profileBadges.map((badge) => (
            <article key={badge.name} className={`tips-list-card profile-badge-card${badge.unlocked ? " unlocked" : ""}`}>
              <p className="section-label dark">Stap</p>
              <h2>{badge.name}</h2>
              <p className="profile-badge-status">
                {badge.unlocked ? "Gedaan" : "Nog te doen"}
              </p>
              <p>{badge.description}</p>
            </article>
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Profile
