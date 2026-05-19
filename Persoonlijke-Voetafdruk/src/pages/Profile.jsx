import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { LuLeaf } from "react-icons/lu"
import { logoutGebruiker } from "../auth"
import { watchAuthState } from "../authState"
import { getUserName } from "../userService"
import {
  getProfileAnswers,
  getProfileUsername,
  getWeeklyEntry,
  saveProfileUsername,
} from "../utils/questionnaireStorage"
import { initialProfileQuestions } from "../data/questionnaires"
import { getWeeklyCheckinWeekInfo } from "../utils/weeklyResults"

function Profile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [username, setUsername] = useState(() => getProfileUsername())
  const profileAnswers = getProfileAnswers()
  const activeCheckinWeek = getWeeklyCheckinWeekInfo()
  const latestWeeklyAnswers = getWeeklyEntry(activeCheckinWeek.weekStart)?.answers || {}

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

  const hasLinkedAccount = Boolean(currentUser && !currentUser.isAnonymous)
  const displayName = username || currentUser?.displayName || "Gebruiker"
  const accountLabel = hasLinkedAccount
    ? currentUser.email || "Ingelogd account"
    : currentUser
      ? "Anonieme sessie"
      : "Niet ingelogd"
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
        </section>

        <section className="calculator-card">
          <p className="section-label dark">Opgeslagen profiel</p>
          <h2 className="calculator-title">Gegevens</h2>

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
      </div>

      <BottomNav />
    </div>
  )
}

export default Profile
