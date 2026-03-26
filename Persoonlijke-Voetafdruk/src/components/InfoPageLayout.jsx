import "./InfoPageLayout.css"
import { useNavigate } from "react-router-dom"
import { FiBarChart2 } from "react-icons/fi"
import AppHeader from "./AppHeader"

function InfoPageLayout({ title, text }) {
  const navigate = useNavigate()

  return (
    <div className="info-page">
      <div className="info-container fade-in">
        <AppHeader title={title} icon={<FiBarChart2 />} />

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
