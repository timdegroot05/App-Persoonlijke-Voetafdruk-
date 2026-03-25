import { useNavigate } from "react-router-dom";

function FoodTasks() {
  const navigate = useNavigate();
  return (
    <div className="activiteiten-page">
      <h1>Voedsel taken</h1>
      <p>Hier komen alle voedsel opdrachten.</p>

      <button onClick={() => navigate("activiteiten")}>
        Terug
      </button>
    </div>
  );
}

export default FoodTasks;