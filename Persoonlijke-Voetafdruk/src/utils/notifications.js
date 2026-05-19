const NOTIFICATION_SETTINGS_KEY = "notification-settings"
const WEEKLY_NOTIFICATION_KEY = "weekly-checkin-notification-week"
const DAILY_TIP_NOTIFICATION_KEY = "daily-tip-notification-date"

const defaultNotificationSettings = {
  weeklyCheckin: true,
  dailyTip: false,
}

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return "unsupported"
  }

  return Notification.permission
}

export function getNotificationSettings() {
  try {
    const storedSettings = JSON.parse(
      localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "{}"
    )

    return {
      ...defaultNotificationSettings,
      ...storedSettings,
    }
  } catch {
    return defaultNotificationSettings
  }
}

export function saveNotificationSettings(settings) {
  const nextSettings = {
    ...getNotificationSettings(),
    ...settings,
  }

  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(nextSettings))
  return nextSettings
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return "unsupported"
  }

  if (Notification.permission !== "default") {
    return Notification.permission
  }

  return Notification.requestPermission()
}

export function showAppNotification({ title, body, tag, requireInteraction = false }) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false
  }

  try {
    new Notification(title, {
      body,
      tag,
      icon: "/vite.svg",
      requireInteraction,
      silent: false,
    })

    return true
  } catch (error) {
    console.warn("Notificatie kon niet worden getoond:", error)
    return false
  }
}

export async function sendTestNotification() {
  const permission = await requestNotificationPermission()

  if (permission !== "granted") {
    return permission
  }

  const timestamp = new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const wasShown = showAppNotification({
    title: "Persoonlijke Voetafdruk",
    body: `Testmelding verzonden om ${timestamp}.`,
    tag: `notification-test-${Date.now()}`,
    requireInteraction: true,
  })

  return { permission, timestamp, wasShown }
}

export function maybeShowWeeklyCheckinNotification(weekInfo) {
  const settings = getNotificationSettings()

  if (!settings.weeklyCheckin || !weekInfo?.weekStart) {
    return false
  }

  if (localStorage.getItem(WEEKLY_NOTIFICATION_KEY) === weekInfo.weekStart) {
    return false
  }

  const wasShown = showAppNotification({
    title: "Weekcheck-in staat klaar",
    body: `Vul week ${weekInfo.weekNumber} in om je voetafdruk actueel te houden.`,
    tag: `weekly-checkin-${weekInfo.weekStart}`,
  })

  if (wasShown) {
    localStorage.setItem(WEEKLY_NOTIFICATION_KEY, weekInfo.weekStart)
  }

  return wasShown
}

export function maybeShowDailyTipNotification(tip) {
  const settings = getNotificationSettings()

  if (
    !settings.dailyTip ||
    !tip?.title ||
    !tip?.body ||
    !isNotificationSupported() ||
    Notification.permission !== "granted"
  ) {
    return false
  }

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  if (localStorage.getItem(DAILY_TIP_NOTIFICATION_KEY) === todayKey) {
    return false
  }

  const wasShown = showAppNotification({
    title: `Tip: ${tip.title}`,
    body: tip.body,
    tag: `daily-tip-${todayKey}`,
  })

  if (wasShown) {
    localStorage.setItem(DAILY_TIP_NOTIFICATION_KEY, todayKey)
  }

  return wasShown
}
