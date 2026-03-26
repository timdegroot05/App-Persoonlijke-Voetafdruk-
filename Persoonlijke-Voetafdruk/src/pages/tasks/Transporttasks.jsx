import { useNavigate } from "react-router-dom"
import { FiMap } from "react-icons/fi"
import AppHeader from "../../components/AppHeader"

function TransportTasks() {
  const navigate = useNavigate()

  return (
    <div className="activiteiten-page">
      <AppHeader title="Transport" icon={<FiMap />} />

      <div className="page-section">
      <h1>Transport taken</h1>
      <p>Hier komen alle transport opdrachten.</p>

      <button onClick={() => navigate("/activiteiten")}>
        Terug
      </button>
      </div>
    </div>
  )
}

export default TransportTasks
