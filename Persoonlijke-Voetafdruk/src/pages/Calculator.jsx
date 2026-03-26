import BottomNav from "../components/BottomNav"

function Calculator() {
  return (
    <div className="calculator-page">
      <div className="calculator-card">
        <p className="section-label dark">Slim rekenen</p>
        <h1 className="calculator-title">CO2 Calculator</h1>
        <p className="calculator-text">
          Vergelijk hier snel hoe kleine keuzes je uitstoot kunnen verlagen.
        </p>

        <div className="calculator-highlight">
          <span>Snelle schatting</span>
          <strong>1 autorit van 10 km minder per dag scheelt al impact.</strong>
        </div>

        <div className="calculator-grid">
          <div className="calculator-metric">
            <span>Voeding</span>
            <strong>Lager met plantaardig</strong>
          </div>
          <div className="calculator-metric">
            <span>Vervoer</span>
            <strong>Fiets en OV helpen direct</strong>
          </div>
        </div>

        <div className="calculator-placeholder">
          <span>Volgende stap</span>
          Later kunnen we hier een echte invoercalculator met sliders of
          invulvelden plaatsen.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Calculator
