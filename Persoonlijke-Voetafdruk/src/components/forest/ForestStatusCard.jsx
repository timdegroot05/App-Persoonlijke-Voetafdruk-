function ForestStatusCard({
  status,
  score,
  isEmpty,
  nextTreeProgress,
  onInfoClick,
  onResetGame,
}) {
  const nextTreeRemaining = Math.max(0, 100 - nextTreeProgress)
  const message = isEmpty
    ? "Je bos is nog leeg. Begin met CO2 besparen om bomen te planten."
    : status.message

  return (
    <header className="forest-status-card" aria-label="Bosstatus">
      <div className="status-copy">
        <span className="status-eyebrow">Jouw Bos</span>
        <strong>{status.title}</strong>
        <p>{message}</p>
        <div className="status-mini-progress" aria-label="Voortgang tot volgende boom">
          <span style={{ width: `${nextTreeProgress}%` }} />
        </div>
        <small>Nog {nextTreeRemaining}% tot je volgende boom</small>
      </div>

      <div className="status-actions">
        <button
          type="button"
          className="status-score"
          style={{ "--status-score": `${score}%` }}
          onClick={onInfoClick}
          aria-label="Bekijk bosinfo"
        >
          <span>{score}</span>
          <small>/100</small>
        </button>
        <button type="button" className="status-reset" onClick={onResetGame}>
          Reset
        </button>
      </div>
    </header>
  )
}

export default ForestStatusCard
