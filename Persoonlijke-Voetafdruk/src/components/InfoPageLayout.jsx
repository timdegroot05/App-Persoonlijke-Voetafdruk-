import "./InfoPageLayout.css"
import { useNavigate } from "react-router-dom"

function InfoPageLayout({ title, text, icon = "🌱" }) {
  const navigate = useNavigate()

  return (
    <div className="info-page">
      <div className="info-container fade-in">

        <div className="info-header">
          <div className="info-icon">{icon}</div>
          <h1 className="info-title">{title}</h1>
        </div>

        <div className="info-card slide-up">
          <p className="info-text">{text}</p>
        </div>

        <button
          className="info-button"
          onClick={() => navigate("/overzicht")}
        >
          ← Terug
        </button>

      </div>
    </div>
  )
}

export default InfoPageLayout