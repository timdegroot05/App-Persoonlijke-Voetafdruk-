import { useNavigate } from "react-router-dom"
import { LuLeaf } from "react-icons/lu"
import AppHeader from "../../components/AppHeader"

function FoodTasks() {
  const navigate = useNavigate()
  return (
    <div className="activiteiten-page">
      <AppHeader title="Voedsel" icon={<LuLeaf />} />

      <div className="page-section">
      <h1>Voedsel taken</h1>
      <p>Hier komen alle voedsel opdrachten.</p>

      <button onClick={() => navigate("/activiteiten")}>
        Terug
      </button>
      </div>
    </div>
  )
}

export default FoodTasks
