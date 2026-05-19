import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiUser } from "react-icons/fi"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { updateCurrentUserName } from "../auth"
import { watchAuthState } from "../authState"
import { getProfileUsername, saveProfileUsername } from "../utils/questionnaireStorage"
import { getUserName, saveUserName } from "../userService"

function AccountGegevens() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [usernameDraft, setUsernameDraft] = useState(() => getProfileUsername())
  const [message, setMessage] = useState("")

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
    } catch (error) {
      setMessage("Lokaal opgeslagen, maar synchroniseren met account lukte niet.")
    }
  }

  return (
    <div className="calculator-page profile-page">
      <AppHeader title="Accountgegevens" icon={<FiUser />} />

      <div className="tips-content">
        <section className="calculator-card profile-hero-card">
          <p className="section-label dark">Account</p>
          <h1 className="calculator-title">Gebruikersnaam</h1>

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
      </div>

      <BottomNav />
    </div>
  )
}

export default AccountGegevens
