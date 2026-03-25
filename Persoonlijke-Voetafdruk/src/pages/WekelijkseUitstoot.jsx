import InfoPageLayout from "../components/InfoPageLayout"

function WekelijkseUitstoot() {
  return (
    <InfoPageLayout
      title="Wekelijkse uitstoot"
      icon="📊"
      value="70 kg CO2"
      subtitle="Totaal per week"
      text="Dit is jouw geschatte CO2-uitstoot over een volledige week."
      detailTitle="Hoe lees je dit?"
      detailText="Deze waarde bundelt jouw dagelijkse keuzes in vervoer, voeding en energieverbruik. Zo zie je beter wat jouw totale impact is over meerdere dagen."
    />
  )
}

export default WekelijkseUitstoot