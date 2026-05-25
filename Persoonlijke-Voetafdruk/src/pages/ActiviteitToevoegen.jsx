import { useMemo, useState } from "react"
import { FiPlusCircle, FiTrash2 } from "react-icons/fi"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { ACTIVITY_SECTIONS } from "../data/activityCatalog"
import {
  addCustomActivity,
  createCustomActivityEntry,
  getCustomActivitiesForWeek,
  getCustomActivityTotals,
  removeCustomActivity,
} from "../utils/customActivities"
import { getWeeklyCheckinWeekInfo, formatWeekRangeLabel } from "../utils/weeklyResults"

const POPULAR_DESTINATIONS_KM = {
  Londen: 350,
  Parijs: 500,
  Berlijn: 600,
  Barcelona: 1500,
  Rome: 1650,
  Istanbul: 2200,
  Dubai: 5200,
  "New York": 5900,
  Kaapstad: 9600,
  "Bangkok (Thailand)": 9000,
  "Bali (Indonesie)": 12000,
  "Tokio (Japan)": 9300,
  "Sydney (Australie)": 16500,
  "Los Angeles": 8800,
}

function getFlightItemIdForDistance(distanceKm) {
  if (distanceKm < 700) {
    return "korte-vlucht"
  }

  if (distanceKm <= 2500) {
    return "middellange-vlucht"
  }

  return "lange-vlucht"
}

function ActiviteitToevoegen() {
  const activeWeekInfo = useMemo(() => getWeeklyCheckinWeekInfo(), [])
  const [activeSectionId, setActiveSectionId] = useState(ACTIVITY_SECTIONS[0].id)
  const [selectedItemId, setSelectedItemId] = useState(ACTIVITY_SECTIONS[0].items[0].id)
  const [flightTripType, setFlightTripType] = useState("enkele-reis")
  const [selectedDestination, setSelectedDestination] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [activityEntries, setActivityEntries] = useState(() =>
    getCustomActivitiesForWeek(activeWeekInfo.weekStart)
  )

  const activeSection = useMemo(
    () =>
      ACTIVITY_SECTIONS.find((section) => section.id === activeSectionId) ||
      ACTIVITY_SECTIONS[0],
    [activeSectionId]
  )

  const isFlightSection = activeSection.id === "vluchten"

  const selectedFlightItemId = useMemo(() => {
    const normalizedQuantity = Number(quantity)

    if (!isFlightSection || !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return activeSection.items[0].id
    }

    return getFlightItemIdForDistance(normalizedQuantity)
  }, [activeSection.items, isFlightSection, quantity])

  const selectedItem = useMemo(
    () =>
      activeSection.items.find((item) =>
        item.id === (isFlightSection ? selectedFlightItemId : selectedItemId)
      ) ||
      activeSection.items[0],
    [activeSection, isFlightSection, selectedFlightItemId, selectedItemId]
  )

  const weekTotals = useMemo(
    () => getCustomActivityTotals(activeWeekInfo.weekStart),
    [activityEntries, activeWeekInfo.weekStart]
  )

  const tripMultiplier = isFlightSection && flightTripType === "retour" ? 2 : 1

  const emissionPreview = useMemo(() => {
    const normalizedQuantity = Number(quantity)

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return 0
    }

    return Number(
      (normalizedQuantity * tripMultiplier * selectedItem.emissionFactor).toFixed(2)
    )
  }, [quantity, selectedItem, tripMultiplier])

  const handleSectionChange = (sectionId) => {
    const nextSection =
      ACTIVITY_SECTIONS.find((section) => section.id === sectionId) ||
      ACTIVITY_SECTIONS[0]

    setActiveSectionId(nextSection.id)
    setSelectedItemId(nextSection.items[0].id)
    setFlightTripType("enkele-reis")
    setSelectedDestination("")
    setQuantity("1")
    setFeedbackMessage("")
  }

  const handleAddActivity = () => {
    const normalizedQuantity = Number(quantity)

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      setFeedbackMessage("Vul een geldige hoeveelheid in.")
      return
    }

    const entry = createCustomActivityEntry(
      {
        ...selectedItem,
        sectionId: activeSection.id,
        sectionLabel: activeSection.label,
      },
      normalizedQuantity,
      activeWeekInfo.weekStart,
      {
        destination: isFlightSection ? selectedDestination : "",
        tripType: isFlightSection ? flightTripType : null,
        multiplier: tripMultiplier,
      }
    )

    addCustomActivity(entry)
    setActivityEntries(getCustomActivitiesForWeek(activeWeekInfo.weekStart))
    setQuantity("1")
    setFeedbackMessage(`${entry.emission} kg CO2e toegevoegd aan deze week.`)
  }

  const handleRemoveActivity = (activityId) => {
    removeCustomActivity(activityId)
    setActivityEntries(getCustomActivitiesForWeek(activeWeekInfo.weekStart))
  }

  return (
    <div className="calculator-page activity-entry-page">
      <AppHeader title="Activiteit toevoegen" icon={<FiPlusCircle />} />

      <div className="tips-content activity-entry-content">
        <section className="calculator-card">
          <p className="section-label dark">Invullen</p>
          <h1 className="calculator-title">Voeg iets extra's toe</h1>
          <p className="calculator-text">
            {formatWeekRangeLabel(activeWeekInfo.weekStart, activeWeekInfo.weekEnd)}
          </p>

          <div className="activity-form-grid">
            <label className="goal-editor-label" htmlFor="activity-section">
              <span>Categorie</span>
              <select
                id="activity-section"
                value={activeSectionId}
                onChange={(event) => handleSectionChange(event.target.value)}
              >
                {ACTIVITY_SECTIONS.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
            </label>

            {!isFlightSection ? (
              <label className="goal-editor-label" htmlFor="activity-item">
                <span>Activiteit</span>
                <select
                  id="activity-item"
                  value={selectedItemId}
                  onChange={(event) => {
                    setSelectedItemId(event.target.value)
                    setFeedbackMessage("")
                  }}
                >
                  {activeSection.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {isFlightSection ? (
            <label className="goal-editor-label" htmlFor="flight-destination">
              <span>Populaire bestemmingen</span>
              <select
                id="flight-destination"
                value={selectedDestination}
                onChange={(event) => {
                  const destination = event.target.value
                  setSelectedDestination(destination)
                  setFeedbackMessage("")

                  if (destination in POPULAR_DESTINATIONS_KM) {
                    const distanceKm = POPULAR_DESTINATIONS_KM[destination]
                    setQuantity(String(distanceKm))
                    setSelectedItemId(getFlightItemIdForDistance(distanceKm))
                  }
                }}
              >
                <option value="">Kies een bestemming</option>
                {Object.entries(POPULAR_DESTINATIONS_KM).map(([destination, distanceKm]) => (
                  <option key={destination} value={destination}>
                    {destination} ({distanceKm} km)
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="goal-editor-label" htmlFor="activity-quantity">
            <span>Hoeveelheid in {selectedItem.unit}</span>
            <input
              id="activity-quantity"
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                if (feedbackMessage) {
                  setFeedbackMessage("")
                }
              }}
            />
          </label>

          {isFlightSection ? (
            <label className="goal-editor-label" htmlFor="flight-trip-type">
              <span>Type vlucht</span>
              <select
                id="flight-trip-type"
                value={flightTripType}
                onChange={(event) => {
                  setFlightTripType(event.target.value)
                  setFeedbackMessage("")
                }}
              >
                <option value="enkele-reis">Enkele reis</option>
                <option value="retour">Retour</option>
              </select>
            </label>
          ) : null}

          <div className="activity-preview-card">
            <span>Uitstootpreview</span>
            <strong>{emissionPreview} kg CO2e</strong>
            <p>{`${selectedItem.label} met ${selectedItem.emissionFactor} kg CO2e per ${selectedItem.unit}.`}</p>
            {selectedItem.examples ? (
              <p className="activity-preview-note">Voorbeelden: {selectedItem.examples}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="goal-save-button activity-add-button"
            onClick={handleAddActivity}
          >
            Voeg activiteit toe
          </button>

          {feedbackMessage ? (
            <p className="profile-name-message">{feedbackMessage}</p>
          ) : null}
        </section>

        <section className="calculator-card">
          <p className="section-label dark">Deze week toegevoegd</p>

          {activityEntries.length > 0 ? (
            <div className="activity-history-list">
              {activityEntries.map((entry) => (
                <article key={entry.id} className="activity-history-card">
                  <div>
                    <strong>{entry.label}</strong>
                    <p>
                      {entry.tripType === "retour"
                        ? `${entry.quantity} ${entry.unit} retour · ${entry.emission} kg CO2e`
                        : `${entry.quantity} ${entry.unit} · ${entry.emission} kg CO2e`}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="activity-remove-button"
                    onClick={() => handleRemoveActivity(entry.id)}
                    aria-label={`Verwijder ${entry.label}`}
                  >
                    <FiTrash2 />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="calculator-text">Nog geen extra activiteiten toegevoegd.</p>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default ActiviteitToevoegen
