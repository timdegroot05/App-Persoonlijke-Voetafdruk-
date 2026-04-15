import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { LuTrees } from "react-icons/lu"
import { buildImpactSnapshot, getFocusLabel } from "../utils/impactInsights"

function BosVisualisatie() {
  const navigate = useNavigate()
  const savedAnswers = JSON.parse(localStorage.getItem("answers")) || []
  const history = JSON.parse(localStorage.getItem("impact-history")) || []
  const weeklyGoal = Number(localStorage.getItem("weekly-goal")) || 150

  const snapshot = useMemo(() => {
    if (savedAnswers.length === 0) {
      return null
    }

    return buildImpactSnapshot(savedAnswers)
  }, [savedAnswers])

  const weeklyEmission = snapshot?.weeklyEmission ?? 86.8
  const focusLabel = getFocusLabel(snapshot?.dominantCategory ?? "energie")
  const savedKg = Math.max(0, Number((weeklyGoal - weeklyEmission).toFixed(1)))
  const kgPerTree = Math.max(1, Math.round(weeklyGoal / 5))
  const forestTrees = Math.min(5, Math.max(1, Math.round((savedKg / weeklyGoal) * 5)))
  const forestLevels = [
    { name: "Zaailing", badge: "Beginfase" },
    { name: "Groeipad", badge: "In opbouw" },
    { name: "Groene zone", badge: "Sterker ritme" },
    { name: "Mini-bos", badge: "Goede week" },
    { name: "Vol bos", badge: "Topprestatie" },
  ]
  const forestLevel = forestLevels[forestTrees - 1]
  const nextTreeThreshold = Math.max(0, forestTrees * kgPerTree - savedKg)
  const forestStepProgress =
    forestTrees >= 5
      ? 100
      : Math.min(100, Math.max(10, Math.round(((savedKg % kgPerTree) / kgPerTree) * 100)))
  const treeTokens = ["small", "", "large", "", "small"].slice(0, forestTrees)
  const forestAchievements = [
    {
      title: "Zaailing badge",
      status: forestTrees >= 2 ? "Ontgrendeld" : "Nog 1 stap",
    },
    {
      title: "Boswachter",
      status: forestTrees >= 4 ? "Ontgrendeld" : "Nog groeien",
    },
    {
      title: "Historie",
      status: history.length >= 2 ? "Actief" : "Vul opnieuw in",
    },
  ]

  return (
    <div className="calculator-page forest-page">
      <AppHeader title="Bos" icon={<LuTrees />} />

      <div className="calculator-card forest-card">
        <p className="section-label dark">Bos overzicht</p>
        <h1 className="calculator-title">Jouw groei in beeld</h1>
        <p className="calculator-text">
          Je bos groeit op basis van hoeveel ruimte je onder je weekdoel houdt.
          Minder uitstoot levert meer bomen en een sterker ecosysteem op.
        </p>

        <div className="forest-visual">
          {treeTokens.map((size, index) => (
            <div
              key={`${size}-${index}`}
              className={`forest-tree${size ? ` ${size}` : ""}`}
            >
              {size === "small" ? "🌱" : size === "large" ? "🌳" : "🌲"}
            </div>
          ))}
        </div>

        <div className="forest-level-strip">
          <div>
            <span className="forest-level-label">Niveau</span>
            <strong className="forest-level-value">{forestLevel.name}</strong>
          </div>
          <span className="forest-level-badge">{forestLevel.badge}</span>
        </div>

        <div className="forest-progress-bar" aria-hidden="true">
          <div
            className="forest-progress-fill"
            style={{ width: `${forestStepProgress}%` }}
          />
        </div>

        <div className="calculator-grid">
          <div className="calculator-metric">
            <span>Weekuitstoot</span>
            <strong>{weeklyEmission} kg CO₂e</strong>
          </div>
          <div className="calculator-metric">
            <span>Focus</span>
            <strong>{focusLabel}</strong>
          </div>
          <div className="calculator-metric">
            <span>1 boom is</span>
            <strong>{kgPerTree} kg marge</strong>
          </div>
          <div className="calculator-metric">
            <span>Volgende boom</span>
            <strong>{nextTreeThreshold > 0 ? `${nextTreeThreshold} kg` : "Behaald"}</strong>
          </div>
        </div>

        <div className="forest-achievement-grid">
          {forestAchievements.map((achievement) => (
            <article key={achievement.title} className="forest-achievement-card">
              <span>Achievement</span>
              <strong>{achievement.title}</strong>
              <p>{achievement.status}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="challenge-button forest-profile-button"
          onClick={() => navigate("/profile")}
        >
          Open profiel
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

export default BosVisualisatie
