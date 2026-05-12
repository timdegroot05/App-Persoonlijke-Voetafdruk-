const WEEKLY_RESULTS_KEY = "weekly-results-history"
const NL_TIMEZONE = "Europe/Amsterdam"

function pad2(value) {
  return String(value).padStart(2, "0")
}

function roundEmission(value) {
  return Number((Number(value) || 0).toFixed(1))
}

function getAmsterdamDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: NL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  })

  const parts = formatter.formatToParts(date)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: map.weekday,
  }
}

function getUtcDateFromAmsterdamParts(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
}

function formatUtcDate(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate()
  )}`
}

function getIsoWeekInfoFromUtcDate(utcDate) {
  const target = new Date(utcDate.getTime())
  const day = target.getUTCDay() || 7

  target.setUTCDate(target.getUTCDate() + 4 - day)

  const isoYear = target.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7)

  return {
    year: isoYear,
    weekNumber,
  }
}

function getWeekRangeFromDate(date = new Date()) {
  const parts = getAmsterdamDateParts(date)
  const utcDate = getUtcDateFromAmsterdamParts(parts)
  const day = utcDate.getUTCDay() || 7
  const monday = new Date(utcDate.getTime())
  monday.setUTCDate(utcDate.getUTCDate() - (day - 1))

  const sunday = new Date(monday.getTime())
  sunday.setUTCDate(monday.getUTCDate() + 6)

  const isoWeek = getIsoWeekInfoFromUtcDate(utcDate)

  return {
    year: isoWeek.year,
    weekNumber: isoWeek.weekNumber,
    weekStart: formatUtcDate(monday),
    weekEnd: formatUtcDate(sunday),
  }
}

function getWeekRangeFromWeekStart(weekStart) {
  return getWeekRangeFromDate(new Date(`${weekStart}T00:00:00Z`))
}

function isAmsterdamMonday(date = new Date()) {
  return getAmsterdamDateParts(date).weekday === "Mon"
}

export function getCurrentWeekInfo(date = new Date()) {
  return getWeekRangeFromDate(date)
}

export function getPreviousWeekInfo(date = new Date()) {
  const currentWeek = getCurrentWeekInfo(date)
  const currentMondayUtc = new Date(`${currentWeek.weekStart}T00:00:00Z`)
  const previousWeekDate = new Date(currentMondayUtc.getTime())
  previousWeekDate.setUTCDate(currentMondayUtc.getUTCDate() - 7)

  return getWeekRangeFromDate(previousWeekDate)
}

export function getWeeklyCheckinWeekInfo(date = new Date()) {
  // Weekly check-ins always belong to the most recently completed week,
  // so users never fill in a week that is still in progress.
  return getPreviousWeekInfo(date)
}

export function getStoredWeeklyResults(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(WEEKLY_RESULTS_KEY)) || []
  } catch {
    return []
  }
}

export function saveStoredWeeklyResults(results, storage = localStorage) {
  storage.setItem(WEEKLY_RESULTS_KEY, JSON.stringify(results))
  return results
}

export function hasWeeklyResultForWeek(results, weekInfo) {
  return results.some(
    (item) => item.year === weekInfo.year && item.weekNumber === weekInfo.weekNumber
  )
}

export function shouldShowWeeklyCheckinPopup(results, date = new Date()) {
  if (!isAmsterdamMonday(date)) {
    return false
  }

  return !hasWeeklyResultForWeek(results, getPreviousWeekInfo(date))
}

export function buildWeeklyResult(emissionResult, weekInfo) {
  return {
    year: weekInfo.year,
    weekNumber: weekInfo.weekNumber,
    weekStart: weekInfo.weekStart,
    weekEnd: weekInfo.weekEnd,
    totalEmission: roundEmission(emissionResult?.totale_weekuitstoot),
    backgroundImpact: roundEmission(emissionResult?.achtergrondimpact),
    homeEmission: roundEmission(emissionResult?.aangepaste_woninguitstoot),
    transportEmission: roundEmission(
      emissionResult?.categories?.transport ??
        ((emissionResult?.auto_uitstoot || 0) + (emissionResult?.ov_uitstoot || 0))
    ),
    foodEmission: roundEmission(emissionResult?.voeding_uitstoot),
    consumptionEmission: roundEmission(emissionResult?.consumptie_uitstoot),
    createdAt: new Date().toISOString(),
  }
}

export function upsertWeeklyResult(results, weeklyResult) {
  const nextResults = [...results]
  const existingIndex = nextResults.findIndex(
    (item) =>
      item.year === weeklyResult.year && item.weekNumber === weeklyResult.weekNumber
  )

  if (existingIndex >= 0) {
    nextResults[existingIndex] = {
      ...nextResults[existingIndex],
      ...weeklyResult,
      createdAt: new Date().toISOString(),
    }
  } else {
    nextResults.push(weeklyResult)
  }

  return nextResults.sort((first, second) => {
    const firstKey = `${first.year}-${pad2(first.weekNumber)}`
    const secondKey = `${second.year}-${pad2(second.weekNumber)}`
    return secondKey.localeCompare(firstKey)
  })
}

export function saveWeeklyResult(
  emissionResult,
  weekInfo = getWeeklyCheckinWeekInfo(),
  storage = localStorage
) {
  const currentResults = getStoredWeeklyResults(storage)
  const weeklyResult = buildWeeklyResult(emissionResult, weekInfo)
  const nextResults = upsertWeeklyResult(currentResults, weeklyResult)

  saveStoredWeeklyResults(nextResults, storage)
  return weeklyResult
}

export function compareWeeklyResults(currentWeek, previousWeek) {
  if (!currentWeek || !previousWeek) {
    return null
  }

  const difference = roundEmission(
    (currentWeek.totalEmission || 0) - (previousWeek.totalEmission || 0)
  )
  const percentageChange =
    previousWeek.totalEmission > 0
      ? roundEmission((difference / previousWeek.totalEmission) * 100)
      : 0
  const trend =
    difference > 0 ? "higher" : difference < 0 ? "lower" : "equal"

  return {
    difference,
    percentageChange,
    trend,
  }
}

export function buildWeeklyOverviewItems(results) {
  const sortedResults = [...results].sort((first, second) => {
    const firstKey = `${first.year}-${pad2(first.weekNumber)}`
    const secondKey = `${second.year}-${pad2(second.weekNumber)}`
    return secondKey.localeCompare(firstKey)
  })

  return sortedResults.map((week, index) => ({
    ...week,
    comparison: compareWeeklyResults(week, sortedResults[index + 1] || null),
  }))
}

export function formatWeekRangeLabel(weekStart, weekEnd) {
  const formatter = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  })

  return `${formatter.format(new Date(`${weekStart}T00:00:00Z`))} t/m ${formatter.format(
    new Date(`${weekEnd}T00:00:00Z`)
  )}`
}

export function getWeekInfoFromKey(weekKey) {
  return getWeekRangeFromWeekStart(weekKey)
}
