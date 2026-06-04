import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiCheckCircle, FiEdit3, FiPlus } from "react-icons/fi"
import { HiOutlineCalculator } from "react-icons/hi"
import { LuLeaf } from "react-icons/lu"
import MobilePageShell from "../components/MobilePageShell"
import {
  buildImpactSnapshot,
  getFocusLabel,
  getImpactHistory,
  getPersonalInsight,
} from "../utils/impactInsights"
import {
  getLatestWeeklyAnswers,         
  getProfileAnswers,
  hasCompletedProfileQuestionnaire,
} from "../utils/questionnaireStorage"
import {
  formatWeekRangeLabel,
  getStoredWeeklyResults,
  getWeeklyCheckinWeekInfo,
  hasWeeklyResultForWeek,
  shouldShowWeeklyCheckinPopup,
} from "../utils/weeklyResults"
import {
  maybeShowDailyTipNotification,
  maybeShowWeeklyCheckinNotification,
} from "../utils/notifications"
import { factsList, tipsList } from "../data/tips"
import {
  applyCustomActivitiesToWeeklyResult,
  getCustomActivityTotals,
  getAugmentedWeeklyResults,
} from "../utils/customActivities"
import "../App.css"
import handFoto from "../assets/HandHandfoto.png"

const forestHeroPhoto = {
  src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
  alt: "Groen bos als visualisatie van natuurlijke groei",
}

function Home() {
  const navigate = useNavigate()
  const emissionRailRef = useRef(null)
  const quickActionsRailRef = useRef(null)
  const focusRailRef = useRef(null)
  const [activeEmissionIndex, setActiveEmissionIndex] = useState(0)
  const [activeQuickActionIndex, setActiveQuickActionIndex] = useState(0)
  const [activeFocusIndex, setActiveFocusIndex] = useState(0)
  const [activeFactIndex, setActiveFactIndex] = useState(0)
  const [factTimerProgress, setFactTimerProgress] = useState(100)
  const [showWeeklyReminder, setShowWeeklyReminder] = useState(false)
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(savedGoal) && savedGoal >= 0 ? savedGoal : 0
  })
  const [goalDraft, setGoalDraft] = useState(() => String(weeklyGoal))
  const profileAnswers = getProfileAnswers()
  const weeklyAnswers = getLatestWeeklyAnswers()
  const weeklyResults = useMemo(() => getStoredWeeklyResults(), [])
  const allWeeklyResultsWithExtras = useMemo(() => getAugmentedWeeklyResults(), [])
  const latestWeeklyResult = weeklyResults[0] ?? null
  const activeCheckinWeek = useMemo(() => getWeeklyCheckinWeekInfo(), [])
  const displayWeekKey = latestWeeklyResult?.weekStart ?? activeCheckinWeek.weekStart
  const customActivityTotals = useMemo(
    () => getCustomActivityTotals(displayWeekKey),
    [displayWeekKey]
  )
  const latestWeeklyResultWithExtras = useMemo(
    () =>
      latestWeeklyResult
        ? applyCustomActivitiesToWeeklyResult(latestWeeklyResult, customActivityTotals)
        : null,
    [customActivityTotals, latestWeeklyResult]
  )
  const weeklyQuestionnaireDone = useMemo(
    () => hasWeeklyResultForWeek(weeklyResults, activeCheckinWeek),
    [activeCheckinWeek, weeklyResults]
  )

  const currentSnapshot = useMemo(() => {
    if (Object.keys(profileAnswers).length === 0 && Object.keys(weeklyAnswers).length === 0) {
      return null
    }

    return buildImpactSnapshot(profileAnswers, weeklyAnswers)
  }, [profileAnswers, weeklyAnswers])

  const emissionData = useMemo(() => {
    if (!currentSnapshot) {
      return {
        dailyEmission: 12.4,
        weeklyEmission: 86.8,
        score: 52,
        dominantCategory: "energie",
      }
    }

    const resolvedCategories = latestWeeklyResultWithExtras
      ? {
          wonen: latestWeeklyResultWithExtras.homeEmission,
          transport: latestWeeklyResultWithExtras.transportEmission,
          voeding: latestWeeklyResultWithExtras.foodEmission,
          consumptie: latestWeeklyResultWithExtras.consumptionEmission,
          achtergrondimpact: latestWeeklyResultWithExtras.backgroundImpact,
        }
      : currentSnapshot.categories
    const dominantCategory =
      Object.entries(resolvedCategories)
        .filter(([category]) => category !== "achtergrondimpact")
        .sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])[0]?.[0] ??
      currentSnapshot.dominantCategory

    return {
      dailyEmission: latestWeeklyResultWithExtras
        ? Number((latestWeeklyResultWithExtras.totalEmission / 7).toFixed(1))
        : currentSnapshot.dailyEmission,
      weeklyEmission:
        latestWeeklyResultWithExtras?.totalEmission ?? currentSnapshot.weeklyEmission,
      score: currentSnapshot.totalScore,
      dominantCategory,
    }
  }, [currentSnapshot, latestWeeklyResultWithExtras])

  const history = useMemo(() => getImpactHistory(), [])
  const latestHistoryEntry = history[0] ?? null

  const tipOfTheDay = tipsList[new Date().getDate() % tipsList.length]
  const facts = factsList
  const personalInsight = getPersonalInsight(currentSnapshot)
  const focusLabel = getFocusLabel(emissionData.dominantCategory)
  const savedKg = Math.max(
    0,
    Number((weeklyGoal - emissionData.weeklyEmission).toFixed(1))
  )
  const excessKg = Math.max(
    0,
    Number((emissionData.weeklyEmission - weeklyGoal).toFixed(1))
  )
  const goalProgress = Math.min(
    100,
    Math.max(
      0,
      weeklyGoal > 0 ? Math.round((savedKg / weeklyGoal) * 100) : 0
    )
  )

  const dailyCategoryBreakdown = useMemo(() => {
    const categoryLabels = {
      voeding: "Voeding",
      transport: "Transport",
      energie: "Energie",
      wonen: "Wonen",
      consumptie: "Consumptie",
      achtergrondimpact: "Achtergrondimpact",
    }

    const categoryColors = {
      voeding: "#8bcf91",
      transport: "#3e8f55",
      energie: "#b7d96d",
      wonen: "#6fb8a0",
      consumptie: "#d2c1a3",
      achtergrondimpact: "#cfd9c7",
    }

    const categories = latestWeeklyResultWithExtras
      ? {
          wonen: latestWeeklyResultWithExtras.homeEmission,
          transport: latestWeeklyResultWithExtras.transportEmission,
          voeding: latestWeeklyResultWithExtras.foodEmission,
          consumptie: latestWeeklyResultWithExtras.consumptionEmission,
          achtergrondimpact: latestWeeklyResultWithExtras.backgroundImpact,
        }
      : currentSnapshot?.categories
    const visibleCategories = categories
      ? Object.fromEntries(
          Object.entries(categories).filter(([key]) => key !== "achtergrondimpact")
        )
      : null
    // Keep background impact inside the total emission denominator so the
    // visible categories keep their real size instead of being inflated.
    const totalCategoryValue = categories
      ? Object.values(categories).reduce((sum, value) => sum + value, 0)
      : 0

    const fallback = [
      { key: "transport", label: "Transport", value: 4.6, share: 38, color: "#3e8f55" },
      { key: "energie", label: "Energie", value: 3.2, share: 26, color: "#b7d96d" },
      { key: "voeding", label: "Voeding", value: 2.7, share: 22, color: "#8bcf91" },
      { key: "wonen", label: "Wonen", value: 1.9, share: 14, color: "#6fb8a0" },
    ]

    if (!visibleCategories || totalCategoryValue <= 0) {
      return fallback
    }

    return Object.entries(visibleCategories)
      .map(([key, value]) => {
        const normalizedValue = Number(value) || 0
        const share = Math.max(
          8,
          Math.round((normalizedValue / totalCategoryValue) * 100)
        )
        const dailyValue = Number(
          ((normalizedValue / totalCategoryValue) * emissionData.dailyEmission).toFixed(1)
        )

        return {
          key,
          label: categoryLabels[key] || "Overig",
          rawValue: normalizedValue,
          value: dailyValue,
          share,
          color: categoryColors[key] || "#8bcf91",
        }
      })
      .sort((a, b) => b.rawValue - a.rawValue)
  }, [currentSnapshot, emissionData.dailyEmission, latestWeeklyResultWithExtras])

  const dailyCategoryChartBreakdown = useMemo(() => {
    const categoryColors = {
      voeding: "#8bcf91",
      transport: "#3e8f55",
      energie: "#b7d96d",
      wonen: "#6fb8a0",
      consumptie: "#d2c1a3",
      achtergrondimpact: "#cfd9c7",
    }

    const categories = latestWeeklyResultWithExtras
      ? {
          wonen: latestWeeklyResultWithExtras.homeEmission,
          transport: latestWeeklyResultWithExtras.transportEmission,
          voeding: latestWeeklyResultWithExtras.foodEmission,
          consumptie: latestWeeklyResultWithExtras.consumptionEmission,
          achtergrondimpact: latestWeeklyResultWithExtras.backgroundImpact,
        }
      : currentSnapshot?.categories
    const totalCategoryValue = categories
      ? Object.values(categories).reduce((sum, value) => sum + value, 0)
      : 0

    if (!categories || totalCategoryValue <= 0) {
      return dailyCategoryBreakdown
    }

    const rawBreakdown = Object.entries(categories).map(([key, value]) => ({
      key,
      rawShare: ((Number(value) || 0) / totalCategoryValue) * 100,
      color: categoryColors[key] || "#8bcf91",
    }))

    const backgroundImpact = rawBreakdown.find(
      (category) => category.key === "achtergrondimpact"
    )
    const editableCategories = rawBreakdown.filter(
      (category) => category.key !== "achtergrondimpact"
    )
    const largestEditableShare = editableCategories.reduce(
      (largestShare, category) => Math.max(largestShare, category.rawShare),
      0
    )

    if (!backgroundImpact || largestEditableShare > 47) {
      return rawBreakdown
        .map((category) => ({
          key: category.key,
          share: Math.max(4, Math.round(category.rawShare)),
          color: category.color,
        }))
        .sort((a, b) => b.share - a.share)
    }

    const otherTotalShare = editableCategories.reduce(
      (sum, category) => sum + category.rawShare,
      0
    )
    const scaledEditableCategories = editableCategories.map((category) => ({
      key: category.key,
      share:
        otherTotalShare > 0
          ? (category.rawShare / otherTotalShare) * 53
          : 0,
      color: category.color,
    }))

    return [
      {
        key: backgroundImpact.key,
        share: 47,
        color: backgroundImpact.color,
      },
      ...scaledEditableCategories,
    ]
      .map((category) => ({
        ...category,
        share: Math.max(4, Math.round(category.share)),
      }))
      .sort((a, b) => b.share - a.share)
  }, [currentSnapshot, dailyCategoryBreakdown, latestWeeklyResultWithExtras])

  const weeklyCategoryBreakdown = useMemo(
    () => {
      if (latestWeeklyResultWithExtras) {
        return [
          {
            key: "transport",
            label: "Transport",
            value: latestWeeklyResultWithExtras.transportEmission,
            color: "#3e8f55",
          },
          {
            key: "wonen",
            label: "Wonen",
            value: latestWeeklyResultWithExtras.homeEmission,
            color: "#6fb8a0",
          },
          {
            key: "voeding",
            label: "Voeding",
            value: latestWeeklyResultWithExtras.foodEmission,
            color: "#8bcf91",
          },
          {
            key: "consumptie",
            label: "Consumptie",
            value: latestWeeklyResultWithExtras.consumptionEmission,
            color: "#d2c1a3",
          },
        ]
          .filter((category) => category.value > 0)
          .sort((first, second) => second.value - first.value)
      }

      return dailyCategoryBreakdown.map((category) => ({
        ...category,
        value: Number((category.value * 7).toFixed(1)),
      }))
    },
    [dailyCategoryBreakdown, latestWeeklyResultWithExtras]
  )
  const monthInfo = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
      month: "2-digit",
    })
    const parts = formatter.formatToParts(new Date())
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
    const year = Number(map.year)
    const month = Number(map.month)
    const monthStart = new Date(Date.UTC(year, month - 1, 1))
    const monthEnd = new Date(Date.UTC(year, month, 0))
    const monthLabelFormatter = new Intl.DateTimeFormat("nl-NL", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
    })
    const monthNameFormatter = new Intl.DateTimeFormat("nl-NL", {
      timeZone: "UTC",
      month: "long",
    })

    let firstCoveredDate = null
    let lastCoveredDate = null

    const monthlyCategoryTemplate = [
      {
        key: "transport",
        label: "Transport",
        value: 0,
        color: "#3e8f55",
      },
      {
        key: "wonen",
        label: "Wonen",
        value: 0,
        color: "#6fb8a0",
      },
      {
        key: "voeding",
        label: "Voeding",
        value: 0,
        color: "#8bcf91",
      },
      {
        key: "consumptie",
        label: "Consumptie",
        value: 0,
        color: "#d2c1a3",
      },
    ]

    const totals = weeklyResults.reduce(
      (currentTotals, week) => {
        const weekStart = new Date(`${week.weekStart}T00:00:00Z`)
        const weekEnd = new Date(`${week.weekEnd}T00:00:00Z`)
        const overlapStart = weekStart > monthStart ? weekStart : monthStart
        const overlapEnd = weekEnd < monthEnd ? weekEnd : monthEnd

        if (overlapEnd < overlapStart) {
          return currentTotals
        }

        if (!firstCoveredDate || overlapStart < firstCoveredDate) {
          firstCoveredDate = overlapStart
        }

        if (!lastCoveredDate || overlapEnd > lastCoveredDate) {
          lastCoveredDate = overlapEnd
        }

        const overlapDays = Math.floor((overlapEnd - overlapStart) / 86400000) + 1
        const overlapShare = overlapDays / 7

        return {
          totalEmission: currentTotals.totalEmission + (week.totalEmission || 0) * overlapShare,
          categoryBreakdown: monthlyCategoryTemplate.map((category, index) => ({
            ...category,
            value:
              currentTotals.categoryBreakdown[index].value +
              ((category.key === "transport"
                ? week.transportEmission
                : category.key === "wonen"
                  ? week.homeEmission
                  : category.key === "voeding"
                    ? week.foodEmission
                    : week.consumptionEmission) || 0) * overlapShare,
          })),
        }
      },
      {
        totalEmission: 0,
        categoryBreakdown: monthlyCategoryTemplate.map((category) => ({
          ...category,
          value: 0,
        })),
      }
    )

    const roundedCategoryBreakdown = totals.categoryBreakdown
      .map((category) => ({
        ...category,
        value: Number(category.value.toFixed(1)),
      }))
      .filter((category) => category.value > 0)
      .sort((first, second) => second.value - first.value)
    const chartTotal = roundedCategoryBreakdown.reduce(
      (sum, category) => sum + category.value,
      0
    )

    return {
      totalEmission: Number(totals.totalEmission.toFixed(1)),
      rangeLabel: `Uitstoot ${monthNameFormatter.format(monthStart)}`,
      categoryBreakdown: roundedCategoryBreakdown,
      chartBreakdown:
        chartTotal > 0
          ? roundedCategoryBreakdown.map((category) => ({
              key: category.key,
              color: category.color,
              share: Math.max(4, Math.round((category.value / chartTotal) * 100)),
            }))
          : dailyCategoryChartBreakdown,
    }
  }, [dailyCategoryChartBreakdown, weeklyResults])

  const totalInfo = useMemo(() => {
    const totalCategoryTemplate = [
      { key: "transport", label: "Transport", value: 0, color: "#3e8f55" },
      { key: "wonen", label: "Wonen", value: 0, color: "#6fb8a0" },
      { key: "voeding", label: "Voeding", value: 0, color: "#8bcf91" },
      { key: "consumptie", label: "Consumptie", value: 0, color: "#d2c1a3" },
    ]

    const totals = allWeeklyResultsWithExtras.reduce(
      (currentTotals, week) => ({
        totalEmission: currentTotals.totalEmission + (week.totalEmission || 0),
        categoryBreakdown: totalCategoryTemplate.map((category, index) => ({
          ...category,
          value:
            currentTotals.categoryBreakdown[index].value +
            ((category.key === "transport"
              ? week.transportEmission
              : category.key === "wonen"
                ? week.homeEmission
                : category.key === "voeding"
                  ? week.foodEmission
                  : week.consumptionEmission) || 0),
        })),
      }),
      {
        totalEmission: 0,
        categoryBreakdown: totalCategoryTemplate.map((category) => ({
          ...category,
          value: 0,
        })),
      }
    )

    const roundedCategoryBreakdown = totals.categoryBreakdown
      .map((category) => ({
        ...category,
        value: Number(category.value.toFixed(1)),
      }))
      .filter((category) => category.value > 0)
      .sort((first, second) => second.value - first.value)

    const chartTotal = roundedCategoryBreakdown.reduce(
      (sum, category) => sum + category.value,
      0
    )

    return {
      totalEmission: Number(totals.totalEmission.toFixed(1)),
      rangeLabel: "Alle opgeslagen weken",
      categoryBreakdown: roundedCategoryBreakdown,
      chartBreakdown:
        chartTotal > 0
          ? roundedCategoryBreakdown.map((category) => ({
              key: category.key,
              color: category.color,
              share: Math.max(4, Math.round((category.value / chartTotal) * 100)),
            }))
          : dailyCategoryChartBreakdown,
    }
  }, [allWeeklyResultsWithExtras, dailyCategoryChartBreakdown])

  const weeklyTargetLeft = Math.max(
    0,
    Number((weeklyGoal - emissionData.weeklyEmission).toFixed(1))
  )
  const goalStatus =
    emissionData.weeklyEmission <= weeklyGoal
      ? "Op schema"
      : "Boven je doel"
  const historyDelta = latestHistoryEntry
    ? Number((emissionData.weeklyEmission - latestHistoryEntry.weeklyEmission).toFixed(1))
    : null
  const dailyGoal = Number((weeklyGoal / 7).toFixed(1))
  const stretchGoal = Math.max(40, weeklyGoal - 20)
  const monthlyFocusCategory = monthInfo.categoryBreakdown[0] ?? null
  const monthlyFocusLabel = monthlyFocusCategory?.label ?? "Nog geen maanddata"
  const monthlyFocusAction =
    monthlyFocusCategory?.key === "transport"
      ? "Kijk welke rit je deze maand kunt vervangen door OV of fiets."
      : monthlyFocusCategory?.key === "voeding"
        ? "Plan deze maand extra plantaardige maaltijden voor snelle winst."
        : monthlyFocusCategory?.key === "wonen"
          ? "Pak deze maand thuis 1 concrete energiebesparing mee."
          : monthlyFocusCategory?.key === "consumptie"
            ? "Koop deze maand alleen wat je echt nodig hebt."
            : "Vul je weekcheck-in in om je maandfocus te zien."

  const emissionCardsCount = 4
  const quickActionCardsCount = 3
  const focusCardsCount = 2
  const updateActiveIndex = (element, setter) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".home-widget-rail-card")
    if (!firstCard) {
      return
    }

    // Read the real rail gap from CSS so swipe pagination stays aligned
    // after we tighten the spacing between dashboard cards.
    const railGap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0")
    const cardWidth = firstCard.getBoundingClientRect().width + railGap
    const index = Math.round(element.scrollLeft / cardWidth)
    setter(index)
  }

  useEffect(() => {
    if (!hasCompletedProfileQuestionnaire()) {
      navigate("/questionnaire")
    }
  }, [navigate])

  useEffect(() => {
    setShowWeeklyReminder(shouldShowWeeklyCheckinPopup(weeklyResults))
  }, [weeklyResults])

  useEffect(() => {
    if (showWeeklyReminder) {
      maybeShowWeeklyCheckinNotification(activeCheckinWeek)
    }
  }, [activeCheckinWeek, showWeeklyReminder])

  useEffect(() => {
    maybeShowDailyTipNotification(tipOfTheDay)
  }, [tipOfTheDay])

  useEffect(() => {
    const factDurationMs = 5000
    const startedAt = Date.now()

    const progressIntervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const nextProgress = Math.max(0, 100 - (elapsed / factDurationMs) * 100)
      setFactTimerProgress(nextProgress)
    }, 100)

    const factTimeoutId = window.setTimeout(() => {
      setActiveFactIndex((currentIndex) => (currentIndex + 1) % facts.length)
      setFactTimerProgress(100)
    }, factDurationMs)

    return () => {
      window.clearInterval(progressIntervalId)
      window.clearTimeout(factTimeoutId)
    }
  }, [activeFactIndex, facts.length])

  useEffect(() => {
    localStorage.setItem("weekly-goal", String(weeklyGoal))
  }, [weeklyGoal])

  useEffect(() => {
    setGoalDraft(String(weeklyGoal))
  }, [weeklyGoal])

  const applyGoal = (value) => {
    const nextGoal = Math.min(300, Math.max(0, Number(value)))
    if (!Number.isFinite(nextGoal)) {
      return
    }

    setWeeklyGoal(nextGoal)
    setIsGoalEditorOpen(false)
  }

  const resetGoal = () => {
    setWeeklyGoal(0)
    setGoalDraft("0")
    setIsGoalEditorOpen(false)
  }

  return (
  <MobilePageShell
    title="Impact"
    icon={<LuLeaf />}
    className="home-page"
    contentClassName="home-content"
  >
      {showWeeklyReminder ? (
        <section className="home-reminder-card">
          <p className="section-label dark">Wekelijkse reminder</p>
          <h2 className="home-reminder-title">Vul je activiteit van afgelopen week in</h2>
          <p className="home-reminder-text">
            Week van {formatWeekRangeLabel(activeCheckinWeek.weekStart, activeCheckinWeek.weekEnd)} staat klaar om in te vullen.
          </p>
          <div className="home-reminder-actions">
            <button
              type="button"
              className="goal-edit-button"
              onClick={() =>
                navigate("/weekly-questionnaire", {
                  state: { weekKey: activeCheckinWeek.weekStart },
                })
              }
            >
              Open wekelijkse vragenlijst
            </button>
            <button
              type="button"
              className="home-reminder-dismiss"
              onClick={() => setShowWeeklyReminder(false)}
            >
              Later
            </button>
          </div>
        </section>
      ) : null}

      <section
        className="home-feature-card action-card"
        onClick={() => navigate("/bos")}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            navigate("/bos")
          }
        }}
      >
        <p className="section-label dark">Jouw Persoonlijke Bos</p>

        <div className="home-feature-visual" aria-hidden="true">
          <img
            className="home-feature-photo"
            src={forestHeroPhoto.src}
            alt={forestHeroPhoto.alt}
          />
        </div>
      </section>

      <section className="home-widget-rail-section home-emission-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Uitstootoverzicht</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: emissionCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeEmissionIndex ? " active" : ""}`}
            />
          ))}
        </div>

        <div
          ref={emissionRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare uitstootkaarten"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveEmissionIndex)
          }
        >
          <section className="info-card daily-widget-card home-widget-rail-card home-emission-card">
            <div className="daily-widget-top">
              <div>
                <p className="section-label dark">Wekelijkse uitstoot</p>
                <p className="compact-number">{emissionData.weeklyEmission} kg CO₂e</p>
                <p className="daily-widget-subtitle">
                  Week {activeCheckinWeek.weekNumber} · {formatWeekRangeLabel(
                    activeCheckinWeek.weekStart,
                    activeCheckinWeek.weekEnd
                  )}
                </p>
              </div>
            </div>

            <div className="daily-widget-bottom">
              <div className="daily-widget-chart" aria-hidden="true">
                {dailyCategoryChartBreakdown.map((category) => (
                  <span
                    key={category.key}
                    className="daily-widget-segment"
                    style={{
                      width: `${category.share}%`,
                      background: category.color,
                    }}
                  />
                ))}
              </div>

              <div className="daily-widget-legend">
                {weeklyCategoryBreakdown.slice(0, 3).map((category) => (
                  <div key={category.key} className="daily-widget-legend-item">
                    <span
                      className="daily-widget-legend-dot"
                      style={{ background: category.color }}
                    />
                    <span className="daily-widget-legend-label">{category.label}</span>
                    <strong className="daily-widget-legend-value">
                      {category.value} kg
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="info-card daily-widget-card home-widget-rail-card home-emission-card">
            <div className="daily-widget-top">
              <div>
                <p className="section-label dark">Dagelijkse uitstoot</p>
                <p className="compact-number">{emissionData.dailyEmission} kg CO₂e</p>
                <p
                  className="daily-widget-subtitle daily-widget-subtitle-spacer"
                  aria-hidden="true"
                >
                  &nbsp;
                </p>
              </div>
            </div>

            <div className="daily-widget-bottom">
              <div className="daily-widget-chart" aria-hidden="true">
                {dailyCategoryChartBreakdown.map((category) => (
                  <span
                    key={category.key}
                    className="daily-widget-segment"
                    style={{
                      width: `${category.share}%`,
                      background: category.color,
                    }}
                  />
                ))}
              </div>

              <div className="daily-widget-legend">
                {dailyCategoryBreakdown.slice(0, 3).map((category) => (
                  <div key={category.key} className="daily-widget-legend-item">
                    <span
                      className="daily-widget-legend-dot"
                      style={{ background: category.color }}
                    />
                    <span className="daily-widget-legend-label">{category.label}</span>
                    <strong className="daily-widget-legend-value">
                      {category.value} kg
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="info-card daily-widget-card home-widget-rail-card home-emission-card">
            <div className="daily-widget-top">
              <div>
                <p className="section-label dark">Maandelijkse uitstoot</p>
                <p className="compact-number">{monthInfo.totalEmission} kg CO₂e</p>
                <p className="daily-widget-subtitle">{monthInfo.rangeLabel}</p>
              </div>
            </div>

            <div className="daily-widget-bottom">
              <div className="daily-widget-chart" aria-hidden="true">
                {monthInfo.chartBreakdown.map((category) => (
                  <span
                    key={category.key}
                    className="daily-widget-segment"
                    style={{
                      width: `${category.share}%`,
                      background: category.color,
                    }}
                  />
                ))}
              </div>

              <div className="daily-widget-legend">
                {monthInfo.categoryBreakdown.slice(0, 3).map((category) => (
                  <div key={category.key} className="daily-widget-legend-item">
                    <span
                      className="daily-widget-legend-dot"
                      style={{ background: category.color }}
                    />
                    <span className="daily-widget-legend-label">{category.label}</span>
                    <strong className="daily-widget-legend-value">
                      {category.value} kg
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="info-card daily-widget-card home-widget-rail-card home-emission-card">
            <div className="daily-widget-top">
              <div>
                <p className="section-label dark">Totale uitstoot</p>
                <p className="compact-number">{totalInfo.totalEmission} kg CO₂e</p>
                <p className="daily-widget-subtitle">{totalInfo.rangeLabel}</p>
              </div>
            </div>

            <div className="daily-widget-bottom">
              <div className="daily-widget-chart" aria-hidden="true">
                {totalInfo.chartBreakdown.map((category) => (
                  <span
                    key={category.key}
                    className="daily-widget-segment"
                    style={{
                      width: `${category.share}%`,
                      background: category.color,
                    }}
                  />
                ))}
              </div>

              <div className="daily-widget-legend">
                {totalInfo.categoryBreakdown.slice(0, 3).map((category) => (
                  <div key={category.key} className="daily-widget-legend-item">
                    <span
                      className="daily-widget-legend-dot"
                      style={{ background: category.color }}
                    />
                    <span className="daily-widget-legend-label">{category.label}</span>
                    <strong className="daily-widget-legend-value">
                      {category.value} kg
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Snelle acties</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: quickActionCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeQuickActionIndex ? " active" : ""}`}
            />
          ))}
        </div>

        <div
          ref={quickActionsRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare snelle acties"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveQuickActionIndex)
          }
        >
          <section className="calculator-card home-questionnaire-card home-quick-card home-widget-rail-card home-quick-placeholder-card">
            <div className="home-questionnaire-top">
              <div>
                <p className="section-label dark">Activiteit</p>
                <h2 className="calculator-title home-quick-title">Activiteit toevoegen</h2>
              </div>
            </div>

            <div className="home-quick-plus-wrap">
              <span className="home-questionnaire-status home-quick-plus done">
                <FiPlus />
              </span>
            </div>

            <p className="calculator-text home-quick-text">
              {customActivityTotals.entries.length > 0
                ? `${customActivityTotals.entries.length} extra activiteiten deze week`
                : "Voeg extra uitstoot of duurzame acties toe"}
            </p>

            <button
              type="button"
              className="goal-edit-button home-quick-button"
              onClick={() => navigate("/activiteit-toevoegen")}
            >
              Open
            </button>
          </section>

          <section className="calculator-card home-questionnaire-card home-quick-card home-widget-rail-card">
            <div className="home-questionnaire-top">
              <div>
                <p className="section-label dark">Wekelijkse vragenlijst</p>
                <h2 className="calculator-title home-quick-title">Vul je week in</h2>
              </div>
              <span className={`home-questionnaire-status home-quick-status${weeklyQuestionnaireDone ? " done" : ""}`}>
                {weeklyQuestionnaireDone ? <FiCheckCircle /> : <FiEdit3 />}
              </span>
          </div>

          <p className="calculator-text home-quick-text">
            Duurt max 2 minuten
          </p>

            <button
              type="button"
              className="goal-edit-button home-quick-button"
              onClick={() =>
                navigate("/weekly-questionnaire", {
                  state: { weekKey: activeCheckinWeek.weekStart },
                })
              }
            >
              Open
            </button>
          </section>

          <section className="calculator-card home-questionnaire-card home-quick-card home-widget-rail-card">
            <div className="home-questionnaire-top">
              <div>
                <p className="section-label dark">Calculator</p>
                <h2 className="calculator-title home-quick-title">Transport</h2>
              </div>
              <span className="home-questionnaire-status done home-quick-status">
                <HiOutlineCalculator />
              </span>
            </div>

            <p className="calculator-text home-quick-text">
              Bereken snel de uitstoot van jouw ritten.
            </p>

            <button
              type="button"
              className="goal-edit-button home-quick-button"
              onClick={() => navigate("/calculator")}
            >
              Open
            </button>
          </section>
        </div>
      </section>

      {false ? (
      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Jouw dashboard</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: dashboardCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeDashboardIndex ? " active" : ""}`}
            />
          ))}
        </div>

        <div
          ref={dashboardRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare widgets"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveDashboardIndex)
          }
        >
          <button
            className="info-card action-card home-action-card activity-quick-card home-widget-rail-card"
            onClick={() => navigate("/activiteiten")}
          >
            <p className="section-label dark">Activiteit</p>
            <p className="action-title">Kies je actie</p>
            <div className="activity-quick-button">
              <img
                className="activity-quick-thumb"
                src="https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=400&q=80"
                alt="Duurzame buitenactiviteit"
              />
            </div>
          </button>

          <section className="impact-widget home-progress-card home-widget-rail-card">
            <div className="impact-widget-top">
              <div>
                <p className="section-label dark">Voortgang</p>
                <h2 className="impact-widget-title">{emissionData.score}/100</h2>
              </div>
              <div className="impact-badge">Groene week</div>
            </div>

            <p className="impact-widget-text">
              Bespaard ten opzichte van je weekdoel: <strong>{savedKg} kg</strong>
            </p>

            <div className="goal-progress">
              <div
                className="goal-progress-fill"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </section>

          {false ? (
            <section className="info-card co2-widget-card home-widget-rail-card home-goal-card">
            <p className="section-label dark">Doel van deze week</p>
            <h3 className="co2-widget-value">{weeklyGoal} kg doel</h3>
            <p className="co2-widget-copy">
              {goalStatus === "Op schema"
                ? `${weeklyTargetLeft} kg ruimte over tot je persoonlijke weekdoel.`
                : `${excessKg} kg boven je doel. Tijd om bij te sturen.`}
            </p>
            <div className="goal-status-row">
              <span className={`goal-status-chip${goalStatus === "Op schema" ? " success" : ""}`}>
                {goalStatus}
              </span>
              <span className="goal-status-meta">
                {Math.round(goalProgress)}% richting weekbuffer
              </span>
            </div>
            <div className="goal-metrics-grid">
              <div className="goal-metric-card">
                <span>Dagdoel</span>
                <strong>{dailyGoal} kg</strong>
              </div>
              <div className="goal-metric-card">
                <span>Stretch</span>
                <strong>{stretchGoal} kg</strong>
              </div>
            </div>
            <button
              type="button"
              className="goal-edit-button"
              onClick={() => setIsGoalEditorOpen((current) => !current)}
            >
              {isGoalEditorOpen ? "Sluit doelen" : "Stel doel in"}
            </button>

            {isGoalEditorOpen ? (
              <div className="goal-editor">
                <label className="goal-editor-label">
                  <span>Nieuw weekdoel (kg CO₂e)</span>
                  <input
                    type="number"
                    min="40"
                    max="300"
                    step="5"
                    value={goalDraft}
                    onChange={(event) => setGoalDraft(event.target.value)}
                  />
                </label>

                <div className="goal-preset-row">
                  {[90, 120, 150].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="goal-preset-chip"
                      onClick={() => applyGoal(preset)}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="goal-save-button"
                  onClick={() => applyGoal(goalDraft)}
                >
                  Doel opslaan
                </button>
                <button
                  type="button"
                  className="goal-reset-button"
                  onClick={resetGoal}
                >
                  Reset naar standaard
                </button>
              </div>
            ) : null}
            </section>
          ) : null}

          <button
            className="info-card co2-widget-card co2-widget-link home-widget-rail-card"
            onClick={() => navigate("/overzicht")}
          >
            <div>
              <p className="section-label dark">Grootste categorie</p>
              <h3 className="co2-widget-value">{focusLabel}</h3>
              <p className="co2-widget-copy">
                Dit is nu de categorie waar je de meeste winst kunt pakken.
              </p>
            </div>
            <FiArrowRight className="co2-widget-arrow" />
          </button>
        </div>

      </section>
      ) : null}

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Grootste categorieën</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: focusCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeFocusIndex ? " active" : ""}`}
            />
          ))}
        </div>

        <div
          ref={focusRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare grootste categorie kaarten"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveFocusIndex)
          }
        >
          <section className="calculator-card home-questionnaire-card home-quick-card home-widget-rail-card home-focus-week-card">
            <div>
              <p className="section-label dark">Deze week</p>
              <h3 className="co2-widget-value">{focusLabel}</h3>
              <p className="co2-widget-copy">
                Kijk wat je volgende week anders kan doen.
              </p>
            </div>
            <button
              type="button"
              className="insight-action-button"
              onClick={() =>
                navigate("/activiteiten", {
                  state: { focusCategory: emissionData.dominantCategory },
                })
              }
            >
              Open acties
            </button>
          </section>

          <section className="calculator-card home-questionnaire-card home-quick-card home-widget-rail-card">
            <div>
              <p className="section-label dark">Deze maand</p>
              <h3 className="co2-widget-value">{monthlyFocusLabel}</h3>
              <p className="co2-widget-copy">
                Hier moet je verandering in brengen.
              </p>
            </div>
            <button
              type="button"
              className="insight-action-button"
              onClick={() =>
                navigate("/activiteiten", {
                  state: { focusCategory: monthlyFocusCategory?.key ?? null },
                })
              }
            >
              Open acties
            </button>
          </section>
        </div>
      </section>

      <section className="tip-card home-tip-card">
        <p className="section-label dark">Tips</p>
        <button
          type="button"
          className="home-tip-image-button"
          onClick={() => navigate("/tips")}
          aria-label="Open tips pagina"
        >
          <img
            className="home-tip-image"
            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80"
            alt="Groen landschap als visuele tip voor minder CO2 uitstoot"
          />
          <span className="home-tip-image-badge">Bekijk tips</span>
        </button>
        <p className="tip-text">{tipOfTheDay.body}</p>
      </section>

      <section className="home-fact-card">
        <div className="home-fact-header">
          <p className="section-label dark">Feitjes</p>
          <div className="home-fact-status">
            <span
              className="home-fact-timer"
              style={{ "--fact-progress": `${factTimerProgress}%` }}
              aria-hidden="true"
            />
            <span className="home-fact-counter">
              {activeFactIndex + 1}/{facts.length}
            </span>
          </div>
        </div>
        <p className="home-fact-text">{facts[activeFactIndex]}</p>
      </section>

  </MobilePageShell>
  )
}

export default Home
