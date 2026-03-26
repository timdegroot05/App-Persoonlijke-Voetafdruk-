import { useNavigate } from "react-router-dom"

function EnergyTasks() {
  const navigate = useNavigate()

  return (
    <div className="activiteiten-page">
      <h1>Energie taken</h1>
      <p>Hier komen alle energie opdrachten.</p>

      <button onClick={() => navigate("/activiteiten")}>
        Terug
      </button>
    </div>
  )
}

export default EnergyTasks