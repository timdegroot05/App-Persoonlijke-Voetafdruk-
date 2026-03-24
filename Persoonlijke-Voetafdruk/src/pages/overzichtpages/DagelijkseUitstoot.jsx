import InfoPageLayout from "../../components/InfoPageLayout"

function DagelijkseUitstoot() {
  return (
    <InfoPageLayout
      title="Dagelijkse uitstoot"
      icon="📅"
      value="10 kg CO2"
      subtitle="Gemiddeld per dag"
      text="Dit is een schatting van de hoeveelheid CO2 die jij gemiddeld op één dag uitstoot op basis van jouw antwoorden."
      detailTitle="Waarom is dit belangrijk?"
      detailText="Door je dagelijkse uitstoot te bekijken, krijg je sneller inzicht in welke gewoontes de meeste invloed hebben. Kleine veranderingen per dag kunnen op lange termijn een groot verschil maken."
    />
  )
}

export default DagelijkseUitstoot