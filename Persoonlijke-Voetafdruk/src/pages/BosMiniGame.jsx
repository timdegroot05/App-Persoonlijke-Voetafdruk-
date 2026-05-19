import { useEffect, useMemo, useRef, useState } from "react"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { LuTrees } from "react-icons/lu"

const STORAGE_KEY = "red-het-bos-game"
const POINTS_PER_ACTION = 10
const POINTS_PER_LEVEL = 60

const PROBLEM_TYPES = {
  trash: {
    label: "Ruim afval op",
    icon: "blik",
    fixedClass: "clean",
    fixedLabel: "Opgeruimd",
  },
  smoke: {
    label: "Verdrijf rook",
    icon: "rook",
    fixedClass: "clear",
    fixedLabel: "Schone lucht",
  },
  dryTree: {
    label: "Geef water",
    icon: "droog",
    fixedClass: "healthy-tree",
    fixedLabel: "Gezond",
  },
  plantSpot: {
    label: "Plant een boom",
    icon: "plek",
    fixedClass: "new-tree",
    fixedLabel: "Geplant",
  },
}

const OBJECT_POSITIONS = [
  { x: 16, y: 63 },
  { x: 38, y: 70 },
  { x: 62, y: 62 },
  { x: 80, y: 72 },
  { x: 25, y: 43 },
  { x: 52, y: 48 },
  { x: 73, y: 39 },
  { x: 10, y: 78 },
  { x: 48, y: 82 },
  { x: 88, y: 52 },
]

const TYPE_ORDER = ["trash", "smoke", "dryTree", "plantSpot"]

function readSavedGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return {
      score: Number.isFinite(saved?.score) ? saved.score : 0,
      round: Number.isFinite(saved?.round) ? saved.round : 1,
    }
  } catch {
    return { score: 0, round: 1 }
  }
}

function saveGame(score, round) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ score, round }))
  } catch {
    // De game blijft speelbaar wanneer localStorage niet beschikbaar is.
  }
}

function getLevel(score) {
  return Math.floor(score / POINTS_PER_LEVEL) + 1
}

function getLevelProgress(score) {
  return score % POINTS_PER_LEVEL
}

function buildProblemObjects(level, round) {
  const totalObjects = Math.min(4 + Math.floor(level / 2), OBJECT_POSITIONS.length)
  const offset = (round + level) % TYPE_ORDER.length

  return OBJECT_POSITIONS.slice(0, totalObjects).map((position, index) => {
    const type = TYPE_ORDER[(index + offset) % TYPE_ORDER.length]

    return {
      id: `${round}-${level}-${index}-${type}`,
      type,
      x: position.x,
      y: position.y,
      fixed: false,
    }
  })
}

function buildForestDecorations(level, fixedCount) {
  const treeCount = Math.min(5 + level + Math.floor(fixedCount / 2), 14)
  const flowerCount = Math.min(Math.floor(level / 2) + fixedCount, 12)

  return {
    trees: Array.from({ length: treeCount }, (_, index) => ({
      id: `tree-${level}-${index}`,
      x: 8 + ((index * 17) % 84),
      size: 0.78 + ((index + level) % 4) * 0.08,
      delay: index * 60,
      back: index % 3 === 0,
    })),
    flowers: Array.from({ length: flowerCount }, (_, index) => ({
      id: `flower-${level}-${fixedCount}-${index}`,
      x: 9 + ((index * 13) % 82),
      y: 78 + (index % 3) * 5,
      delay: index * 45,
    })),
  }
}

function BosMiniGame() {
  const savedGame = useMemo(() => readSavedGame(), [])
  const [score, setScore] = useState(savedGame.score)
  const [round, setRound] = useState(savedGame.round)
  const popupCounter = useRef(0)
  const level = getLevel(score)
  const progress = getLevelProgress(score)
  const [objects, setObjects] = useState(() =>
    buildProblemObjects(getLevel(savedGame.score), savedGame.round)
  )
  const [popups, setPopups] = useState([])
  const fixedCount = objects.filter((object) => object.fixed).length
  const activeCount = objects.length - fixedCount
  const forest = useMemo(
    () => buildForestDecorations(level, fixedCount),
    [fixedCount, level]
  )

  useEffect(() => {
    saveGame(score, round)
  }, [round, score])

  useEffect(() => {
    setObjects(buildProblemObjects(level, round))
  }, [level, round])

  const handleObjectClick = (clickedObject) => {
    if (clickedObject.fixed) {
      return
    }

    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === clickedObject.id ? { ...object, fixed: true } : object
      )
    )
    setScore((currentScore) => currentScore + POINTS_PER_ACTION)

    popupCounter.current += 1
    const popupId = `${clickedObject.id}-${popupCounter.current}`
    setPopups((currentPopups) => [
      ...currentPopups,
      { id: popupId, x: clickedObject.x, y: clickedObject.y },
    ])
    window.setTimeout(() => {
      setPopups((currentPopups) =>
        currentPopups.filter((popup) => popup.id !== popupId)
      )
    }, 850)
  }

  const startNextRound = () => {
    setRound((currentRound) => currentRound + 1)
  }

  const resetGame = () => {
    setScore(0)
    setRound(1)
    setObjects(buildProblemObjects(1, 1))
    setPopups([])
    saveGame(0, 1)
  }

  return (
    <div className="calculator-page forest-game-page">
      <AppHeader title="Red het bos" icon={<LuTrees />} />

      <main className="forest-game-shell" aria-label="Red het bos mini-game">
        <section className="forest-game-hero">
          <p className="section-label dark">Mini-game</p>
          <h1 className="calculator-title">Red het bos</h1>
          <p className="calculator-text">
            Tik op afval, rook, droge bomen en lege plekken om het bos te helpen.
          </p>
        </section>

        <section className="forest-game-stats" aria-label="Spelstatus">
          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Level</span>
            <strong>{level}</strong>
          </div>
          <div>
            <span>Te doen</span>
            <strong>{activeCount}</strong>
          </div>
        </section>

        <section className="forest-game-progress" aria-label="Voortgang naar volgend level">
          <div className="forest-game-progress-label">
            <span>Volgend level</span>
            <strong>{progress}/{POINTS_PER_LEVEL}</strong>
          </div>
          <div className="forest-game-progress-track">
            <span style={{ width: `${(progress / POINTS_PER_LEVEL) * 100}%` }} />
          </div>
        </section>

        <section
          className={`forest-game-board forest-game-level-${Math.min(level, 5)}`}
          aria-label="Interactief bosgebied"
        >
          <div className="forest-game-sun" aria-hidden="true" />
          <div className="forest-game-hills" aria-hidden="true" />

          <div className="forest-game-tree-layer back" aria-hidden="true">
            {forest.trees
              .filter((tree) => tree.back)
              .map((tree) => (
                <span
                  key={tree.id}
                  className="forest-game-tree"
                  style={{
                    left: `${tree.x}%`,
                    "--tree-size": tree.size,
                    "--tree-delay": `${tree.delay}ms`,
                  }}
                />
              ))}
          </div>

          <div className="forest-game-tree-layer front" aria-hidden="true">
            {forest.trees
              .filter((tree) => !tree.back)
              .map((tree) => (
                <span
                  key={tree.id}
                  className="forest-game-tree"
                  style={{
                    left: `${tree.x}%`,
                    "--tree-size": tree.size,
                    "--tree-delay": `${tree.delay}ms`,
                  }}
                />
              ))}
          </div>

          <div className="forest-game-flowers" aria-hidden="true">
            {forest.flowers.map((flower) => (
              <span
                key={flower.id}
                className="forest-game-flower"
                style={{
                  left: `${flower.x}%`,
                  top: `${flower.y}%`,
                  "--flower-delay": `${flower.delay}ms`,
                }}
              />
            ))}
          </div>

          {objects.map((object) => {
            const config = PROBLEM_TYPES[object.type]

            return (
              <button
                key={object.id}
                type="button"
                className={`forest-game-object ${object.type}${
                  object.fixed ? ` fixed ${config.fixedClass}` : ""
                }`}
                style={{ left: `${object.x}%`, top: `${object.y}%` }}
                onClick={() => handleObjectClick(object)}
                aria-label={object.fixed ? config.fixedLabel : config.label}
                disabled={object.fixed}
              >
                <span>{object.fixed ? config.fixedLabel : config.icon}</span>
              </button>
            )
          })}

          {popups.map((popup) => (
            <span
              key={popup.id}
              className="forest-game-score-popup"
              style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
            >
              +10
            </span>
          ))}
        </section>

        <section className="forest-game-actions">
          <button
            type="button"
            className="forest-game-primary"
            onClick={startNextRound}
            disabled={activeCount > 0}
          >
            {activeCount > 0 ? "Maak het bos schoon" : "Nieuw gebied"}
          </button>
          <button type="button" className="forest-game-secondary" onClick={resetGame}>
            Reset spel
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default BosMiniGame
