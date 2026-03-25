function TransportTasks({ navigate }) {
  return (
    <div className="activiteiten-page">
      <h1>Transport taken</h1>
      <p>Hier komen alle transport opdrachten.</p>

      <button onClick={() => navigate("activiteiten")}>
        Terug
      </button>
    </div>
  );
}

export default TransportTasks;