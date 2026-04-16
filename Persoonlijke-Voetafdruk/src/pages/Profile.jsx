import { useMemo } from "react"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { LuLeaf } from "react-icons/lu"
import { buildImpactSnapshot, getImpactHistory, getFocusLabel } from "../utils/impactInsights"

function Profile() {
  const savedAnswers = JSON.parse(localStorage.getItem("answers")) || []
  const weeklyGoal = Number(localStorage.getItem("weekly-goal")) || 150
  const history = useMemo(() => getImpactHistory(), [])

  const snapshot = useMemo(() => {
    if (savedAnswers.length === 0) {
      return null
    }

    return buildImpactSnapshot(savedAnswers)
  }, [savedAnswers])

  const weeklyEmission = snapshot?.weeklyEmission ?? 86.8
  const score = snapshot?.totalScore ?? 52
  const focusLabel = getFocusLabel(snapshot?.dominantCategory ?? "energie")
  const savedKg = Math.max(0, Number((weeklyGoal - weeklyEmission).toFixed(1)))
  const ecoPoints = Math.max(40, Math.round(score * 2 + savedKg * 3 + history.length * 8))
  const ecoLevel = Math.max(1, Math.floor(ecoPoints / 120) + 1)
  const categoryBadges = [
    {
      name: "Vervoer badge",
      unlocked: (snapshot?.categories?.transport ?? 999) <= 10,
    },
    {
      name: "Voeding badge",
      unlocked: (snapshot?.categories?.voeding ?? 999) <= 8,
    },
    {
      name: "Energie badge",
      unlocked: (snapshot?.categories?.energie ?? 999) <= 9,
    },
    {
      name: "Bosbouwer",
      unlocked: savedKg >= 20,
    },
  ]

  return (
    <div className="calculator-page profile-page">
      <AppHeader title="Profiel" icon={<LuLeaf />} />

      <div className="tips-content">
        <section className="calculator-card profile-hero-card">
          <p className="section-label dark">Jouw status</p>
          <h1 className="calculator-title">Level {ecoLevel}</h1>
          <p className="calculator-text">
            Je profiel bundelt je huidige score, focus en de badges die je al
            hebt vrijgespeeld.
          </p>

          <div className="profile-hero-grid">
            <div className="profile-hero-stat">
              <span>XP</span>
              <strong>{ecoPoints}</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Focus</span>
              <strong>{focusLabel}</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Weekdoel</span>
              <strong>{weeklyGoal} kg</strong>
            </div>
            <div className="profile-hero-stat">
              <span>Historie</span>
              <strong>{history.length} metingen</strong>
            </div>
          </div>
        </section>

        <section className="tips-list">
          {categoryBadges.map((badge) => (
            <article key={badge.name} className={`tips-list-card profile-badge-card${badge.unlocked ? " unlocked" : ""}`}>
              <p className="section-label dark">Badge</p>
              <h2>{badge.name}</h2>
              <p>{badge.unlocked ? "Ontgrendeld" : "Nog niet vrijgespeeld"}</p>
            </article>
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Profile
