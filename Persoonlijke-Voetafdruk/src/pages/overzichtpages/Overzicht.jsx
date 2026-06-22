import "./overzicht.css"
import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiBarChart2, FiInfo } from "react-icons/fi"
import { LuTrees } from "react-icons/lu"
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
import { getForestOverview } from "../../utils/forestState"

const CATEGORY_COLORS = {
  wonen: "#3e8f55",
  transport: "#4aa3df",
  voeding: "#8bcf91",
  consumptie: "#d8b36a",
  achtergrondimpact: "#9aa89a",
}

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
  const sharedForest = useMemo(() => getForestOverview(), [])
  const rawWeeklyResults = useMemo(() => getAugmentedWeeklyResults(), [])
  const latestWeeklyActivity = weeklyHistory[0] ?? null
  const weeklyEmission = sharedForest.weeklyEmission || latestWeeklyActivity?.totalEmission || snapshot.weeklyEmission
  const weeklyGoal = sharedForest.weeklyGoal
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
  const categoryTotal = weeklyOverview.reduce(
    (sum, [, value]) => sum + (Number(value) || 0),
    0
  )
  const categoryChartItems = useMemo(() => {
    if (categoryTotal <= 0) {
      return []
    }

    return weeklyOverview.map(([category, value]) => {
      const normalizedValue = Number(value) || 0

      return {
        key: category,
        label: getFocusLabel(category),
        value: Number(normalizedValue.toFixed(1)),
        share: Math.round((normalizedValue / categoryTotal) * 100),
        color: CATEGORY_COLORS[category] || "#8bcf91",
      }
    })
  }, [categoryTotal, weeklyOverview])
  const donutGradient = useMemo(() => {
    if (categoryChartItems.length === 0) {
      return "conic-gradient(#dfe8dc 0deg 360deg)"
    }

    let cursor = 0
    const parts = categoryChartItems.map((item) => {
      const start = cursor
      const end = cursor + item.share * 3.6
      cursor = end
      return `${item.color} ${start}deg ${end}deg`
    })

    return `conic-gradient(${parts.join(", ")})`
  }, [categoryChartItems])
  const largestCategory = weeklyOverview.find(
    ([category]) => category !== "achtergrondimpact"
  )
  const forestScore = sharedForest.score
  const forestGameImpact = {
    completedCount: sharedForest.game.completedIds.length,
    badCount: sharedForest.game.badIds.length,
    tokens: sharedForest.game.tokens,
  }
  const overviewStatus = sharedForest.status.label
  const goalDifference = Number(Math.abs(weeklyGoal - weeklyEmission).toFixed(1))
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
  const weeklyTrendItems = useMemo(() => {
    const source =
      weeklyHistory.length > 0
        ? weeklyHistory.slice(0, 6).reverse()
        : [
            {
              weekNumber: "nu",
              totalEmission: weeklyEmission,
              weekStart: "",
              weekEnd: "",
            },
          ]
    const maxEmission = Math.max(
      weeklyGoal,
      ...source.map((week) => Number(week.totalEmission) || 0),
      1
    )

    return source.map((week) => {
      const total = Number(week.totalEmission) || 0

      return {
        key: `${week.weekStart || "current"}-${week.weekEnd || week.weekNumber}`,
        label: week.weekNumber === "nu" ? "Nu" : `W${week.weekNumber}`,
        total: Number(total.toFixed(1)),
        height: Math.max(10, Math.round((total / maxEmission) * 100)),
        isAboveGoal: total > weeklyGoal,
      }
    })
  }, [weeklyEmission, weeklyGoal, weeklyHistory])

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
        <section className="overzicht-hero-card">
          <div className="overzicht-hero-top">
            <div>
              <p className="section-label dark">In één oogopslag</p>
              <h2>{overviewStatus}</h2>
            </div>
            <span className="overzicht-hero-icon" aria-hidden="true">
              <LuTrees />
            </span>
          </div>

          <div className="overzicht-score-row">
            <strong>{forestScore}/100</strong>
            <span>
              {weeklyEmission <= weeklyGoal
                ? `${goalDifference} kg onder je weekdoel`
                : `${goalDifference} kg boven je weekdoel`}
            </span>
          </div>

          <div className="overzicht-hero-progress" aria-label="Bos score">
            <span style={{ width: `${forestScore}%` }} />
          </div>

          <div className="overzicht-hero-grid">
            <div>
              <span>Deze week</span>
              <strong>{Number(weeklyEmission.toFixed(1))} kg</strong>
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
              <span>Focus</span>
              <strong>{largestCategory ? getFocusLabel(largestCategory[0]) : "Geen data"}</strong>
            </div>
          </div>

          <button
            type="button"
            className="overzicht-forest-button"
            onClick={() => navigate("/bos")}
          >
            Open bosvisualisatie
            <FiArrowRight aria-hidden="true" />
          </button>
        </section>

        <section className="overzicht-card overzicht-forest-impact-card" aria-label="Bosimpact uit acties">
          <div>
            <p className="section-label dark">Bosimpact</p>
            <h2>Acties werken door in je bos</h2>
          </div>
          <div className="overzicht-forest-impact-grid">
            <div>
              <span>Goede acties</span>
              <strong>{forestGameImpact.completedCount}</strong>
            </div>
            <div className={forestGameImpact.badCount > 0 ? "is-warning" : ""}>
              <span>Slechte acties</span>
              <strong>{forestGameImpact.badCount}</strong>
            </div>
            <div>
              <span>Tokens</span>
              <strong>{forestGameImpact.tokens}</strong>
            </div>
          </div>
        </section>

        <section className="overzicht-card overzicht-visual-card" aria-label="Visuele uitstootgrafieken">
          <div className="overzicht-history-header">
            <div>
              <p className="section-label dark">Grafieken</p>
              <h2>Waar komt je uitstoot vandaan?</h2>
            </div>
          </div>

          <div className="overzicht-chart-grid">
            <div className="overzicht-donut-wrap">
              <div
                className="overzicht-donut"
                style={{ background: donutGradient }}
                aria-label="Verdeling per categorie"
              >
                <span>
                  {Number(weeklyEmission.toFixed(1))}
                  <small>kg</small>
                </span>
              </div>
            </div>

            <div className="overzicht-category-bars">
              {categoryChartItems.map((item) => (
                <div key={item.key} className="overzicht-category-bar-row">
                  <div className="overzicht-category-bar-top">
                    <span>{item.label}</span>
                    <strong>{item.value} kg</strong>
                  </div>
                  <div className="overzicht-category-bar-track">
                    <span
                      style={{
                        width: `${Math.max(item.share, 4)}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overzicht-card overzicht-trend-card" aria-label="Trendgrafiek wekelijkse uitstoot">
          <div className="overzicht-history-header">
            <div>
              <p className="section-label dark">Trend</p>
              <h2>Laatste weken</h2>
            </div>
            <span className="overzicht-goal-chip">Doel {weeklyGoal} kg</span>
          </div>

          <div className="overzicht-trend-chart">
            {weeklyTrendItems.map((item) => (
              <div key={item.key} className="overzicht-trend-column">
                <span className="overzicht-trend-value">{item.total}</span>
                <div className="overzicht-trend-bar-shell">
                  <span
                    className={item.isAboveGoal ? "is-high" : ""}
                    style={{ height: `${item.height}%` }}
                  />
                </div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
          <p className="overzicht-chart-note">
            Groene balken zitten onder je doel. Gele balken laten zien waar je kunt bijsturen.
          </p>
        </section>

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
