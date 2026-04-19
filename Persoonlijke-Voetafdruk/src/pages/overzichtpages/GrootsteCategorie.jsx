import { useMemo } from "react"
import InfoPageLayout from "../../components/InfoPageLayout"
import { buildImpactSnapshot, getFocusLabel } from "../../utils/impactInsights"
import {
  getLatestWeeklyAnswers,
  getProfileAnswers,
} from "../../utils/questionnaireStorage"

function GrootsteCategorie() {
  const profileAnswers = useMemo(() => getProfileAnswers(), [])
  const weeklyAnswers = useMemo(() => getLatestWeeklyAnswers(), [])
  const snapshot = useMemo(
    () => buildImpactSnapshot(profileAnswers, weeklyAnswers),
    [profileAnswers, weeklyAnswers]
  )
  const focusCategory = snapshot?.dominantCategory || "energie"
  const focusLabel = getFocusLabel(focusCategory)
  const focusValue = Number(snapshot?.categories?.[focusCategory]?.toFixed?.(1) || 0)

  const detailTextByCategory = {
    voeding:
      "Deze week komt het grootste deel uit voeding. Minder vlees en vaker plantaardig eten kunnen hier snel verschil maken.",
    transport:
      "Deze week komt het grootste deel uit transport. Minder autokilometers en slimmer reizen leveren hier meestal de meeste winst op.",
    energie:
      "Deze week komt het grootste deel uit energiegebruik. Douchen, verwarming en bewust besparen wegen hier het zwaarst mee.",
    wonen:
      "Deze week komt het grootste deel uit wonen. Je woningtype, isolatie en energiebron hebben hier de meeste invloed.",
    consumptie:
      "Deze week komt het grootste deel uit consumptie. Nieuwe aankopen zoals kleding of elektronica kunnen dit snel verhogen.",
  }

  return (
    <InfoPageLayout
      title="Grootste categorie"
      icon="🚗"
      text={`${focusLabel} is nu je grootste categorie met ${focusValue} kg CO2e per week. ${detailTextByCategory[focusCategory] || detailTextByCategory.energie}`}
    />
  )
}

export default GrootsteCategorie
