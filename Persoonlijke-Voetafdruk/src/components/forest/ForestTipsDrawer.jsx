const TIPS = [
  "Korter douchen bespaart energie.",
  "Fietsen in plaats van autorijden verlaagt je uitstoot direct.",
  "Een plantaardige maaltijd heeft vaak een lagere impact.",
  "Apparaten helemaal uitzetten voorkomt sluipverbruik.",
  "Onder je weekdoel blijven maakt je bos zichtbaar groener.",
]

function ForestTipsDrawer({
  isOpen,
  onClose,
  weeklyEmission,
  dailyEmission,
  weeklyGoal,
  savedKg,
  status,
  level,
  points,
  levelProgress,
  gameStats,
  onResetGame,
}) {
  if (!isOpen) return null

  return (
    <div className="forest-drawer-backdrop">
      <section className="forest-drawer forest-info-drawer" aria-label="Bosinfo">
        <div className="drawer-handle" aria-hidden="true" />
        <div className="drawer-heading">
          <div>
            <span>Bosinfo</span>
            <strong>{status.label}</strong>
          </div>
          <div className="drawer-actions">
            <button type="button" onClick={onResetGame}>
              Reset spel
            </button>
            <button type="button" onClick={onClose} aria-label="Sluit bosinfo">
              Sluit
            </button>
          </div>
        </div>

        <p className="drawer-message">{status.tip}</p>

        <div className="impact-grid">
          <div>
            <span>Week</span>
            <strong>{weeklyEmission} kg</strong>
          </div>
          <div>
            <span>Dag</span>
            <strong>{dailyEmission} kg</strong>
          </div>
          <div>
            <span>Doel</span>
            <strong>{weeklyGoal} kg</strong>
          </div>
          <div>
            <span>Bespaard</span>
            <strong>{savedKg} kg</strong>
          </div>
        </div>

        <div className="level-card">
          <div>
            <span>Level</span>
            <strong>{level.name}</strong>
          </div>
          <div>
            <span>Bospunten</span>
            <strong>{points}</strong>
          </div>
        </div>

        <div className="level-progress">
          <span style={{ width: `${levelProgress}%` }} />
        </div>

        <div className="game-stats-grid" aria-label="Game voortgang">
          <div>
            <span>CO2 bespaard</span>
            <strong>{gameStats.gameSavedKg} kg</strong>
          </div>
          <div>
            <span>Bomen geplant</span>
            <strong>{gameStats.plantedTrees}</strong>
          </div>
          <div>
            <span>Acties voltooid</span>
            <strong>{gameStats.actionsCompleted}</strong>
          </div>
          <div>
            <span>Volgende boom</span>
            <strong>{gameStats.nextTreeProgress}%</strong>
          </div>
        </div>

        <div className="next-tree-card">
          <span>Nog {Math.max(0, 100 - gameStats.nextTreeProgress)}% te gaan</span>
          <strong>Volgende boom vrijspelen</strong>
        </div>

        <div className="tips-card">
          <div className="tips-card-heading">
            <span>Tips & feitjes</span>
            <strong>Wat helpt je bos?</strong>
          </div>
          <div className="tips-scroll">
            {TIPS.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ForestTipsDrawer
