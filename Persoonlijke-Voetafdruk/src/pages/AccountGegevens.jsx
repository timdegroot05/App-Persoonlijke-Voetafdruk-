import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiBell, FiSettings, FiUser } from "react-icons/fi"
import { LuLeaf } from "react-icons/lu"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { updateCurrentUserName } from "../auth"
import { watchAuthState } from "../authState"
import { getProfileUsername, saveProfileUsername } from "../utils/questionnaireStorage"
import { getUserName, saveUserName } from "../userService"
import {
  getNotificationPermission,
  getNotificationSettings,
  isNotificationSupported,
  requestNotificationPermission,
  saveNotificationSettings,
  sendTestNotification,
} from "../utils/notifications"

const NAV_THEMES = [
  { id: "forest", label: "Bosgroen" },
  { id: "light", label: "Licht" },
  { id: "blue", label: "Blauw" },
  { id: "dark", label: "Donker" },
]

function readStoredBoolean(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) !== false : fallback
  } catch {
    return fallback
  }
}

function AccountGegevens() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [usernameDraft, setUsernameDraft] = useState(() => getProfileUsername())
  const [message, setMessage] = useState("")
  const [navTheme, setNavTheme] = useState(() => {
    try {
      return localStorage.getItem("forest-nav-theme") || "forest"
    } catch {
      return "forest"
    }
  })
  const [compactMode, setCompactMode] = useState(() => readStoredBoolean("app-compact-mode", false))
  const [forestTaskToasts, setForestTaskToasts] = useState(() =>
    readStoredBoolean("forest-task-toast-enabled", true)
  )
  const [notificationSettings, setNotificationSettings] = useState(() =>
    getNotificationSettings()
  )
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermission()
  )
  const [notificationStatusText, setNotificationStatusText] = useState("")

  useEffect(() => {
    return watchAuthState(async (user) => {
      setCurrentUser(user)

      if (user?.uid && !user.isAnonymous) {
        try {
          const storedName = await getUserName(user.uid)

          if (storedName) {
            saveProfileUsername(storedName)
            setUsernameDraft(storedName)
            return
          }
        } catch (error) {
          console.error("Fout bij ophalen gebruikersnaam:", error)
        }
      }

      if (user?.displayName && !getProfileUsername()) {
        const syncedName = saveProfileUsername(user.displayName)
        setUsernameDraft(syncedName)
      }
    })
  }, [])

  const hasLinkedAccount = Boolean(currentUser && !currentUser.isAnonymous)
  const notificationSupported = isNotificationSupported()
  const notificationPermissionLabel = {
    granted: "Toegestaan",
    denied: "Geblokkeerd",
    default: "Nog niet gekozen",
    unsupported: "Niet ondersteund",
  }[notificationPermission]

  useEffect(() => {
    document.documentElement.dataset.navTheme = navTheme
    try {
      localStorage.setItem("forest-nav-theme", navTheme)
    } catch {
      // Alleen de voorkeur valt dan weg; de app blijft bruikbaar.
    }
  }, [navTheme])

  useEffect(() => {
    document.documentElement.dataset.appDensity = compactMode ? "compact" : "default"
    try {
      localStorage.setItem("app-compact-mode", JSON.stringify(compactMode))
    } catch {
      // Visuele voorkeur is optioneel.
    }
  }, [compactMode])

  useEffect(() => {
    try {
      localStorage.setItem("forest-task-toast-enabled", JSON.stringify(forestTaskToasts))
    } catch {
      // Visuele voorkeur is optioneel.
    }
  }, [forestTaskToasts])

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
      return
    }

    setNotificationStatusText(
      permission === "denied"
        ? "Notificaties zijn geblokkeerd in je browser."
        : "Deze browser ondersteunt geen notificaties."
    )
  }

  async function handleSave() {
    if (!hasLinkedAccount) {
      setMessage("Log eerst in om een gebruikersnaam in te stellen.")
      return
    }

    const cleanedName = usernameDraft.trim()

    if (!cleanedName) {
      setMessage("Vul eerst een gebruikersnaam in.")
      return
    }

    saveProfileUsername(cleanedName)

    try {
      await updateCurrentUserName(cleanedName)

      if (currentUser?.uid) {
        await saveUserName(currentUser.uid, cleanedName)
      }

      setMessage("Gebruikersnaam opgeslagen.")
    } catch {
      setMessage("Lokaal opgeslagen, maar synchroniseren met account lukte niet.")
    }
  }

  return (
    <div className="calculator-page profile-page">
      <AppHeader title="Instellingen" icon={<FiSettings />} />

      <div className="tips-content">
        <section className="calculator-card profile-hero-card">
          <div className="settings-card-top">
            <span className="app-logo-mark" aria-hidden="true">
              <LuLeaf />
            </span>
            <div>
              <p className="section-label dark">Snel instellen</p>
              <h1 className="calculator-title">Account & app</h1>
            </div>
          </div>

          {hasLinkedAccount ? (
            <div className="profile-name-editor">
              <label className="goal-editor-label" htmlFor="profile-username">
                <span>Gebruikersnaam</span>
                <input
                  id="profile-username"
                  type="text"
                  maxLength={30}
                  value={usernameDraft}
                  onChange={(event) => {
                    setUsernameDraft(event.target.value)
                    if (message) {
                      setMessage("")
                    }
                  }}
                />
              </label>

              <button
                type="button"
                className="goal-save-button profile-name-save"
                onClick={handleSave}
              >
                Naam opslaan
              </button>
            </div>
          ) : (
            <section className="profile-auth-banner">
              <span className="profile-auth-kicker">Accountstatus</span>
              <strong>Niet ingelogd</strong>
              <p>Log eerst in of maak een account aan om een gebruikersnaam te kiezen.</p>
            </section>
          )}

          {message ? (
            <p className="profile-name-message">{message}</p>
          ) : null}

          <div className="result-actions">
            {!hasLinkedAccount ? (
              <button
                type="button"
                className="primary-button result-button"
                onClick={() => navigate("/register")}
              >
                Account aanmaken
              </button>
            ) : null}

            {!hasLinkedAccount ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/login")}
              >
                Inloggen
              </button>
            ) : null}

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/profile")}
            >
              Terug naar profiel
            </button>
          </div>
        </section>

        <section className="calculator-card settings-card">
          <div className="settings-card-top">
            <span className="notification-card-icon">
              <FiSettings />
            </span>
            <div>
              <p className="section-label dark">Weergave</p>
              <h2 className="calculator-title">Snelle voorkeuren</h2>
            </div>
          </div>

          <label className="notification-toggle">
            <span>
              <strong>Compacte modus</strong>
              <small>Minder ruimte tussen onderdelen, minder scrollen.</small>
            </span>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(event) => setCompactMode(event.target.checked)}
            />
          </label>

          <label className="notification-toggle">
            <span>
              <strong>Bos taakmeldingen</strong>
              <small>Pop-up na voltooide bosactie tonen.</small>
            </span>
            <input
              type="checkbox"
              checked={forestTaskToasts}
              onChange={(event) => setForestTaskToasts(event.target.checked)}
            />
          </label>

          <div className="settings-theme-panel">
            <span>Takenbalkkleur</span>
            <div className="settings-theme-buttons">
              {NAV_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={navTheme === theme.id ? "active" : ""}
                  onClick={() => setNavTheme(theme.id)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="calculator-card notification-card">
          <div className="notification-card-top">
            <div>
              <p className="section-label dark">Notificaties</p>
              <h2 className="calculator-title">Reminders</h2>
            </div>
            <span className="notification-card-icon">
              <FiBell />
            </span>
          </div>

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
              <small>Ontvang een korte tip wanneer je de app opent.</small>
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
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default AccountGegevens
