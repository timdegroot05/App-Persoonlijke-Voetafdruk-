import { useNavigate } from "react-router-dom"
import { FiInfo } from "react-icons/fi"
import AppHeader from "../../components/AppHeader"
import "../../components/InfoPageLayout.css"

function AchtergrondimpactInfo() {
  const navigate = useNavigate()

  return (
    <div className="info-page">
      <div className="info-container fade-in">
        <AppHeader
          title="Achtergrondimpact"
          icon={<FiInfo />}
          rightContent={<span aria-hidden="true" />}
        />

        <div className="info-card slide-up">
          <p className="info-text">
            Een deel van je uitstoot hoort bij het leven van nu, denk aan
            energie, infrastructuur en (online)diensten die altijd doorgaan.
          </p>
          <p className="info-text info-text-spaced">
            Daarom zit er een vaste achtergrondimpact in je score.
          </p>
          <p className="info-text info-text-spaced">
            Maar hier zit het verschil: jouw keuzes bepalen wat daarboven
            gebeurt. En als steeds meer mensen, net als jij, bewuster gaan
            leven, daalt deze impact stap voor stap.
          </p>
        </div>

        <button className="info-button" onClick={() => navigate("/overzicht")}>
          Terug naar overzicht
        </button>
      </div>
    </div>
  )
}

export default AchtergrondimpactInfo
