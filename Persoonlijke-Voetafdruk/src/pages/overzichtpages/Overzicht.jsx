import "./overzicht.css"
import { useNavigate } from "react-router-dom"
import { FiBarChart2 } from "react-icons/fi"
import BottomNav from "../../components/BottomNav"
import AppHeader from "../../components/AppHeader"

function Overzicht() {
  const navigate = useNavigate()

  return (
    <div className="overzicht-page">
      <div className="overzicht-container">
        <AppHeader title="Overzicht" icon={<FiBarChart2 />} />

        <div className="overview-content">
        <section className="overzicht-summary-card">
          <p className="section-label dark">Jouw samenvatting</p>
          <h2>Je weekimpact in een oogopslag</h2>
          <div className="overzicht-summary-grid">
            <div className="overzicht-summary-stat">
              <span>Dagelijks</span>
              <strong>10 kg</strong>
            </div>
            <div className="overzicht-summary-stat">
              <span>Wekelijks</span>
              <strong>70 kg</strong>
            </div>
          </div>
        </section>

        <div
          className="overzicht-card overzicht-highlight clickable-card"
          onClick={() => navigate("/grootste-categorie")}
        >
          <h2>Grootste categorie</h2>
          <p>Vervoer met 30 kg CO2 per week</p>
        </div>

        <div className="overzicht-cards">
          <div
            className="overzicht-card clickable-card"
            onClick={() => navigate("/dagelijkse-uitstoot")}
          >
            <h2>Dagelijkse uitstoot</h2>
            <p>10 kg CO2</p>
          </div>

          <div
            className="overzicht-card clickable-card"
            onClick={() => navigate("/wekelijkse-uitstoot")}
          >
            <h2>Wekelijkse uitstoot</h2>
            <p>70 kg CO2</p>
          </div>

          <div
            className="overzicht-card clickable-card"
            onClick={() => navigate("/gemiddelde-week")}
          >
            <h2>Gemiddelde wekelijkse uitstoot</h2>
            <p>70 kg CO2</p>
          </div>

          <div
            className="overzicht-card clickable-card"
            onClick={() => navigate("/gemiddelde-jaar")}
          >
            <h2>Gemiddelde jaarlijkse uitstoot</h2>
            <p>3650 kg CO2</p>
          </div>
        </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

export default Overzicht
