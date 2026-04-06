import { useNavigate } from "react-router-dom"
import { FiZap } from "react-icons/fi"
import AppHeader from "../../components/AppHeader"

function EnergyTasks() {
  const navigate = useNavigate()

  return (
    <div className="activiteiten-page">
      <AppHeader title="Energie" icon={<FiZap />} />

      <div className="page-section">
      <h1>Energie taken</h1>
      <p>Hier komen alle energie opdrachten.</p>

      <button onClick={() => navigate("/activiteiten")}>
        Terug
      </button>
      </div>
    </div>
  )
}

export default EnergyTasks
