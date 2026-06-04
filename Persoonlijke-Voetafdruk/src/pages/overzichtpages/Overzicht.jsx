import "./overzicht.css"
import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiBarChart2, FiInfo } from "react-icons/fi"
import MobilePageShell from "../../components/MobilePageShell"
import { buildImpactSnapshot, getFocusLabel } from "../../utils/impactInsights"
import {
  getLatestWeeklyAnswers,
  getProfileAnswers,
} from "../../utils/questionnaireStorage"
import {
  buildWeeklyOverviewItems,
  formatWeekRangeLabel,
} from "../../utils/weeklyResults"
import { getAugmentedWeeklyResults } from "../../utils/customActivities"

function Overzicht() {
  const navigate = useNavigate()
  const categoryRailRef = useRef(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const weeklyAnswers = useMemo(() => getLatestWeeklyAnswers(), [])
  const snapshot = useMemo(
    () => buildImpactSnapshot(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )
  const weeklyHistory = useMemo(
    () => buildWeeklyOverviewItems(getAugmentedWeeklyResults()),
    []
  )
  const rawWeeklyResults = useMemo(() => getAugmentedWeeklyResults(), [])
  const latestWeeklyActivity = weeklyHistory[0] ?? null
  const weeklyEmission = latestWeeklyActivity?.totalEmission ?? snapshot.weeklyEmission
  const dailyEmission = latestWeeklyActivity
    ? Number((latestWeeklyActivity.totalEmission / 7).toFixed(1))
    : snapshot.dailyEmission
  const totalEmission = useMemo(() => {
    if (weeklyHistory.length === 0) {
      return snapshot.weeklyEmission
    }

    return Number(
      weeklyHistory.reduce((sum, week) => sum + (Number(week.totalEmission) || 0), 0).toFixed(1)
    )
  }, [snapshot.weeklyEmission, weeklyHistory])
  const averageWeeklyEmission = useMemo(() => {
    if (weeklyHistory.length === 0) {
      return snapshot.weeklyEmission
    }

    const totalWeeklyEmission = weeklyHistory.reduce(
      (sum, week) => sum + (Number(week.totalEmission) || 0),
      0
    )

    return Number((totalWeeklyEmission / weeklyHistory.length).toFixed(1))
  }, [snapshot.weeklyEmission, weeklyHistory])
  const yearlyEmission = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(Date.UTC(currentYear, 0, 1))
    const yearEnd = new Date(Date.UTC(currentYear, 11, 31))

    const totalForYear = rawWeeklyResults.reduce((sum, week) => {
      const weekStart = new Date(`${week.weekStart}T00:00:00Z`)
      const weekEnd = new Date(`${week.weekEnd}T00:00:00Z`)
      const overlapStart = weekStart > yearStart ? weekStart : yearStart
      const overlapEnd = weekEnd < yearEnd ? weekEnd : yearEnd

      if (overlapEnd < overlapStart) {
        return sum
      }

      const overlapDays = Math.floor((overlapEnd - overlapStart) / 86400000) + 1
      const overlapShare = overlapDays / 7

      return sum + (Number(week.totalEmission) || 0) * overlapShare
    }, 0)

    return Number(totalForYear.toFixed(1))
  }, [rawWeeklyResults])
  const weeklyOverview = useMemo(() => {
    const entries = latestWeeklyActivity
      ? [
          ["wonen", latestWeeklyActivity.homeEmission],
          ["transport", latestWeeklyActivity.transportEmission],
          ["voeding", latestWeeklyActivity.foodEmission],
          ["consumptie", latestWeeklyActivity.consumptionEmission],
          ["achtergrondimpact", latestWeeklyActivity.backgroundImpact],
        ]
      : Object.entries(snapshot.categories)
    const visibleEntries = entries
      .filter(([category]) => category !== "achtergrondimpact")
      .sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])
    const backgroundEntry = entries.find(([category]) => category === "achtergrondimpact")

    return backgroundEntry ? [...visibleEntries, backgroundEntry] : visibleEntries
  }, [latestWeeklyActivity, snapshot.categories])
  const largestCategory = weeklyOverview.find(
    ([category]) => category !== "achtergrondimpact"
  )
  const categorySwipeItems = useMemo(
    () => {
      const totals = rawWeeklyResults.reduce(
        (currentTotals, week) => ({
          wonen: currentTotals.wonen + (Number(week.homeEmission) || 0),
          transport: currentTotals.transport + (Number(week.transportEmission) || 0),
          voeding: currentTotals.voeding + (Number(week.foodEmission) || 0),
          consumptie: currentTotals.consumptie + (Number(week.consumptionEmission) || 0),
        }),
        {
          wonen: 0,
          transport: 0,
          voeding: 0,
          consumptie: 0,
        }
      )

      return Object.entries(totals)
        .map(([category, value]) => ({
          key: category,
          label: getFocusLabel(category),
          value: Number(value.toFixed(1)),
        }))
        .sort((first, second) => second.value - first.value)
    },
    [rawWeeklyResults]
  )

  const updateActiveCategoryIndex = (element) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".overzicht-category-swipe-card")
    if (!firstCard) {
      return
    }

    const railGap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0")
    const cardWidth = firstCard.getBoundingClientRect().width + railGap
    const nextIndex = Math.round(element.scrollLeft / cardWidth)
    setActiveCategoryIndex(nextIndex)
  }

  return (
    <div className="overzicht-page">
      <MobilePageShell
        title="Overzicht"
        icon={<FiBarChart2 />}
        className="overzicht-container"
        contentClassName="overview-content"
      >
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

        {categorySwipeItems.length > 0 ? (
          <section className="overzicht-category-swipe-section">
            <div className="overzicht-history-header">
              <p className="section-label dark">Uitstoot per categorie</p>
            </div>

            <div className="home-rail-dots" aria-hidden="true">
              {categorySwipeItems.map((item, index) => (
                <span
                  key={item.key}
                  className={`home-rail-dot${index === activeCategoryIndex ? " active" : ""}`}
                />
              ))}
            </div>

            <div
              ref={categoryRailRef}
              className="overzicht-category-swipe-rail"
              onScroll={(event) => updateActiveCategoryIndex(event.currentTarget)}
            >
              {categorySwipeItems.map((item) => (
                <article
                  key={item.key}
                  className="overzicht-card overzicht-category-swipe-card"
                >
                  <span className="overzicht-category-kicker">{item.label}</span>
                  <strong>{item.value} kg CO2e</strong>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="overzicht-card overzicht-history-card">
          <div className="overzicht-history-header">
            <h2>Wekelijkse activiteit</h2>
            {weeklyHistory.length > 1 ? (
              <button
                type="button"
                className="overzicht-history-button"
                onClick={() => navigate("/wekelijkse-activiteit-geschiedenis")}
              >
                Geschiedenis
              </button>
            ) : null}
          </div>
          {latestWeeklyActivity ? (
            <article className="overzicht-history-item">
              <div className="overzicht-history-top">
                <div>
                  <span className="overzicht-history-kicker">
                    Week {latestWeeklyActivity.weekNumber}
                  </span>
                  <strong>
                    {formatWeekRangeLabel(
                      latestWeeklyActivity.weekStart,
                      latestWeeklyActivity.weekEnd
                    )}
                  </strong>
                </div>
                <span className="overzicht-history-total">
                  {latestWeeklyActivity.totalEmission} kg CO2e
                </span>
              </div>

              <div className="overzicht-history-categories">
                <span>Wonen {latestWeeklyActivity.homeEmission} kg</span>
                <span>Transport {latestWeeklyActivity.transportEmission} kg</span>
                <span>Voeding {latestWeeklyActivity.foodEmission} kg</span>
                <span>Consumptie {latestWeeklyActivity.consumptionEmission} kg</span>
                <span>Achtergrondimpact {latestWeeklyActivity.backgroundImpact} kg</span>
              </div>

              <p className="overzicht-history-comparison">
                {latestWeeklyActivity.comparison
                  ? latestWeeklyActivity.comparison.trend === "equal"
                    ? "Gelijk aan de week ervoor"
                    : `${Math.abs(latestWeeklyActivity.comparison.difference)} kg ${
                        latestWeeklyActivity.comparison.trend === "lower" ? "lager" : "hoger"
                      } dan de week ervoor (${Math.abs(
                        latestWeeklyActivity.comparison.percentageChange
                      )}%)`
                  : "Nog geen vergelijking met een eerdere week"}
              </p>
            </article>
          ) : (
            <p className="overzicht-history-empty">
              Je wekelijkse activiteit verschijnt hier zodra je je eerste week hebt ingevuld.
            </p>
          )}
        </section>

        <div className="overzicht-cards">
          <div
            className="overzicht-card"
            onClick={() => navigate("/dagelijkse-uitstoot")}
          >
            <h2>Dagelijkse uitstoot</h2>
            <p>{dailyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/gemiddelde-jaar")}
          >
            <h2>Jaarlijkse uitstoot</h2>
            <p>{yearlyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/gemiddelde-week")}
          >
            <h2>Gemiddelde wekelijkse uitstoot</h2>
            <p>{averageWeeklyEmission} kg CO2e</p>
          </div>

          <div
            className="overzicht-card"
            onClick={() => navigate("/wekelijkse-uitstoot")}
          >
            <h2>Totale uitstoot</h2>
            <p>{totalEmission} kg CO2e</p>
          </div>
        </div>
      </MobilePageShell>
    </div>
  )
}

export default Overzicht
