const treeHealthy = new URL("../../assets/sprites/tree/tree_idle.png", import.meta.url).href
const treeGrow = new URL("../../assets/sprites/tree/tree_grow.png", import.meta.url).href
const plantHealthy = new URL("../../assets/sprites/plant/plant_idle.png", import.meta.url).href
const plantGrow = new URL("../../assets/sprites/plant/plant_grow.png", import.meta.url).href
const fireIdle = new URL("../../assets/sprites/fire/fire_idle.png", import.meta.url).href
const fireStrong = new URL("../../assets/sprites/fire/fire_strong.png", import.meta.url).href
const waterIdle = new URL("../../assets/sprites/water/water_idle.png", import.meta.url).href
const waterSplash = new URL("../../assets/sprites/water/water_splash.png", import.meta.url).href

// Tijdelijke sprite mapping. Als later echte PNG's in src/assets/forest worden geplaatst,
// hoeven alleen deze verwijzingen te worden vervangen; de component blijft hetzelfde.
const SPRITE_SOURCES = {
  tree: {
    healthy: treeHealthy,
    grow: treeGrow,
    damaged: null,
    dead: null,
  },
  plant: {
    healthy: plantHealthy,
    grow: plantGrow,
    dry: null,
  },
  fire: {
    idle: fireIdle,
    strong: fireStrong,
  },
  water: {
    idle: waterIdle,
    splash: waterSplash,
    low: waterIdle,
  },
}

const FRAME_COUNTS = {
  tree: {
    healthy: 8,
    grow: 8,
    damaged: 1,
    dead: 1,
  },
  plant: {
    healthy: 8,
    grow: 8,
    dry: 1,
  },
  fire: {
    idle: 8,
    strong: 8,
  },
  water: {
    idle: 8,
    splash: 8,
    low: 8,
  },
}

function ForestSprite({
  id,
  type,
  variant = "healthy",
  label,
  x,
  y,
  size = 72,
  depth = "mid",
  onInspect,
}) {
  const image = SPRITE_SOURCES[type]?.[variant] || null
  const frames = FRAME_COUNTS[type]?.[variant] || 1
  const style = {
    "--forest-object-x": x,
    "--forest-object-y": y,
    "--forest-object-size": `${size}px`,
    "--forest-object-frames": frames,
  }

  if (image) {
    style.backgroundImage = `url(${image})`
  }

  return (
    <button
      type="button"
      className={[
        "forest-sprite-object",
        `forest-sprite-object--${type}`,
        `forest-sprite-object--${variant}`,
        `forest-sprite-object--${depth}`,
        image ? "has-sprite" : "has-css-fallback",
      ].join(" ")}
      style={style}
      aria-label={label}
      onClick={() => onInspect?.({ id, type, variant, label })}
    >
      <span className="forest-sprite-shadow" aria-hidden="true" />
      <span className="forest-sprite-image" aria-hidden="true" />
      <span className="forest-sprite-fallback" aria-hidden="true" />
    </button>
  )
}

export default ForestSprite
