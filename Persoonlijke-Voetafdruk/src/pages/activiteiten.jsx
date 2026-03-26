import { useNavigate } from "react-router-dom"

function Activiteiten() {
  const navigate = useNavigate()
  return (
    <div className="activiteiten-page">
      <header className="activiteiten-header">
        <h1>Kies je impact vandaag</h1>
        <p>Kleine acties, groot verschil 🌱</p>
      </header>
<section className="progress-box">
  <p>2 acties voltooid vandaag 🔥</p>

  <div className="progress-wrapper">
    <div className="progress-bar">
      <div className="progress-fill"></div>
    </div>
    <span className="progress-text">40/100</span>
  </div>
</section>

      <section className="cards">
        <div className="actie-card food">
          <h2>Voedsel</h2>
          <p>Plantaardig lekkers</p>
          <button onClick={() => navigate("/foodTasks")}>
            Ontdek taken →
          </button>
        </div>

        <div className="actie-card transport">
          <h2>Transport</h2>
          <p>Groenere reizen</p>
          <button onClick={() => navigate("/transportTasks")}>
            Ontdek taken →
          </button>
        </div>

        <div className="actie-card energy">
          <h2>Energie</h2>
          <p>Slim verbruik</p>
          <button onClick={() => navigate("/energyTasks")}>
            Ontdek taken →
          </button>
        </div>
      </section>
    </div>
  );
}

export default Activiteiten;