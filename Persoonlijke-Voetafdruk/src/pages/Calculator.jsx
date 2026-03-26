import { useMemo, useState } from "react"
import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { HiOutlineCalculator } from "react-icons/hi"

const transportOptions = [
  {
    id: "car",
    label: "Auto",
    factor: 0.192,
    note: "Gemiddelde benzineauto per kilometer",
  },
  {
    id: "bus",
    label: "Bus / OV",
    factor: 0.105,
    note: "Gedeelde uitstoot per reizigerskilometer",
  },
  {
    id: "train",
    label: "Trein",
    factor: 0.041,
    note: "Lager door efficiënter openbaar vervoer",
  },
  {
    id: "bike",
    label: "Fiets",
    factor: 0.005,
    note: "Bijna geen directe uitstoot",
  },
]

function Calculator() {
  const [transportType, setTransportType] = useState("car")
  const [distancePerTrip, setDistancePerTrip] = useState(12)
  const [tripsPerWeek, setTripsPerWeek] = useState(8)

  const selectedTransport =
    transportOptions.find((option) => option.id === transportType) ??
    transportOptions[0]

  const calculatorResult = useMemo(() => {
    const weeklyDistance = Number(distancePerTrip) * Number(tripsPerWeek)
    const weeklyEmission = Number(
      (weeklyDistance * selectedTransport.factor).toFixed(2)
    )
    const monthlyEmission = Number((weeklyEmission * 4.33).toFixed(2))
    const yearlyEmission = Number((weeklyEmission * 52).toFixed(1))

    return {
      weeklyDistance,
      weeklyEmission,
      monthlyEmission,
      yearlyEmission,
    }
  }, [distancePerTrip, tripsPerWeek, selectedTransport])

  return (
    <div className="calculator-page">
      <AppHeader title="Calculator" icon={<HiOutlineCalculator />} />

      <div className="calculator-card">
        <p className="section-label dark">Slim rekenen</p>
        <h1 className="calculator-title">CO2 Calculator</h1>
        <p className="calculator-text">
          Maak een snelle mockup-berekening van je vervoer en zie hoeveel
          uitstoot je ritten ongeveer veroorzaken.
        </p>

        <div className="calculator-highlight">
          <span>Mockup aanname</span>
          <strong>{selectedTransport.note}</strong>
        </div>

        <div className="calculator-form">
          <label className="calculator-field">
            <span>Vervoermiddel</span>
            <select
              value={transportType}
              onChange={(event) => setTransportType(event.target.value)}
            >
              {transportOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="calculator-field">
            <span>Kilometers per rit</span>
            <input
              type="number"
              min="0"
              step="1"
              value={distancePerTrip}
              onChange={(event) => setDistancePerTrip(event.target.value)}
            />
          </label>

          <label className="calculator-field">
            <span>Ritten per week</span>
            <input
              type="number"
              min="0"
              step="1"
              value={tripsPerWeek}
              onChange={(event) => setTripsPerWeek(event.target.value)}
            />
          </label>
        </div>

        <div className="calculator-grid">
          <div className="calculator-metric">
            <span>Afstand per week</span>
            <strong>{calculatorResult.weeklyDistance} km</strong>
          </div>
          <div className="calculator-metric">
            <span>CO2 per week</span>
            <strong>{calculatorResult.weeklyEmission} kg CO2e</strong>
          </div>
          <div className="calculator-metric">
            <span>CO2 per maand</span>
            <strong>{calculatorResult.monthlyEmission} kg CO2e</strong>
          </div>
          <div className="calculator-metric">
            <span>CO2 per jaar</span>
            <strong>{calculatorResult.yearlyEmission} kg CO2e</strong>
          </div>
        </div>

        <div className="calculator-placeholder">
          <span>Hoe werkt dit?</span>
          Deze mockup gebruikt een simpele formule:
          {" "}
          afstand per rit x ritten per week x uitstootfactor per kilometer.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Calculator
