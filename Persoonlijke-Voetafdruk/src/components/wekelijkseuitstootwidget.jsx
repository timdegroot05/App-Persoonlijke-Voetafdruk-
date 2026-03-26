import InfoPageLayout from "./InfoPageLayout"
import "./WekelijkseUitstootWidget.css"

function WekelijkseUitstootWidget() {
  return (
    <InfoPageLayout
      title="Wekelijkse uitstoot"
      icon="📊"
      text={
        <>
          <p>Je wekelijkse CO2-uitstoot is gemiddeld <strong>12 kg</strong>.</p>
          <p>Dat is ongeveer gelijk aan een autorit van 60 km.</p>
        </>
      }
    />
  )
}

export default WekelijkseUitstootWidget