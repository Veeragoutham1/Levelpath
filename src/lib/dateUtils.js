const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export function getTodayIST() {
  const now = new Date()
  const istTime = new Date(now.getTime() + IST_OFFSET_MS)
  return istTime.toISOString().split('T')[0]
}

export function getISTDayOfWeek() {
  const now = new Date()
  const istTime = new Date(now.getTime() + IST_OFFSET_MS)
  return istTime.getUTCDay() // 0 = Sunday, 6 = Saturday
}

export function getYesterdayIST() {
  const now = new Date()
  const istTime = new Date(now.getTime() + IST_OFFSET_MS)
  istTime.setUTCDate(istTime.getUTCDate() - 1)
  return istTime.toISOString().split('T')[0]
}
