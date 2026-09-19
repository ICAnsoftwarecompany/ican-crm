export function createAfterMeetingInitialValues(template) {
  return Object.fromEntries((template?.fields || []).map((field) => [field.key, '']))
}

export function createAfterMeetingEditableTemplate(template, t) {
  if (!template) return null

  const defaultHeading = t('activities.meetingDrawer.afterMeetingReportLabel')

  return {
    ...template,
    headerTitle: template.title || defaultHeading,
    headerSubtitle: template.description || '',
    reportHeading: defaultHeading,
    fields: (template.fields || []).map((field) => ({
      ...field,
      label: field.label,
    })),
  }
}

export function hasAfterMeetingValues(values = {}) {
  return Object.values(values).some((value) => String(value || '').trim())
}

export function validateAfterMeetingRequiredFields(template, values = {}) {
  return (template?.fields || []).find(
    (field) => field.required && !String(values[field.key] || '').trim(),
  )
}

export function buildAfterMeetingReportText(template, values = {}, options = {}, t) {
  const heading = String(options.reportHeading || template?.reportHeading || '').trim()
  const templateTitle = String(template?.headerTitle || template?.title || '').trim()
  const templateSubtitle = String(template?.headerSubtitle || '').trim()
  const meetingTitle = String(options.meetingTitle || '').trim()
  const elapsedDuration = String(options.elapsedDuration || '').trim()
  const lines = []

  if (heading) lines.push(heading)
  if (templateTitle) lines.push(t('activities.afterMeetingReport.templateLine', { value: templateTitle }))
  if (meetingTitle) lines.push(t('activities.afterMeetingReport.meetingLine', { value: meetingTitle }))
  if (elapsedDuration) lines.push(t('activities.afterMeetingReport.elapsedDurationLabel', { value: elapsedDuration }))
  if (templateSubtitle) lines.push(templateSubtitle)

  ;(template.fields || []).forEach((field) => {
    const value = String(values[field.key] || '').trim()
    if (!value) return

    lines.push('', `${field.label}:`, value)
  })

  return lines.join('\n')
}
