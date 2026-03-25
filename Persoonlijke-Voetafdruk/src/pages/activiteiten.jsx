import "./activiteiten.css";

function Activiteiten({ setScreen }) {
  return (
    <div className="activiteiten-page">
      <header className="activiteiten-header">
        <h1>Choose your impact today</h1>
        <p>Small actions, big difference 🌱</p>
      </header>

      <section className="progress-box">
        <p>2 actio completed today 🔥</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </section>

      <section className="cards">
        <div className="actie-card food">
          <h2>Food</h2>
          <p>Plant-based deliciousness</p>
          <span>Explore tasks →</span>
        </div>

        <div className="actie-card transport">
          <h2>Transport</h2>
          <p>Greener commutes</p>
          <span>Explore tasks →</span>
        </div>

        <div className="actie-card energy">
          <h2>Energy</h2>
          <p>Smart consumption</p>
          <button type="button">Explore tasks →</button>
        </div>
      </section>
    </div>
  );
}

export default Activiteiten;