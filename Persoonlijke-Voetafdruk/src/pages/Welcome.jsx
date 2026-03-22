import { useNavigate } from "react-router"

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-logo">🌍</div>

        <h1 className="welcome-title">Impact</h1>

        <p className="welcome-text">
          Ontdek hoe duurzaam jouw leefstijl is en krijg inzicht in jouw
          persoonlijke impact op het milieu.
        </p>

        <p className="welcome-subtext">
          Beantwoord een paar korte vragen over voeding, transport en energie.
        </p>

        <button
          className="start-btn"
          onClick={() => navigate("/vragen")}
        >
          Start test
        </button>
      </div>
    </div>
  )
}

export default Welcome