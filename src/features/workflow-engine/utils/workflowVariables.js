/**
 * Client-side PREVIEW ONLY. Replaces `{{variable.key}}` with sample values
 * so a "Send WhatsApp"/"Send Gmail" action's message field can show what
 * the text will roughly look like while editing.
 *
 * Real interpolation must happen server-side at send time, against the
 * actual record data — this function is never used to build the payload
 * sent to any API. See docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md
 * "Variable Resolution".
 */
export function previewInterpolateVariables(text, sampleValues = {}) {
  if (!text) return text
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const value = sampleValues[key]
    return value === undefined ? match : String(value)
  })
}

export function extractVariableKeys(text) {
  if (!text) return []
  const matches = text.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)
  return Array.from(matches, (match) => match[1])
}
