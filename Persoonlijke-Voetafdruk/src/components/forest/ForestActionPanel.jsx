function ForestActionPanel({
  isOpen,
  onClose,
  actions,
  completedActions,
  onAction,
  onResetActions,
  points,
  gameStats,
}) {
  if (!isOpen) return null

  return (
    <div className="forest-drawer-backdrop">
      <section className="forest-drawer forest-action-drawer" aria-label="Bosmissies">
        <div className="drawer-handle" aria-hidden="true" />
        <div className="drawer-heading">
          <div>
            <span>Bosmissies</span>
            <strong>{points} bospunten</strong>
          </div>
          <div className="drawer-actions">
            <button type="button" onClick={onResetActions}>
              Reset acties
            </button>
            <button type="button" onClick={onClose} aria-label="Sluit bosmissies">
              Sluit
            </button>
          </div>
        </div>

        <div className="mission-summary" aria-label="Missie voortgang">
          <div>
            <span>CO2 bespaard</span>
            <strong>{gameStats.gameSavedKg} kg</strong>
          </div>
          <div>
            <span>Acties voltooid</span>
            <strong>{gameStats.actionsCompleted}</strong>
          </div>
        </div>

        <div className="mission-list">
          {actions.map((action) => {
            const completed = completedActions.includes(action.id)

            return (
              <button
                key={action.id}
                type="button"
                className={`mission-card${completed ? " is-complete" : ""}`}
                disabled={completed}
                onClick={() => onAction(action)}
              >
                <span>{action.label}</span>
                <strong>{completed ? "Gedaan" : `+${action.xp} XP`}</strong>
                <small>
                  <em>{action.category}</em>
                  {action.note}
                </small>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default ForestActionPanel
