import "./overzicht.css"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FiBarChart2, FiInfo } from "react-icons/fi"
import BottomNav from "../../components/BottomNav"
import AppHeader from "../../components/AppHeader"
import { buildImpactSnapshot, getFocusLabel } from "../../utils/impactInsights"
import {
  getLatestWeeklyAnswers,
  getProfileAnswers,
} from "../../utils/questionnaireStorage"

function Overzicht() {
  const navigate = useNavigate()
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const weeklyAnswers = useMemo(() => getLatestWeeklyAnswers(), [])
  const snapshot = useMemo(
    () => buildImpactSnapshot(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )
  const weeklyOverview = useMemo(() => {
    const entries = Object.entries(snapshot.categories)
    const visibleEntries = entries
      .filter(([category]) => category !== "achtergrondimpact")
      .sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])
    const backgroundEntry = entries.find(([category]) => category === "achtergrondimpact")

    return backgroundEntry ? [...visibleEntries, backgroundEntry] : visibleEntries
  }, [snapshot.categories])
  const largestCategory = weeklyOverview.find(
    ([category]) => category !== "achtergrondimpact"
  )

  return (
    <div className="overzicht-page">
      <div className="overzicht-container">
        <AppHeader title="Overzicht" icon={<FiBarChart2 />} />

        <div className="overview-content">
        <section className="overzicht-summary-card">
          <p className="section-label dark">Jouw samenvatting</p>
          <h2>Je weekimpact in een oogopslag</h2>
          <div className="overzicht-summary-grid">
            <div className="overzicht-summary-stat">
              <span>Dagelijks</span>
              <strong>{snapshot.dailyEmission} kg</strong>
            </div>
            <div className="overzicht-summary-stat">
              <span>Wekelijks</span>
              <strong>{snapshot.weeklyEmission} kg</strong>
            </div>
          </div>
        </section>

        <div
          className="overzicht-card overzicht-highlight"
          onClick={() => navigate("/grootste-categorie")}
        >
          <h2>Grootste categorie</h2>
          <p>
            {largestCategory
              ? `${getFocusLabel(largestCategory[0])} met ${Number(largestCategory[1].toFixed(1))} kg CO2e per week`
              : "Nog geen gegevens beschikbaar"}
          </p>
        </div>

        <section className="overzicht-card overzicht-week-card">
          <h2>Weekoverzicht</h2>
          <div className="overzicht-week-list">
            {weeklyOverview.map(([category, value]) => (
              <div
                key={category}
                className={`overzicht-week-row${category === "achtergrondimpact" ? " background-row" : ""}`}
              >
                <div className="overzicht-week-label">
                  {category === "achtergrondimpact" ? (
                    <button
                      type="button"
                      className="overzicht-info-button"
                      aria-label="Meer informatie over achtergrondimpact"
                      onClick={() => navigate("/achtergrondimpact-info")}
                    >
                      <FiInfo />
                    </button>
                  ) : null}
                  <span>{getFocusLabel(category)}</span>
                </div>
                <strong>{Number(value.toFixed(1))} kg CO2e</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="overzicht-cards">
          <div
            className="overzicht-card"
            onClick={() => navigate("/dagelijkse-uitstoot")}
          >
            <h2>Dagelijkse uitstoot</h2>
            <p>{snapshot.dailyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/wekelijkse-uitstoot")}
          >
            <h2>Wekelijkse uitstoot</h2>
            <p>{snapshot.weeklyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/gemiddelde-week")}
          >
            <h2>Gemiddelde wekelijkse uitstoot</h2>
            <p>{snapshot.weeklyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/gemiddelde-jaar")}
          >
            <h2>Gemiddelde jaarlijkse uitstoot</h2>
            <p>{Number((snapshot.weeklyEmission * 52).toFixed(0))} kg CO2e</p>
          </div>
        </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

export default Overzicht
