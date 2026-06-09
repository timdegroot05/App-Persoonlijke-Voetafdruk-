function ForestBackground({ status, actionEffect }) {
  const isRecovering = status.id === "recovering" || actionEffect === "water"
  const isBright = status.id === "healthy" || status.id === "good"
  const isDamaged = status.id === "bad" || status.id === "critical"

  return (
    <div className="forest-background" aria-hidden="true">
      <div className="forest-sky-layer">
        <span className="forest-sky-glow" />
        <span className="forest-sun" />
        <span className="forest-cloud cloud-one" />
        <span className="forest-cloud cloud-two" />
        <span className="forest-cloud cloud-three" />
        <span className="forest-cloud cloud-four" />
        {(isBright || isRecovering) && (
          <>
            <span className="forest-sun-ray ray-one" />
            <span className="forest-sun-ray ray-two" />
          </>
        )}
      </div>

      <div className="forest-far-layer">
        <span className="forest-mountain mountain-left" />
        <span className="forest-mountain mountain-right" />
        <span className="forest-mountain mountain-center" />
        <span className="forest-fog fog-one" />
        <span className="forest-fog fog-two" />
      </div>

      <div className="forest-mid-layer">
        <span className="forest-hill hill-left" />
        <span className="forest-hill hill-right" />
        <span className="forest-back-trees forest-back-trees-far" />
        <span className="forest-back-trees forest-back-trees-near" />
        <span className="forest-mid-canopy canopy-one" />
        <span className="forest-mid-canopy canopy-two" />
        <span className="forest-bush-line bush-line-back" />
        <span className="forest-bush-line bush-line-front" />
      </div>

      {isRecovering && (
        <div className="forest-rain-layer">
          <span className="rain-drop drop-one" />
          <span className="rain-drop drop-two" />
          <span className="rain-drop drop-three" />
          <span className="rain-drop drop-four" />
        </div>
      )}

      {isDamaged && <span className="forest-dark-vignette" />}
    </div>
  )
}

export default ForestBackground
