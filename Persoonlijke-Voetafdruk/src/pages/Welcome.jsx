import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiBarChart2, FiCompass } from "react-icons/fi"
import { LuLeaf } from "react-icons/lu"

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-hero">
          <div className="welcome-logo">
            <LuLeaf />
          </div>
          <div className="welcome-chip">Persoonlijke voetafdruk</div>
        </div>

        <h1 className="welcome-title">Impact</h1>

        <p className="welcome-text">
          Ontdek hoe duurzaam jouw leefstijl is en krijg inzicht in jouw
          persoonlijke impact op het milieu.
        </p>

        <p className="welcome-subtext">
          Beantwoord een paar korte vragen over voeding, transport en energie
          voordat je verder in de app kan gaan.
        </p>

        <div className="welcome-highlights">
          <div className="welcome-highlight">
            <FiBarChart2 />
            <span>Direct overzicht van je uitstoot</span>
          </div>
          <div className="welcome-highlight">
            <FiCompass />
            <span>Persoonlijke tips en acties</span>
          </div>
        </div>

        <button
          className="start-btn"
          onClick={() => navigate("/questionnaire")}
        >
          Start test
          <FiArrowRight />
        </button>
      </div>
    </div>
  )
}

export default Welcome
