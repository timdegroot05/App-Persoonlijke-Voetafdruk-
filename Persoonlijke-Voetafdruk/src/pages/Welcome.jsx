function Welcome({ onStart }) {
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-logo">🌍</div>

        <h1 className="welcome-title">Impact</h1>

        <p className="welcome-text">
          Ontdek hoe duurzaam jouw leefstijl is en krijg inzicht in jouw
          persoonlijke impact op het milieu.
        </p>

        <p className="welcome-subtext">
          Beantwoord een paar korte vragen over voeding, transport en energie voordat je verder in de app kan gaan.
        </p>

        <button className="start-btn" onClick={onStart}>
          Start test
        </button>
      </div>
    </div>
  )
}

export default Welcome