import "./overzicht.css"
import { useMemo, useRef, useState } from "react"
import { FiClock } from "react-icons/fi"
import BottomNav from "../../components/BottomNav"
import AppHeader from "../../components/AppHeader"
import {
  buildWeeklyOverviewItems,
  formatWeekRangeLabel,
  getStoredWeeklyResults,
} from "../../utils/weeklyResults"

function WekelijkseActiviteitGeschiedenis() {
  const railRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const weeklyHistory = useMemo(
    () => buildWeeklyOverviewItems(getStoredWeeklyResults()).slice(1).reverse(),
    []
  )

  const updateActiveIndex = (element) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".overzicht-history-swipe-card")
    if (!firstCard) {
      return
    }

    const railGap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0")
    const cardWidth = firstCard.getBoundingClientRect().width + railGap
    const nextIndex = Math.round(element.scrollLeft / cardWidth)
    setActiveIndex(nextIndex)
  }

  return (
    <div className="overzicht-page">
      <div className="overzicht-container">
        <AppHeader title="Geschiedenis" icon={<FiClock />} />

        <div className="overview-content">
          <section className="overzicht-summary-card">
            <p className="section-label dark">Wekelijkse activiteit</p>
            <h2>Eerdere weken</h2>
          </section>

          {weeklyHistory.length > 0 ? (
            <section className="overzicht-history-swipe-section">
              <div className="home-rail-dots" aria-hidden="true">
                {weeklyHistory.map((week, index) => (
                  <span
                    key={`${week.year}-${week.weekNumber}`}
                    className={`home-rail-dot${index === activeIndex ? " active" : ""}`}
                  />
                ))}
              </div>

              <div
                ref={railRef}
                className="overzicht-history-swipe-rail"
                onScroll={(event) => updateActiveIndex(event.currentTarget)}
              >
                {weeklyHistory.map((week) => (
                  <article
                    key={`${week.year}-${week.weekNumber}`}
                    className="overzicht-history-swipe-card"
                  >
                    <div className="overzicht-history-top">
                      <div>
                        <span className="overzicht-history-kicker">Week {week.weekNumber}</span>
                        <strong>{formatWeekRangeLabel(week.weekStart, week.weekEnd)}</strong>
                      </div>
                      <span className="overzicht-history-total">
                        {week.totalEmission} kg CO2e
                      </span>
                    </div>

                    <div className="overzicht-history-categories">
                      <span>Wonen {week.homeEmission} kg</span>
                      <span>Transport {week.transportEmission} kg</span>
                      <span>Voeding {week.foodEmission} kg</span>
                      <span>Consumptie {week.consumptionEmission} kg</span>
                      <span>Achtergrondimpact {week.backgroundImpact} kg</span>
                    </div>

                    <p className="overzicht-history-comparison">
                      {week.comparison
                        ? week.comparison.trend === "equal"
                          ? "Gelijk aan de week ervoor"
                          : `${Math.abs(week.comparison.difference)} kg ${
                              week.comparison.trend === "lower" ? "lager" : "hoger"
                            } dan de week ervoor (${Math.abs(
                              week.comparison.percentageChange
                            )}%)`
                        : "Nog geen vergelijking met een eerdere week"}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="overzicht-card overzicht-history-card">
              <p className="overzicht-history-empty">
                Er zijn nog geen eerdere weken opgeslagen naast je meest recente week.
              </p>
            </section>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

export default WekelijkseActiviteitGeschiedenis
