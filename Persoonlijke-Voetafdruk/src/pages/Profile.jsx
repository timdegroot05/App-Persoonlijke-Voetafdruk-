import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { LuBell, LuLeaf } from "react-icons/lu"
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
import {
  getNotificationPermission,
  getNotificationSettings,
  isNotificationSupported,
  requestNotificationPermission,
  saveNotificationSettings,
  sendTestNotification,
} from "../utils/notifications"

function Profile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [username, setUsername] = useState(() => getProfileUsername())
  const [notificationSettings, setNotificationSettings] = useState(() =>
    getNotificationSettings()
  )
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermission()
  )
  const [notificationStatusText, setNotificationStatusText] = useState("")
  const [notificationPreview, setNotificationPreview] = useState(null)
  const profileAnswers = getProfileAnswers()
  const activeCheckinWeek = getWeeklyCheckinWeekInfo()

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
  const notificationSupported = isNotificationSupported()
  const notificationPermissionLabel = {
    granted: "Toegestaan",
    denied: "Geblokkeerd",
    default: "Nog niet gekozen",
    unsupported: "Niet ondersteund",
  }[notificationPermission]

  const updateNotificationSetting = async (key, value) => {
    if (value) {
      const permission = await requestNotificationPermission()
      setNotificationPermission(permission)

      if (permission !== "granted") {
        setNotificationStatusText(
          permission === "denied"
            ? "Notificaties zijn geblokkeerd in je browser."
            : "Deze browser ondersteunt geen notificaties."
        )
        return
      }
    }

    const nextSettings = saveNotificationSettings({ [key]: value })
    setNotificationSettings(nextSettings)
    setNotificationStatusText(value ? "Notificatie staat aan." : "Notificatie staat uit.")
  }

  const handleTestNotification = async () => {
    const testResult = await sendTestNotification()
    const permission =
      typeof testResult === "string" ? testResult : testResult.permission
    setNotificationPermission(permission)

    if (permission === "granted") {
      setNotificationStatusText(
        testResult.wasShown
          ? `Testmelding verzonden om ${testResult.timestamp}.`
          : "Browser gaf toestemming, maar kon de melding niet tonen."
      )
      setNotificationPreview({
        title: "Persoonlijke Voetafdruk",
        body: `Testmelding verzonden om ${testResult.timestamp}.`,
      })
      return
    }

    if (permission === "denied") {
      setNotificationStatusText("Notificaties zijn geblokkeerd in je browser.")
      setNotificationPreview(null)
      return
    }

    setNotificationStatusText("Deze browser ondersteunt geen notificaties.")
    setNotificationPreview(null)
  }

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

        <section className="calculator-card notification-card">
          <div className="notification-card-top">
            <div>
              <p className="section-label dark">Notificaties</p>
              <h2 className="calculator-title">Reminders</h2>
            </div>
            <span className="notification-card-icon">
              <LuBell />
            </span>
          </div>

          <p className="calculator-text">
            Zet meldingen aan voor je weekcheck-in en test direct of je browser
            ze kan tonen.
          </p>

          <div className="notification-status-row">
            <span>Status</span>
            <strong>{notificationPermissionLabel}</strong>
          </div>

          <label className="notification-toggle">
            <span>
              <strong>Weekcheck-in reminder</strong>
              <small>Melding wanneer je wekelijkse vragenlijst klaarstaat.</small>
            </span>
            <input
              type="checkbox"
              checked={notificationSettings.weeklyCheckin}
              onChange={(event) =>
                updateNotificationSetting("weeklyCheckin", event.target.checked)
              }
            />
          </label>

          <label className="notification-toggle">
            <span>
              <strong>Dagelijkse tip</strong>
              <small>Ontvang een tip wanneer je de app opent.</small>
            </span>
            <input
              type="checkbox"
              checked={notificationSettings.dailyTip}
              onChange={(event) =>
                updateNotificationSetting("dailyTip", event.target.checked)
              }
            />
          </label>

          <button
            type="button"
            className="goal-edit-button"
            onClick={handleTestNotification}
            disabled={!notificationSupported}
          >
            Test notificatie
          </button>

          {notificationStatusText ? (
            <p className="notification-helper-text">{notificationStatusText}</p>
          ) : null}

          {notificationPreview ? (
            <div className="notification-preview">
              <span>Voorbeeld</span>
              <strong>{notificationPreview.title}</strong>
              <p>{notificationPreview.body}</p>
            </div>
          ) : null}
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
