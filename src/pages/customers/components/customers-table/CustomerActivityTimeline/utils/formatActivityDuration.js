export function formatActivityDuration(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value) || value <= 0) return '-'

  const totalSeconds = Math.floor(value)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  if (days > 0) {
    if (hours > 0) return `${days} يوم و${hours} ساعة تقريبا`
    return `${days} يوم`
  }

  if (hours > 0) {
    if (minutes > 0) return `${hours} ساعة و${minutes} دقيقة`
    return `${hours} ساعة`
  }

  if (minutes > 0) {
    if (remainingSeconds > 0) return `${minutes} دقيقة و${remainingSeconds} ثانية`
    return `${minutes} دقيقة`
  }

  return `${remainingSeconds} ثانية`
}
