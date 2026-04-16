import { useMemo, useState } from "react"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { HiOutlineCalculator } from "react-icons/hi"

const EMISSION_FACTORS = {
  auto: 0.124,
  trein: 0.014,
  bus: 0.014,
  tram: 0.014,
  metro: 0.014,
  anderOv: 0.014,
}

const FLIGHT_EMISSION_FACTORS = {
  shortHaul: 0.234,
  mediumHaul: 0.172,
  longHaul: 0.157,
}

const POPULAR_DESTINATIONS_KM = {
  // Europa (kort / midden)
  Londen: 350,
  Parijs: 500,
  Berlijn: 600,
  Barcelona: 1500,
  Rome: 1650,
  Istanbul: 2200,

  // Middellange vluchten
  Dubai: 5200,
  "New York": 5900,
  Kaapstad: 9600,

  // Lange vluchten
  "Bangkok (Thailand)": 9000,
  "Bali (Indonesië)": 12000,
  "Tokio (Japan)": 9300,
  "Sydney (Australië)": 16500,
  "Los Angeles": 8800,
}

const transportOptions = [
  {
    id: "vliegtuig",
    label: "Vliegtuig",
    note: "Vliegtuig gebruikt een factor op basis van de vliegafstand per persoon.",
  },
  {
    id: "auto",
    label: "Auto",
    note: "Auto gebruikt hier de benzinefactor uit de hoofdvragenlijst.",
  },
  {
    id: "trein",
    label: "Trein",
    note: "Trein is een aparte categorie binnen het vervoersmodel.",
  },
  {
    id: "anderOv",
    label: "Ander OV",
    note: "Ander OV gebruikt dezelfde factor als bus, tram en metro.",
  },
]

function getFlightEmissionFactor(distanceKm) {
  if (distanceKm < 700) {
    return FLIGHT_EMISSION_FACTORS.shortHaul
  }

  if (distanceKm <= 2500) {
    return FLIGHT_EMISSION_FACTORS.mediumHaul
  }

  return FLIGHT_EMISSION_FACTORS.longHaul
}

function clearZeroValue(value, setValue) {
  if (Number(value) === 0) {
    setValue("")
  }
}

function restoreEmptyValue(value, setValue) {
  if (value === "") {
    setValue(0)
  }
}

function Calculator() {
  const [transportType, setTransportType] = useState("auto")
  const [distancePerTrip, setDistancePerTrip] = useState(12)
  const [tripsPerWeek, setTripsPerWeek] = useState(8)
  const [flightTripType, setFlightTripType] = useState("enkele-reis")
  const [selectedDestination, setSelectedDestination] = useState("")

  const selectedTransport =
    transportOptions.find((option) => option.id === transportType) ??
    transportOptions[0]

  const calculatorResult = useMemo(() => {
    const tripDistance = Number(distancePerTrip)
    const tripMultiplier =
      transportType === "vliegtuig" && flightTripType === "retour" ? 2 : 1
    const tripCount = transportType === "vliegtuig" ? 1 : Number(tripsPerWeek)
    const weeklyDistance = tripDistance * tripMultiplier * tripCount
    // Flights use distance bands instead of one fixed factor.
    const emissionFactor =
      transportType === "vliegtuig"
        ? getFlightEmissionFactor(tripDistance)
        : EMISSION_FACTORS[transportType] ?? 0
    const weeklyEmission = Number((weeklyDistance * emissionFactor).toFixed(2))
    const monthlyEmission = Number((weeklyEmission * 4.33).toFixed(2))
    const yearlyEmission = Number((weeklyEmission * 52).toFixed(1))

    return {
      weeklyDistance,
      weeklyEmission,
      monthlyEmission,
      yearlyEmission,
    }
  }, [distancePerTrip, flightTripType, tripsPerWeek, transportType])

  return (
    <div className="calculator-page calculator-tool-page">
      <AppHeader title="Calculator" icon={<HiOutlineCalculator />} />

      <div className="calculator-card">
        <p className="section-label dark">Slim rekenen</p>
        <h1 className="calculator-title">CO2 Calculator</h1>
        <p className="calculator-text">
          Maak een snelle berekening van je vervoer en zie hoeveel uitstoot je
          ritten ongeveer veroorzaken.
        </p>

        <div className="calculator-form">
          <label className="calculator-field">
            <span>Vervoermiddel</span>
            <select
              value={transportType}
              onChange={(event) => {
                const nextTransportType = event.target.value
                setTransportType(nextTransportType)
                setDistancePerTrip(0)
                setTripsPerWeek(0)
                setFlightTripType("enkele-reis")

                if (nextTransportType !== "vliegtuig") {
                  setSelectedDestination("")
                }
              }}
            >
              {transportOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {transportType === "vliegtuig" ? (
            <label className="calculator-field">
              <span>Populaire bestemmingen</span>
              <select
                value={selectedDestination}
                onChange={(event) => {
                  const destination = event.target.value
                  setSelectedDestination(destination)

                  if (destination in POPULAR_DESTINATIONS_KM) {
                    setDistancePerTrip(POPULAR_DESTINATIONS_KM[destination])
                  }
                }}
              >
                <option value="">Kies een bestemming</option>
                {Object.entries(POPULAR_DESTINATIONS_KM).map(
                  ([destination, distanceKm]) => (
                    <option key={destination} value={destination}>
                      {destination} ({distanceKm} km)
                    </option>
                  )
                )}
              </select>
            </label>
          ) : null}

          <label className="calculator-field">
            <span>Kilometers per rit</span>
            <input
              type="number"
              min="0"
              step={transportType === "vliegtuig" ? "150" : "1"}
              value={distancePerTrip}
              onChange={(event) => setDistancePerTrip(event.target.value)}
              onFocus={() => clearZeroValue(distancePerTrip, setDistancePerTrip)}
              onBlur={() => restoreEmptyValue(distancePerTrip, setDistancePerTrip)}
            />
          </label>

          {transportType === "vliegtuig" ? (
            <label className="calculator-field">
              <span>Type vlucht</span>
              <select
                value={flightTripType}
                onChange={(event) => setFlightTripType(event.target.value)}
              >
                <option value="enkele-reis">Enkele reis</option>
                <option value="retour">Retour</option>
              </select>
            </label>
          ) : null}

          {transportType !== "vliegtuig" ? (
            <label className="calculator-field">
              <span>Ritten per week</span>
              <input
                type="number"
                min="0"
                step="1"
                value={tripsPerWeek}
                onChange={(event) => setTripsPerWeek(event.target.value)}
                onFocus={() => clearZeroValue(tripsPerWeek, setTripsPerWeek)}
                onBlur={() => restoreEmptyValue(tripsPerWeek, setTripsPerWeek)}
              />
            </label>
          ) : null}
        </div>

        <div className="calculator-grid">
          <div className="calculator-metric">
            <span>Afstand per week</span>
            <strong>{calculatorResult.weeklyDistance} km</strong>
          </div>
          <div className="calculator-metric">
            <span>{transportType === "vliegtuig" ? "CO2 uitstoot" : "CO2 per week"}</span>
            <strong>{calculatorResult.weeklyEmission} kg CO2e</strong>
          </div>
          {transportType !== "vliegtuig" ? (
            <div className="calculator-metric">
              <span>CO2 per maand</span>
              <strong>{calculatorResult.monthlyEmission} kg CO2e</strong>
            </div>
          ) : null}
          {transportType !== "vliegtuig" ? (
            <div className="calculator-metric">
              <span>CO2 per jaar</span>
              <strong>{calculatorResult.yearlyEmission} kg CO2e</strong>
            </div>
          ) : null}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}

export default Calculator
