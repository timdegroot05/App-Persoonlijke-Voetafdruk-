import { useMemo } from "react"
import InfoPageLayout from "../components/InfoPageLayout"
import { getStoredWeeklyResults } from "../utils/weeklyResults"

function WekelijkseUitstoot() {
  const latestWeeklyResult = useMemo(() => getStoredWeeklyResults()[0] ?? null, [])
  const weeklyEmission = latestWeeklyResult?.totalEmission ?? 0

  return (
    <InfoPageLayout
      title="Wekelijkse uitstoot"
      icon="📊"
      text={`Dit is jouw geschatte CO2-uitstoot van de laatst opgeslagen week: ${weeklyEmission} kg CO2e.`}
    />
  )
}

export default WekelijkseUitstoot
