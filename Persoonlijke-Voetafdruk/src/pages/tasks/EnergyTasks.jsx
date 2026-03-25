function EnergyTasks({ setScreen }) {
  return (
    <div className="activiteiten-page">
      <h1>Energie taken</h1>
      <p>Hier komen alle energie opdrachten.</p>

      <button onClick={() => setScreen("activiteiten")}>
        Terug
      </button>
    </div>
  );
}

export default EnergyTasks;