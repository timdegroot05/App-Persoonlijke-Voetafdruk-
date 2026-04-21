import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiCheckCircle, FiEdit3, FiMap } from "react-icons/fi"
import { HiOutlineCalculator } from "react-icons/hi"
import { LuLeaf, LuTrees, LuUtensilsCrossed } from "react-icons/lu"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
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
  isWeeklyQuestionnaireDue,
} from "../utils/questionnaireStorage"
import "../App.css"
import handFoto from "../assets/HandHandfoto.png"

function Home() {
  const navigate = useNavigate()
  const dashboardRailRef = useRef(null)
  const insightRailRef = useRef(null)
  const [activeDashboardIndex, setActiveDashboardIndex] = useState(0)
  const [activeInsightIndex, setActiveInsightIndex] = useState(0)
  const [activeFactIndex, setActiveFactIndex] = useState(0)
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = Number(localStorage.getItem("weekly-goal"))
    return Number.isFinite(savedGoal) && savedGoal > 0 ? savedGoal : 150
  })
  const [goalDraft, setGoalDraft] = useState(() => String(weeklyGoal))
  const profileAnswers = getProfileAnswers()
  const weeklyAnswers = getLatestWeeklyAnswers()
  const weeklyQuestionnaireDone = !isWeeklyQuestionnaireDue()

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

    return {
      dailyEmission: currentSnapshot.dailyEmission,
      weeklyEmission: currentSnapshot.weeklyEmission,
      score: currentSnapshot.totalScore,
      dominantCategory: currentSnapshot.dominantCategory,
    }
  }, [currentSnapshot])

  const history = useMemo(() => getImpactHistory(), [])
  const latestHistoryEntry = history[0] ?? null

  const sustainabilityTips = [
    "Eén dag per week vegetarisch eten kan je uitstoot al merkbaar verlagen.",
    "De fiets pakken voor korte ritten is vaak de duurzaamste keuze.",
    "Lokale en seizoensproducten hebben meestal een lagere impact.",
    "Korter douchen bespaart zowel water als energie.",
    "Apparaten volledig uitzetten helpt sluipverbruik te verminderen.",
  ]

  const tipOfTheDay =
    sustainabilityTips[new Date().getDate() % sustainabilityTips.length]

  const facts = [
    "Plantaardiger eten verlaagt vaak sneller je uitstoot dan je denkt.",
    "Minder korte autoritten maakt vaak direct het grootste verschil.",
    "Sluipverbruik thuis zorgt ongemerkt voor extra uitstoot.",
    "Een treinrit veroorzaakt meestal veel minder CO2 dan dezelfde rit met de auto.",
    "Goed isoleren thuis verlaagt niet alleen je energierekening maar ook je uitstoot.",
    "Korte vluchten hebben per kilometer vaak een relatief hoge klimaatimpact.",
  ]
  const forestPhotoCards = [
    {
      src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
      alt: "Groen bos als visualisatie van natuurlijke groei",
    },
    {
      src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80",
      alt: "Jonge planten die duurzame groei verbeelden",
    },
    {
      src: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80",
      alt: "Natuurlijke omgeving als rustige duurzame visual",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      alt: "Bosrand als teken van duurzame vooruitgang",
    },
    {
      src: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=900&q=80",
      alt: "Boomkruinen die een groeiend bos laten zien",
    },
  ]
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
      8,
      Math.round((savedKg / weeklyGoal) * 100)
    )
  )

  const dailyCategoryBreakdown = useMemo(() => {
    const categoryLabels = {
      voeding: "Voeding",
      transport: "Vervoer",
      energie: "Energie",
      wonen: "Wonen",
    }

    const categoryColors = {
      voeding: "#8bcf91",
      transport: "#3e8f55",
      energie: "#b7d96d",
      wonen: "#6fb8a0",
    }

    const categories = currentSnapshot?.categories
    const totalCategoryValue = categories
      ? Object.values(categories).reduce((sum, value) => sum + value, 0)
      : 0

    const fallback = [
      { key: "transport", label: "Vervoer", value: 4.6, share: 38, color: "#3e8f55" },
      { key: "energie", label: "Energie", value: 3.2, share: 26, color: "#b7d96d" },
      { key: "voeding", label: "Voeding", value: 2.7, share: 22, color: "#8bcf91" },
      { key: "wonen", label: "Wonen", value: 1.9, share: 14, color: "#6fb8a0" },
    ]

    if (!categories || totalCategoryValue <= 0) {
      return fallback
    }

    return Object.entries(categories)
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
          value: dailyValue,
          share,
          color: categoryColors[key] || "#8bcf91",
        }
      })
      .sort((a, b) => b.share - a.share)
  }, [currentSnapshot, emissionData.dailyEmission])

  const weeklyCategoryBreakdown = useMemo(
    () =>
      dailyCategoryBreakdown.map((category) => ({
        ...category,
        value: Number((category.value * 7).toFixed(1)),
      })),
    [dailyCategoryBreakdown]
  )

  const weeklyTargetLeft = Math.max(
    0,
    Number((weeklyGoal - emissionData.weeklyEmission).toFixed(1))
  )

  const forestTrees = Math.min(
    5,
    Math.max(1, Math.round((savedKg / weeklyGoal) * 5))
  )
  const forestHealthLabel =
    forestTrees >= 4 ? "Sterke groei" : forestTrees >= 2 ? "Rustige groei" : "Startgroei"
  const forestFocusMeaning =
    forestHealthLabel === "Sterke groei"
      ? "Je uitstoot blijft ruim onder je weekdoel, dus je bos groeit zichtbaar voller."
      : forestHealthLabel === "Rustige groei"
        ? "Je zit op de goede weg. Met een paar slimme keuzes kan je bos nog dichter worden."
        : "Je zit nog dicht bij je weekdoel. Kleine besparingen zorgen hier voor de eerste groei."
  const kgPerTree = Math.max(1, Math.round(weeklyGoal / 5))
  const nextTreeThreshold = Math.max(0, forestTrees * kgPerTree - savedKg)
  const forestStepProgress =
    forestTrees >= 5
      ? 100
      : Math.min(
          100,
          Math.max(
            10,
            Math.round(((savedKg % kgPerTree) / kgPerTree) * 100)
          )
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
  const focusCategoryData = dailyCategoryBreakdown[0]
  const secondaryCategoryData = dailyCategoryBreakdown[1]
  const forestLevels = [
    { name: "Zaailing", badge: "Beginfase" },
    { name: "Groeipad", badge: "In opbouw" },
    { name: "Groene zone", badge: "Sterker ritme" },
    { name: "Mini-bos", badge: "Goede week" },
    { name: "Vol bos", badge: "Topprestatie" },
  ]
  const forestLevel = forestLevels[forestTrees - 1]
  const nextUnlockLabel =
    forestTrees >= 5
      ? "Je hoogste bosniveau is bereikt."
      : `Nog ${nextTreeThreshold} kg winst tot ${forestLevels[forestTrees].name}.`
  const nextBestAction =
    focusLabel === "Vervoer"
      ? "Vervang deze week 1 korte autorit door fiets of OV."
      : focusLabel === "Voeding"
        ? "Plan deze week 2 plantaardige maaltijden."
        : focusLabel === "Energie"
          ? "Check thuis 1 apparaat op sluipverbruik."
          : "Kies deze week 1 concrete besparing voor thuis."
  const challengeByFocus = {
    Vervoer: {
      title: "Autovrije sprint",
      body: "Laat deze week 1 korte autorit staan en kies fiets of lopen.",
      reward: "+12 groeipunten",
      action: () => navigate("/activiteiten"),
      button: "Start challenge",
    },
    Voeding: {
      title: "Groene maaltijd",
      body: "Kies vandaag een plantaardige lunch of diner.",
      reward: "+10 groeipunten",
      action: () => navigate("/tips"),
      button: "Bekijk tips",
    },
    Energie: {
      title: "Slim verbruik",
      body: "Schakel vanavond 1 apparaat volledig uit en voorkom sluipverbruik.",
      reward: "+8 groeipunten",
      action: () => navigate("/activiteiten"),
      button: "Doe mee",
    },
    Wonen: {
      title: "Thuischeck",
      body: "Kies 1 kleine thuisactie om je verbruik direct te verlagen.",
      reward: "+8 groeipunten",
      action: () => navigate("/activiteiten"),
      button: "Open acties",
    },
  }
  const activeChallenge = challengeByFocus[focusLabel] || challengeByFocus.Energie
  const achievements = [
    {
      title: "Trend Tracker",
      status: history.length >= 2 ? "Ontgrendeld" : "Bijna vrij",
      progress: Math.min(100, history.length * 50),
    },
    {
      title: "Doelbewaker",
      status: goalStatus === "Op schema" ? "Actief" : "Inhalen",
      progress: goalStatus === "Op schema" ? 100 : Math.max(20, 100 - Math.round((excessKg / weeklyGoal) * 100)),
    },
    {
      title: "Bosbouwer",
      status: forestTrees >= 3 ? "Sterk" : "Groeit",
      progress: Math.min(100, forestTrees * 20),
    },
  ]
  const ecoPoints = Math.max(
    40,
    Math.round(emissionData.score * 2 + savedKg * 3 + history.length * 8)
  )
  const ecoLevel = Math.max(1, Math.floor(ecoPoints / 120) + 1)
  const pointsIntoLevel = ecoPoints % 120
  const pointsToNextLevel = 120 - pointsIntoLevel
  const ecoLevelProgress = Math.max(8, Math.round((pointsIntoLevel / 120) * 100))
  const greenStreak = Math.max(
    1,
    history.reduce((count, entry) => {
      if (entry.weeklyEmission <= weeklyGoal) {
        return count + 1
      }
      return count
    }, emissionData.weeklyEmission <= weeklyGoal ? 1 : 0)
  )
  const weekRhythm = [
    { day: "M", active: emissionData.dailyEmission <= dailyGoal },
    { day: "D", active: emissionData.score >= 55 },
    { day: "W", active: savedKg >= 5 },
    { day: "D", active: history.length >= 1 },
    { day: "V", active: forestTrees >= 2 },
    { day: "Z", active: goalStatus === "Op schema" },
    { day: "Z", active: greenStreak >= 2 },
  ]
  const dailyQuests = [
    {
      title: "Korte rit overslaan",
      detail: "Vervang vandaag 1 korte rit door lopen of fietsen.",
      points: 6,
      done: focusLabel !== "Vervoer" || savedKg >= 5,
    },
    {
      title: "Slimme energiekeuze",
      detail: "Zet 1 apparaat volledig uit voor de nacht.",
      points: 4,
      done: emissionData.score >= 60,
    },
    {
      title: "Groene maaltijd",
      detail: "Kies vandaag 1 plantaardige maaltijd.",
      points: 5,
      done: focusLabel !== "Voeding" || history.length >= 1,
    },
  ]
  const categoryBadges = [
    {
      title: "Vervoer badge",
      category: "Vervoer",
      unlocked: dailyCategoryBreakdown.find((item) => item.key === "transport")?.value <= 4.5,
    },
    {
      title: "Voeding badge",
      category: "Voeding",
      unlocked: dailyCategoryBreakdown.find((item) => item.key === "voeding")?.value <= 3,
    },
    {
      title: "Energie badge",
      category: "Energie",
      unlocked: dailyCategoryBreakdown.find((item) => item.key === "energie")?.value <= 3.5,
    },
  ]

  const dashboardCardsCount = 5
  const insightCardsCount = 3

  const updateActiveIndex = (element, setter) => {
    if (!element) {
      return
    }

    const firstCard = element.querySelector(".home-widget-rail-card")
    if (!firstCard) {
      return
    }

    const cardWidth = firstCard.getBoundingClientRect().width + 14
    const index = Math.round(element.scrollLeft / cardWidth)
    setter(index)
  }

  useEffect(() => {
    if (!hasCompletedProfileQuestionnaire()) {
      navigate("/questionnaire")
    }
  }, [navigate])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveFactIndex((currentIndex) => (currentIndex + 1) % facts.length)
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [facts.length])

  useEffect(() => {
    localStorage.setItem("weekly-goal", String(weeklyGoal))
  }, [weeklyGoal])

  useEffect(() => {
    setGoalDraft(String(weeklyGoal))
  }, [weeklyGoal])

  const applyGoal = (value) => {
    const nextGoal = Math.min(300, Math.max(40, Number(value)))
    if (!Number.isFinite(nextGoal)) {
      return
    }

    setWeeklyGoal(nextGoal)
    setIsGoalEditorOpen(false)
  }

  const resetGoal = () => {
    setWeeklyGoal(150)
    setGoalDraft("150")
    setIsGoalEditorOpen(false)
  }

  return (
  <div className="home-page">
    <AppHeader title="Impact" icon={<LuLeaf />} />

    <div className="home-content">
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
        <div className="home-feature-header">
          <p className="section-label dark">Bos overzicht</p>
          <div className="home-feature-icon">
            <LuTrees />
          </div>
        </div>

        <div className="home-feature-visual" aria-hidden="true">
          {forestPhotoCards.slice(0, forestTrees).map((photo) => (
            <img
              key={photo.src}
              className="home-feature-photo"
              src={photo.src}
              alt={photo.alt}
            />
          ))}
        </div>

        <div className="home-feature-stats">
          <div className="home-feature-stat">
            <span>Groei</span>
            <strong>{forestTrees} bomen</strong>
          </div>
          <div className="home-feature-stat">
            <span>Focus</span>
            <strong>{forestHealthLabel}</strong>
          </div>
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

        <p className="home-feature-note">
          1 boom staat hier voor ongeveer {kgPerTree} kg ruimte onder je weekdoel.
          {" "}
          {nextUnlockLabel}
        </p>

        <p className="home-feature-note emphasis">
          Focus betekent hier hoe gezond je bos nu groeit: {forestFocusMeaning}
        </p>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Jouw level</p>
          <span className="home-rail-hint">Progress</span>
        </div>

        <section className="level-card">
          <div className="level-card-top">
            <div>
              <p className="section-label dark">Eco level</p>
              <h3 className="level-title">Level {ecoLevel}</h3>
            </div>
            <div className="level-points-badge">{ecoPoints} XP</div>
          </div>

          <div className="level-progress">
            <div
              className="level-progress-fill"
              style={{ width: `${ecoLevelProgress}%` }}
            />
          </div>

          <div className="level-stats-row">
            <div className="level-stat-box">
              <span>Streak</span>
              <strong>{greenStreak} weken</strong>
            </div>
            <div className="level-stat-box">
              <span>Volgend level</span>
              <strong>{pointsToNextLevel} XP</strong>
            </div>
          </div>

          <div className="week-rhythm">
            {weekRhythm.map((item, index) => (
              <span
                key={`${item.day}-${index}`}
                className={`week-rhythm-day${item.active ? " active" : ""}`}
              >
                {item.day}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="level-profile-button"
            onClick={() => navigate("/profile")}
          >
            Open profiel
          </button>
        </section>
      </section>

      <section className="emission-hero home-week-card">
        <p className="section-label dark">Wekelijkse uitstoot</p>
        <div className="home-week-panel">
          <h2 className="hero-number weekly-widget-number">
            {emissionData.weeklyEmission} kg CO₂e
          </h2>
          <p className="weekly-widget-subtitle">
            Gebaseerd op de verdeling uit je laatste vragenlijst
          </p>
          <div className="weekly-widget-chart" aria-hidden="true">
            {weeklyCategoryBreakdown.map((category) => (
              <span
                key={category.key}
                className="weekly-widget-segment"
                style={{
                  width: `${category.share}%`,
                  background: category.color,
                }}
              />
            ))}
          </div>
          <div className="weekly-widget-legend">
            {weeklyCategoryBreakdown.slice(0, 3).map((category) => (
              <div key={category.key} className="weekly-widget-legend-item">
                <span
                  className="weekly-widget-legend-dot"
                  style={{ background: category.color }}
                />
                <span className="weekly-widget-legend-label">{category.label}</span>
                <strong className="weekly-widget-legend-value">
                  {category.value} kg
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="calculator-card home-questionnaire-card">
        <div className="home-questionnaire-top">
          <div>
            <p className="section-label dark">Wekelijkse vragenlijst</p>
            <h2 className="calculator-title">Vul je week in</h2>
          </div>
          <span className={`home-questionnaire-status${weeklyQuestionnaireDone ? " done" : ""}`}>
            {weeklyQuestionnaireDone ? <FiCheckCircle /> : <FiEdit3 />}
            {weeklyQuestionnaireDone ? "Ingevuld" : "Nog niet ingevuld"}
          </span>
        </div>

        <p className="calculator-text">
          {weeklyQuestionnaireDone
            ? "Je kunt je antwoorden van deze week bekijken en aanpassen."
            : "Je hebt deze week nog geen vragenlijst ingevuld."}
        </p>

        <button
          type="button"
          className="goal-edit-button"
          onClick={() => navigate("/weekly-questionnaire")}
        >
          {weeklyQuestionnaireDone ? "Bewerk wekelijkse vragen" : "Open wekelijkse vragenlijst"}
        </button>
      </section>

      <section className="calculator-card home-questionnaire-card">
        <div className="home-questionnaire-top">
          <div>
            <p className="section-label dark">Calculator</p>
            <h2 className="calculator-title">Reken je vervoer door</h2>
          </div>
          <span className="home-questionnaire-status done">
            <HiOutlineCalculator />
            Openen
          </span>
        </div>

        <p className="calculator-text">
          Maak een snelle berekening van je ritten en zie hoeveel uitstoot je
          vervoer ongeveer veroorzaakt.
        </p>

        <button
          type="button"
          className="goal-edit-button"
          onClick={() => navigate("/calculator")}
        >
          Open calculator
        </button>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Jouw dashboard</p>
          <span className="home-rail-hint">Swipe</span>
        </div>

        <div
          ref={dashboardRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare widgets"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveDashboardIndex)
          }
        >
          <div className="info-card compact daily-widget-card home-widget-rail-card">
            <div className="daily-widget-top">
              <div>
                <p className="section-label dark">Dagelijkse uitstoot</p>
                <p className="compact-number">{emissionData.dailyEmission} kg CO₂e</p>
                <p className="daily-widget-subtitle">
                  Verdeling op basis van je laatste vragenlijst
                </p>
              </div>

              <button
                type="button"
                className="daily-widget-icon daily-widget-link"
                onClick={() => navigate("/calculator")}
                aria-label="Ga naar calculator"
              >
                <HiOutlineCalculator />
              </button>
            </div>

            <div className="daily-widget-bottom">
              <div className="daily-widget-chart" aria-hidden="true">
                {dailyCategoryBreakdown.map((category) => (
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
                    <span className="daily-widget-legend-label">
                      {category.label}
                    </span>
                    <strong className="daily-widget-legend-value">
                      {category.value} kg
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

          <section className="info-card co2-widget-card home-widget-rail-card">
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

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: dashboardCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeDashboardIndex ? " active" : ""}`}
            />
          ))}
        </div>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Snelle inzichten</p>
          <span className="home-rail-hint">Meer</span>
        </div>

        <div
          ref={insightRailRef}
          className="home-widget-rail"
          aria-label="Horizontaal scrollbare inzichten"
          onScroll={(event) =>
            updateActiveIndex(event.currentTarget, setActiveInsightIndex)
          }
        >
          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <FiMap />
            </div>
            <p className="section-label dark">Prioriteit</p>
            <h3 className="co2-widget-value">{focusLabel}</h3>
            <p className="co2-widget-copy">
              {nextBestAction}
            </p>
            <div className="insight-meta-row">
              <span>Grootste deel</span>
              <strong>{focusCategoryData?.value ?? 0} kg/dag</strong>
            </div>
            <button
              type="button"
              className="insight-action-button"
              onClick={() => navigate("/activiteiten")}
            >
              Open acties
            </button>
          </section>

          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <LuUtensilsCrossed />
            </div>
            <p className="section-label dark">Volgende winst</p>
            <h3 className="co2-widget-value">
              {weeklyTargetLeft > 0 ? `${weeklyTargetLeft} kg marge` : "Doel geraakt"}
            </h3>
            <p className="co2-widget-copy">
              {weeklyTargetLeft > 0
                ? `Je hebt nog ruimte binnen je doel. ${secondaryCategoryData?.label ?? "Je tweede categorie"} is nu je beste extra kans.`
                : `${personalInsight.body}`}
            </p>
            <div className="insight-meta-row">
              <span>Volgende focus</span>
              <strong>{secondaryCategoryData?.label ?? focusLabel}</strong>
            </div>
            <button
              type="button"
              className="insight-action-button"
              onClick={() => navigate("/calculator")}
            >
              Reken door
            </button>
          </section>

          <section className="info-card insight-widget-card home-widget-rail-card">
            <div className="insight-widget-icon">
              <HiOutlineCalculator />
            </div>
            <p className="section-label dark">Trend</p>
            <h3 className="co2-widget-value">
              {historyDelta === null
                ? "Nog geen trend"
                : historyDelta <= 0
                  ? `${Math.abs(historyDelta)} kg lager`
                  : `${historyDelta} kg hoger`}
            </h3>
            <p className="co2-widget-copy">
              {historyDelta === null
                ? "Vul de vragenlijst nog eens in om je voortgang te kunnen vergelijken."
                : "Vergelijking met je laatst opgeslagen meting uit je historie."}
            </p>
            <div className="insight-meta-row">
              <span>Historie</span>
              <strong>{history.length} metingen</strong>
            </div>
            <button
              type="button"
              className="insight-action-button"
              onClick={() => navigate("/tips")}
            >
              Bekijk tips
            </button>
          </section>
        </div>

        <div className="home-rail-dots" aria-hidden="true">
          {Array.from({ length: insightCardsCount }).map((_, index) => (
            <span
              key={index}
              className={`home-rail-dot${index === activeInsightIndex ? " active" : ""}`}
            />
          ))}
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
        <p className="tip-text">{tipOfTheDay}</p>
      </section>

      <section className="home-fact-card">
        <div className="home-fact-header">
          <p className="section-label dark">Feitjes</p>
          <span className="home-fact-counter">
            {activeFactIndex + 1}/{facts.length}
          </span>
        </div>
        <p className="home-fact-text">{facts[activeFactIndex]}</p>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Challenges</p>
          <span className="home-rail-hint">Level up</span>
        </div>

        <section className="challenge-card">
          <div className="challenge-card-top">
            <div>
              <p className="section-label dark">Actieve missie</p>
              <h3 className="challenge-title">{activeChallenge.title}</h3>
            </div>
            <span className="challenge-reward">{activeChallenge.reward}</span>
          </div>
          <p className="challenge-copy">{activeChallenge.body}</p>
          <button
            type="button"
            className="challenge-button"
            onClick={activeChallenge.action}
          >
            {activeChallenge.button}
          </button>
        </section>

        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <article key={achievement.title} className="achievement-card">
              <p className="section-label dark">Badge</p>
              <h3>{achievement.title}</h3>
              <div className="achievement-status-row">
                <span>{achievement.status}</span>
                <strong>{achievement.progress}%</strong>
              </div>
              <div className="achievement-progress">
                <div
                  className="achievement-progress-fill"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-widget-rail-section">
        <div className="home-rail-header">
          <p className="section-label dark">Daily quests</p>
          <span className="home-rail-hint">Vandaag</span>
        </div>

        <div className="daily-quest-grid">
          {dailyQuests.map((quest) => (
            <article key={quest.title} className="daily-quest-card">
              <div className="daily-quest-top">
                <h3>{quest.title}</h3>
                <span className={`daily-quest-points${quest.done ? " done" : ""}`}>
                  +{quest.points}
                </span>
              </div>
              <p>{quest.detail}</p>
              <div className={`daily-quest-status${quest.done ? " done" : ""}`}>
                {quest.done ? "Voltooid" : "Open"}
              </div>
            </article>
          ))}
        </div>

        <div className="badge-row">
          {categoryBadges.map((badge) => (
            <article key={badge.title} className={`category-badge-card${badge.unlocked ? " unlocked" : ""}`}>
              <span>{badge.category}</span>
              <strong>{badge.unlocked ? "Badge vrij" : "Bijna vrij"}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>

      <BottomNav />
    </div>
  )
}

export default Home
