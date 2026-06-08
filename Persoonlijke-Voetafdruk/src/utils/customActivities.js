import { getAllActivityItems } from "../data/activityCatalog"
import { getStoredWeeklyResults, getWeeklyCheckinWeekInfo } from "./weeklyResults"

const STORAGE_KEY = "custom-activity-history"

function roundKg(value) {
  return Number((Number(value) || 0).toFixed(2))
}

function getItemLookup() {
  return Object.fromEntries(
    getAllActivityItems().map((item) => [item.id, item])
  )
}

export function getStoredCustomActivities(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function saveStoredCustomActivities(activities, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(activities))
  return activities
}

export function getCustomActivitiesForWeek(
  weekKey = getWeeklyCheckinWeekInfo().weekStart,
  storage = localStorage
) {
  return getStoredCustomActivities(storage)
    .filter((activity) => activity.weekKey === weekKey)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export function createCustomActivityEntry(
  item,
  quantity,
  weekKey = getWeeklyCheckinWeekInfo().weekStart,
  options = {}
) {
  const normalizedQuantity = Number(quantity)
  const tripType = options.tripType || "enkele-reis"
  const multiplier = options.multiplier || 1
  const destination = options.destination || ""
  const emission = item.positiveForestImpact
    ? 0
    : roundKg(normalizedQuantity * multiplier * item.emissionFactor)

  return {
    id: `${item.id}-${Date.now()}`,
    weekKey,
    itemId: item.id,
    label: item.label,
    sectionId: item.sectionId,
    sectionLabel: item.sectionLabel,
    resultCategory: item.resultCategory,
    quantity: normalizedQuantity,
    unit: item.unit,
    displayQuantity: roundKg(normalizedQuantity * multiplier),
    emissionFactor: item.emissionFactor,
    emission,
    positiveForestImpact: Boolean(item.positiveForestImpact),
    tripType,
    multiplier,
    destination,
    examples: item.examples || "",
    createdAt: new Date().toISOString(),
  }
}

export function addCustomActivity(entry, storage = localStorage) {
  const currentActivities = getStoredCustomActivities(storage)
  const nextActivities = [entry, ...currentActivities]
  saveStoredCustomActivities(nextActivities, storage)
  return entry
}

export function removeCustomActivity(activityId, storage = localStorage) {
  const nextActivities = getStoredCustomActivities(storage).filter(
    (activity) => activity.id !== activityId
  )
  saveStoredCustomActivities(nextActivities, storage)
  return nextActivities
}

export function getCustomActivityTotals(
  weekKey = getWeeklyCheckinWeekInfo().weekStart,
  storage = localStorage
) {
  const entries = getCustomActivitiesForWeek(weekKey, storage)

  return entries.reduce(
    (totals, entry) => {
      const emission = roundKg(entry.emission)

      if (entry.resultCategory === "transport") {
        totals.transportEmission = roundKg(totals.transportEmission + emission)
      } else if (entry.resultCategory === "food") {
        totals.foodEmission = roundKg(totals.foodEmission + emission)
      } else if (entry.resultCategory === "consumption") {
        totals.consumptionEmission = roundKg(totals.consumptionEmission + emission)
      }

      totals.totalEmission = roundKg(totals.totalEmission + emission)
      totals.positiveForestCount += entry.positiveForestImpact ? 1 : 0
      totals.entries.push(entry)

      return totals
    },
    {
      weekKey,
      totalEmission: 0,
      transportEmission: 0,
      foodEmission: 0,
      consumptionEmission: 0,
      positiveForestCount: 0,
      entries: [],
    }
  )
}

export function applyCustomActivitiesToWeeklyResult(
  weeklyResult,
  customTotals
) {
  if (!weeklyResult) {
    return null
  }

  const totals = customTotals || getCustomActivityTotals(weeklyResult.weekStart)

  return {
    ...weeklyResult,
    totalEmission: roundKg(weeklyResult.totalEmission + totals.totalEmission),
    transportEmission: roundKg(
      weeklyResult.transportEmission + totals.transportEmission
    ),
    foodEmission: roundKg(weeklyResult.foodEmission + totals.foodEmission),
    consumptionEmission: roundKg(
      weeklyResult.consumptionEmission + totals.consumptionEmission
    ),
    customActivityCount: totals.entries.length,
    positiveForestCount: totals.positiveForestCount,
    customActivityEmission: totals.totalEmission,
  }
}

export function getAugmentedWeeklyResults(storage = localStorage) {
  return getStoredWeeklyResults(storage).map((week) =>
    applyCustomActivitiesToWeeklyResult(
      week,
      getCustomActivityTotals(week.weekStart, storage)
    )
  )
}

export function getActivityCatalogItem(itemId) {
  return getItemLookup()[itemId] || null
}
