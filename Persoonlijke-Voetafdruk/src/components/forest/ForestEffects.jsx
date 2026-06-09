function ForestEffects({ status, actionEffect }) {
  const isHealthy = status.id === "healthy" || status.id === "good"
  const isRecovering = status.id === "recovering"
  const isDamaged = status.id === "bad" || status.id === "critical"
  const showActionBurst = actionEffect !== "idle"

  return (
    <div className="forest-effects" aria-hidden="true">
      {isHealthy && (
        <>
          <span className="butterfly butterfly-one" />
          <span className="butterfly butterfly-two" />
          <span className="butterfly butterfly-three" />
          <span className="light-particle particle-one" />
          <span className="light-particle particle-two" />
          <span className="light-particle particle-three" />
          <span className="light-particle particle-four" />
          <span className="floating-leaf leaf-one" />
          <span className="floating-leaf leaf-two" />
          <span className="floating-leaf leaf-three" />
        </>
      )}

      {isRecovering && (
        <>
          <span className="recovery-glow" />
          <span className="growth-ring" />
          <span className="firefly firefly-one" />
          <span className="firefly firefly-two" />
          <span className="firefly firefly-three" />
          <span className="rain-streak rain-one" />
          <span className="rain-streak rain-two" />
          <span className="rain-streak rain-three" />
          <span className="rain-streak rain-four" />
          <span className="sprout-spark sprout-one" />
          <span className="sprout-spark sprout-two" />
        </>
      )}

      {isDamaged && (
        <>
          <span className="smoke smoke-one" />
          <span className="smoke smoke-two" />
          <span className="smoke smoke-three" />
          <span className="dust dust-one" />
          <span className="dust dust-two" />
          <span className="dust dust-three" />
          <span className="falling-leaf falling-one" />
          <span className="falling-leaf falling-two" />
          <span className="falling-leaf falling-three" />
        </>
      )}

      {showActionBurst && (
        <div className={`action-burst action-burst--${actionEffect}`}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  )
}

export default ForestEffects
